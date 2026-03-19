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
      // Toggle off
      setShowRoute(false);
      setRouteData(null);
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

  return (
    <div className="map-wrapper">
      {error && <div className="map-error-banner">{error}</div>}

      {/* Alert sidebar */}
      <AlertPanel bins={bins} />

      {/* Optimize Route Button */}
      <button
        className={`route-btn ${showRoute ? 'route-btn--active' : ''}`}
        onClick={handleOptimizeRoute}
        disabled={routeLoading}
      >
        {routeLoading ? '⏳ Planning...' : showRoute ? '✕ Clear Route' : '🚛 Optimize Route'}
      </button>

      {/* Route summary panel */}
      {showRoute && routeData && (
        <div className="route-summary">
          <div className="route-summary__title">Sanitation Circle 1</div>
          <div className="route-summary__row">
            <span>🗑️ Bins</span><span>{routeData.totalBins}</span>
          </div>
          <div className="route-summary__row">
            <span>📍 Distance</span><span>{routeData.totalDistanceKm} km</span>
          </div>
          <div className="route-summary__row">
            <span>🚛 Depot</span><span>Parliament St.</span>
          </div>
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
        {/* Route line + stop numbers (inside Map for proper projection) */}
        {showRoute && routeData && <RouteOverlay routeData={routeData} />}

        {/* Bin markers */}
        {bins.map(bin => (
          <BinMarker key={bin.id} bin={bin} />
        ))}
      </Map>
    </div>
  );
};

export default MapView;
