import React, { useEffect, useState, useRef } from 'react';
import { Source, Layer, Marker } from 'react-map-gl/maplibre';
import * as turf from '@turf/turf';

// Fetch road geometry from OSRM public API between each pair of consecutive stops
const fetchRoadGeometry = async (stops) => {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry; // GeoJSON LineString
    }
  } catch (err) {
    console.warn('OSRM unavailable, falling back to straight-line route', err);
  }

  // Fallback: straight-line GeoJSON if OSRM is offline
  return {
    type: 'LineString',
    coordinates: stops.map(s => [s.lng, s.lat]),
  };
};

const DepotIcon = () => (
  <div style={depotIconStyle}>🚛</div>
);

const RouteOverlay = ({ routeData, isAnimating, onAnimationComplete }) => {
  const [originalGeometry, setOriginalGeometry] = useState(null);
  const [displayGeometry, setDisplayGeometry] = useState(null);
  const [truckPos, setTruckPos] = useState(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!routeData || routeData.stops.length < 2) return;
    fetchRoadGeometry(routeData.stops).then(geo => {
        setOriginalGeometry(geo);
        setDisplayGeometry(geo); // initially show all
    });
  }, [routeData]);

  // Animation logic
  useEffect(() => {
    if (isAnimating && originalGeometry) {
        const line = turf.lineString(originalGeometry.coordinates);
        const totalDistance = turf.length(line); // in km
        const durationMs = (routeData.durationMinutes || 1) * 60 * 1000;
        
        const animate = (time) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const progress = (time - startTimeRef.current) / durationMs;

            if (progress >= 1) {
                setTruckPos(originalGeometry.coordinates[originalGeometry.coordinates.length - 1]);
                setDisplayGeometry(null); // hide path when done
                if (onAnimationComplete) onAnimationComplete();
                return;
            }

            const currentDist = progress * totalDistance;
            const point = turf.along(line, currentDist);
            const currentCoords = point.geometry.coordinates;
            setTruckPos(currentCoords);

            // "Vanishing path" — only show from current point to end
            try {
                const endPoint = turf.point(originalGeometry.coordinates[originalGeometry.coordinates.length - 1]);
                const sliced = turf.lineSlice(point, endPoint, line);
                setDisplayGeometry(sliced.geometry);
            } catch (e) {
                // fall back to original if slice fails at very start/end
                setDisplayGeometry(originalGeometry);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    } else {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        startTimeRef.current = null;
        setTruckPos(null);
        setDisplayGeometry(originalGeometry); // reset to full line when not picking up
    }

    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating, originalGeometry, routeData.durationMinutes]);

  if (!routeData || routeData.stops.length < 2) return null;

  const depot = routeData.depot;

  return (
    <>
      {/* Road route line */}
      {displayGeometry && (
        <Source id="route" type="geojson" data={{ type: 'Feature', geometry: displayGeometry }}>
          {/* Outer glow */}
          <Layer
            id="route-glow"
            type="line"
            paint={{
              'line-color': '#7c3aed',
              'line-width': 8,
              'line-opacity': 0.25,
              'line-blur': 4,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
          {/* Main route line */}
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#a855f7',
              'line-width': 3,
              'line-opacity': 0.9,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
          {/* Directional arrows */}
          <Layer
            id="route-arrows"
            type="symbol"
            layout={{
              'symbol-placement': 'line',
              'symbol-spacing': 50,
              'text-field': '>',
              'text-size': 18,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-rotate': 0,
              'text-keep-upright': false,
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            }}
            paint={{
              'text-color': '#d8b4fe',
              'text-halo-color': '#4c1d95',
              'text-halo-width': 2,
            }}
          />
        </Source>
      )}

      {/* Animated Truck Marker */}
      {truckPos && (
          <Marker longitude={truckPos[0]} latitude={truckPos[1]} anchor="center">
            <div style={animatedTruckStyle}>🚛</div>
          </Marker>
      )}

      {/* Direction number badges on each stop */}
      {routeData.stops
        .filter((s, i) => i > 0 && s.id !== 'depot-return')
        .map((stop, idx) => (
          <Marker key={`stop-${stop.id}`} longitude={stop.lng} latitude={stop.lat} anchor="center">
            <div style={{ ...stopBadgeStyle, background: '#7c3aed' }}>{idx + 1}</div>
          </Marker>
        ))}

      {/* Depot marker */}
      {depot && (
        <Marker longitude={depot.lng} latitude={depot.lat} anchor="center">
          <DepotIcon />
        </Marker>
      )}
    </>
  );
};

const depotIconStyle = { fontSize: '20px', filter: 'drop-shadow(0 0 8px #7c3aed)', cursor: 'default' };
const animatedTruckStyle = { fontSize: '28px', filter: 'drop-shadow(0 0 12px #a855f7)', zIndex: 50 };
const stopBadgeStyle = {
  width: '20px', height: '20px', borderRadius: '50%', color: '#fff', fontSize: '11px', fontWeight: 800,
  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.5)',
  boxShadow: '0 0 8px rgba(124,58,237,0.8)',
};

export default RouteOverlay;
