import React, { useState } from 'react';
import { Marker, Popup } from 'react-map-gl/maplibre';

// Returns color based on fill level
const getBinColor = (fill_level) => {
  if (fill_level >= 80) return '#ef4444'; // red — critical
  if (fill_level >= 50) return '#f59e0b'; // amber — moderate
  return '#22c55e';                        // green — good
};

// Glowing SVG circle marker — larger outer ring when pinned
const BinIcon = ({ color, size = 18, pinned = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      filter: `drop-shadow(0 0 ${pinned ? 10 : 6}px ${color})`,
      cursor: 'pointer',
      transition: 'filter 0.2s ease',
    }}
  >
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity={pinned ? 0.4 : 0.2} />
    <circle cx="12" cy="12" r="6"  fill={color} />
  </svg>
);

const BinMarker = ({ bin }) => {
  const [hovering, setHovering] = useState(false);  // show on mouse enter
  const [pinned, setPinned]     = useState(false);  // lock open on click
  const showPopup = hovering || pinned;

  const color = getBinColor(bin.fill_level);
  const status = bin.fill_level >= 80 ? '🔴 Critical' : bin.fill_level >= 50 ? '🟡 Moderate' : '🟢 Normal';
  const prediction = bin.prediction || {};
  const priorityScore = bin.priority_score ?? '—';

  const handleClick = (e) => {
    e.originalEvent?.stopPropagation();
    setPinned(prev => !prev);
  };

  return (
    <>
      <Marker
        longitude={bin.lng}
        latitude={bin.lat}
        anchor="center"
        onClick={handleClick}
      >
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <BinIcon color={color} pinned={pinned} />
        </div>
      </Marker>

      {showPopup && (
        <Popup
          longitude={bin.lng}
          latitude={bin.lat}
          anchor="bottom"
          offset={16}
          onClose={() => { setHovering(false); setPinned(false); }}
          closeOnClick={false}
          style={{ zIndex: 10 }}
        >
          <div style={popupStyle}>
            <div style={popupTitle}>🗑️ {bin.name}</div>

            {/* Fill level row + bar */}
            <div style={popupRow}>
              <span>Fill Level</span>
              <span style={{ color, fontWeight: 700 }}>{bin.fill_level}%</span>
            </div>
            <div style={popupBar}>
              <div style={{ ...popupFill, width: `${bin.fill_level}%`, background: color }} />
            </div>

            {/* Status */}
            <div style={popupRow}><span>Status</span><span style={{ color }}>{status}</span></div>

            {/* Priority score */}
            <div style={popupRow}>
              <span>Priority Score</span>
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>⚡ {priorityScore}</span>
            </div>

            {/* Overflow prediction */}
            <div style={{ ...popupRow, marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              <span>⏳ Overflow ETA</span>
              <span style={{ color: prediction.urgent ? '#ef4444' : '#94a3b8', fontWeight: prediction.urgent ? 700 : 400 }}>
                {prediction.eta || '—'}
              </span>
            </div>

            {/* Area + ID */}
            <div style={popupRow}><span>Area</span><span>{bin.area_type}</span></div>
            <div style={popupRow}><span>ID</span><span style={{ opacity: 0.4 }}>{bin.id}</span></div>
          </div>
        </Popup>
      )}
    </>
  );
};

// Inline styles
const popupStyle = { background: '#0f0f1e', color: '#e2e8f0', padding: '12px 14px', borderRadius: '10px', minWidth: '210px', fontFamily: 'system-ui, sans-serif', fontSize: '13px' };
const popupTitle = { fontWeight: 700, fontSize: '14px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' };
const popupRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.9 };
const popupBar = { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '4px 0 8px', overflow: 'hidden' };
const popupFill = { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' };

export default BinMarker;
