import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import BinMarker from './BinMarker';
import AlertPanel from './AlertPanel';
import RouteOverlay from './RouteOverlay';
import { fetchBins, fetchOptimizedRoute, collectBins } from '../api/binApi';
import './MapView.css';

const MapView = () => {
  const [bins, setBins] = useState([]);
  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);

  // Poll bins every 5 seconds
  useEffect(() => {
    const loadBins = async () => {
      try {
        const data = await fetchBins();
        setBins(data);
        setError(null);
      } catch {
        setError('Backend offline — run: node server.js in /backend');
      }
    };
    loadBins();
    const interval = setInterval(loadBins, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOptimizeRoute = async () => {
    if (showRoute) {
      setShowRoute(false);
      setRouteData(null);
      setIsPickingUp(false);
      return;
    }
    setRouteLoading(true);
    try {
      const data = await fetchOptimizedRoute();
      setRouteData(data);
      setShowRoute(true);
    } catch {
      setError('Route optimization failed. Is the backend running?');
    } finally {
      setRouteLoading(false);
    }
  };

  const startPickUp = () => {
    setIsPickingUp(true);
  };

  const handleAnimationComplete = async () => {
    setIsPickingUp(false);
    if (!routeData || !routeData.stops) return;

    // Collect bin IDs (excluding depot stops)
    const binIds = routeData.stops
      .filter(s => s.id && s.id.startsWith('bin-'))
      .map(s => s.id);

    if (binIds.length > 0) {
      try {
        await collectBins(binIds);
        // Instant refresh after collection
        const updated = await fetchBins();
        setBins(updated);
      } catch (err) {
        console.error('Failed to empty bins:', err);
      }
    }
    console.log('Pick up complete!');
  };

  // Calculate duration at 30 km/h on the frontend for UI
  const getEstimatedMinutes = () => {
    if (!routeData || !routeData.totalDistanceKm) return 0;
    const dist = parseFloat(routeData.totalDistanceKm);
    
    // speed = 30 km/h -> 2 min per km
    const mins = Math.ceil(dist * 2); 
    return mins || 1; 
  };

  const estMins = getEstimatedMinutes();

  return (
    <div className="map-wrapper">
      {error && <div className="map-error-banner">{error}</div>}

      {/* Alert sidebar */}
      <AlertPanel bins={bins} />

      {/* Control Buttons */}
      <div className="control-group">
        <button
          className={`route-btn ${showRoute ? 'route-btn--active' : ''}`}
          onClick={handleOptimizeRoute}
          disabled={routeLoading || isPickingUp}
        >
          {routeLoading ? '⏳ Planning...' : showRoute ? '✕ Clear Route' : '🚛 Optimize Route (80%+)'}
        </button>

        {showRoute && routeData && routeData.totalBins > 0 && !isPickingUp && (
          <button className="pickup-btn" onClick={startPickUp}>
            ⚡ Start Pick Up ({estMins} min)
          </button>
        )}
      </div>

      {/* Route summary panel */}
      {showRoute && routeData && (
        <div className="route-summary">
          <div className="route-summary__title">Sanitation Circle 1</div>
          <div className="route-summary__row">
            <span>🗑️ Targets</span><span>{routeData.totalBins} bins</span>
          </div>
          <div className="route-summary__row">
            <span>📍 Distance</span><span>{routeData.totalDistanceKm} km</span>
          </div>
          <div className="route-summary__row">
            <span>⏳ Est. Time (30km/h)</span><span>{estMins} minutes</span>
          </div>
          {isPickingUp && (
              <div className="route-summary__row" style={{ color: '#a78bfa', fontWeight: 700, marginTop: '8px' }}>
                🚛 Collection in Progress...
              </div>
          )}
        </div>
      )}

      <Map
        initialViewState={{
          longitude: 77.2167,
          latitude: 28.6315,
          zoom: 15,
          pitch: 52,
          bearing: -10,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        {showRoute && routeData && (
            <RouteOverlay 
                routeData={routeData} 
                isAnimating={isPickingUp} 
                onAnimationComplete={handleAnimationComplete}
                durationMinutes={estMins}
            />
        )}

        {bins.map(bin => (
          <BinMarker key={bin.id} bin={bin} />
        ))}
      </Map>
    </div>
  );
};

export default MapView;
