import React, { useState } from 'react';

const AlertPanel = ({ bins }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show bins that are critical (80%+)
  const alerts = bins
    .filter(b => b.fill_level >= 80)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  const hasAlerts = alerts.length > 0;

  return (
    <div style={containerStyle}>
      <button 
        style={{
          ...buttonStyle,
          background: hasAlerts ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: hasAlerts ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: hasAlerts ? '#ef4444' : '#94a3b8', fontSize: '16px' }}>
          {hasAlerts ? '●' : '○'}
        </span>
        <span style={buttonTextStyle}>System Alerts</span>
        {hasAlerts && <span style={badgeStyle}>{alerts.length}</span>}
      </button>

      {isOpen && hasAlerts && (
        <div style={dropdownStyle}>
          <div style={headerStyle}>
            Active Critical Issues
          </div>
          <div style={listStyle} className="alert-list">
            {alerts.map(bin => {
              const color = bin.fill_level >= 80 ? '#ef4444' : '#f59e0b';
              return (
                <div key={bin.id} style={itemStyle}>
                  <div style={{ ...statusIndicator, background: color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={nameStyle}>{bin.name}</div>
                    <div style={metaStyle}>
                      <span style={{ color }}>{bin.fill_level}% Capacity</span>
                      <span style={{ color: bin.prediction?.urgent ? '#ef4444' : '#94a3b8' }}>
                        ETA: {bin.prediction?.eta ?? 'N/A'}
                      </span>
                    </div>
                    <div style={progressContainer}>
                      <div style={{ ...progressFill, width: `${bin.fill_level}%`, background: color }} />
                    </div>
                  </div>
                  <div style={scoreBadge}>
                    <span style={{ fontSize: '10px', opacity: 0.6, marginRight: '4px' }}>PRIORITY</span>
                    {bin.priority_score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isOpen && !hasAlerts && (
        <div style={dropdownStyle}>
          <div style={{ ...headerStyle, borderBottom: 'none', textAlign: 'center', padding: '20px' }}>
            <div style={{ opacity: 0.5, fontSize: '12px' }}>All systems nominal. No active alerts.</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 16px',
  borderRadius: '10px',
  border: '1px solid',
  backdropFilter: 'blur(12px)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
};

const buttonTextStyle = {
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const badgeStyle = {
  background: '#ef4444',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 800,
  borderRadius: '6px',
  padding: '1px 6px',
  marginLeft: '4px',
};

const dropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 12px)',
  right: '0',
  width: '300px',
  background: 'rgba(15, 15, 25, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
  overflow: 'hidden',
  animation: 'slideDown 0.2s ease-out',
};

const headerStyle = {
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#94a3b8',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  background: 'rgba(255, 255, 255, 0.02)',
};

const listStyle = {
  maxHeight: '400px',
  overflowY: 'auto',
  padding: '4px 0',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  transition: 'background 0.2s ease',
};

const statusIndicator = {
  width: '4px',
  height: '32px',
  borderRadius: '2px',
  marginTop: '2px',
};

const nameStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#f1f5f9',
  marginBottom: '4px',
};

const metaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '11px',
  marginBottom: '6px',
};

const progressContainer = {
  height: '4px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '2px',
  overflow: 'hidden',
};

const progressFill = {
  height: '100%',
  borderRadius: '2px',
  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
};

const scoreBadge = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#a78bfa',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

export default AlertPanel;
