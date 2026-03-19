import React, { useEffect, useState } from 'react';
import { Source, Layer, Marker } from 'react-map-gl/maplibre';

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

// Depot icon (truck)
const DepotIcon = () => (
  <div style={depotIconStyle}>🚛</div>
);

const RouteOverlay = ({ routeData }) => {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!routeData || routeData.stops.length < 2) return;

    fetchRoadGeometry(routeData.stops).then(setGeometry);
  }, [routeData]);

  if (!routeData || routeData.stops.length < 2) return null;

  const depot = routeData.depot;

  return (
    <>
      {/* Road route line */}
      {geometry && (
        <Source id="route" type="geojson" data={{ type: 'Feature', geometry }}>
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
          {/* Directional arrows — auto-rotate along road geometry */}
          <Layer
            id="route-arrows"
            type="symbol"
            layout={{
              'symbol-placement': 'line',   // place along the line path
              'symbol-spacing': 80,          // one arrow every 80px
              'text-field': '▶',
              'text-size': 14,
              'text-rotate': 0,              // MapLibre handles rotation automatically
              'text-keep-upright': false,    // allow flipping for direction
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            }}
            paint={{
              'text-color': '#d8b4fe',       // light purple to match theme
              'text-halo-color': '#4c1d95',
              'text-halo-width': 1,
            }}
          />
        </Source>
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

const depotIconStyle = {
  fontSize: '20px',
  filter: 'drop-shadow(0 0 8px #7c3aed)',
  cursor: 'default',
};

const stopBadgeStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255,255,255,0.5)',
  boxShadow: '0 0 8px rgba(124,58,237,0.8)',
};

export default RouteOverlay;
