import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import BinMarker from './BinMarker';
import AlertPanel from './AlertPanel';
import RouteOverlay from './RouteOverlay';
import { fetchBins, fetchOptimizedRoute } from '../api/binApi';
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

  const handleAnimationComplete = () => {
    setIsPickingUp(false);
    // In a real app, we might trigger a backend update to empty the bins here
    console.log('Pick up complete!');
  };

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
            ⚡ Start Pick Up ({routeData.durationMinutes || '—'} min)
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
            <span>⏳ Est. Time</span><span>{routeData.durationMinutes || '—'} minutes</span>
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
            />
        )}

        {/* Hide target markers that are being picked up? No, keep them visible. */}
        {bins.map(bin => (
          <BinMarker key={bin.id} bin={bin} />
        ))}
      </Map>
    </div>
  );
};

export default MapView;
