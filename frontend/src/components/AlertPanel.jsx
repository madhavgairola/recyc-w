import React from 'react';

const AlertPanel = ({ bins }) => {
  // Only show bins that are critical or have urgent overflow prediction
  const alerts = bins
    .filter(b => b.fill_level >= 70 || b.prediction?.urgent)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  if (alerts.length === 0) return null;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>⚠️ Alerts <span style={badgeStyle}>{alerts.length}</span></div>
      <div style={listStyle}>
        {alerts.map(bin => {
          const color = bin.fill_level >= 80 ? '#ef4444' : '#f59e0b';
          return (
            <div key={bin.id} style={itemStyle}>
              {/* colored left bar */}
              <div style={{ ...barStyle, background: color }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={nameStyle}>{bin.name}</div>
                <div style={metaStyle}>
                  <span style={{ color }}>{bin.fill_level}% full</span>
                  <span style={{ color: bin.prediction?.urgent ? '#ef4444' : '#94a3b8' }}>
                    ⏳ {bin.prediction?.eta ?? '—'}
                  </span>
                </div>
                {/* mini progress bar */}
                <div style={miniBarBg}>
                  <div style={{ ...miniBarFill, width: `${bin.fill_level}%`, background: color }} />
                </div>
              </div>
              <div style={{ ...scoreStyle, color: '#a78bfa' }}>⚡{bin.priority_score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Styles
const panelStyle = {
  position: 'absolute', top: '16px', right: '16px', zIndex: 100,
  background: 'rgba(10, 10, 25, 0.88)', backdropFilter: 'blur(12px)',
  border: '1px solid rgba(100, 50, 200, 0.25)', borderRadius: '12px',
  width: '230px', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0',
  overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};
const headerStyle = {
  padding: '10px 14px', fontSize: '13px', fontWeight: 700,
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex', alignItems: 'center', gap: '8px',
};
const badgeStyle = {
  background: '#ef4444', color: '#fff', fontSize: '11px',
  fontWeight: 700, borderRadius: '999px', padding: '1px 7px',
};
const listStyle = { maxHeight: '360px', overflowY: 'auto', padding: '6px 0' };
const itemStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '10px',
  padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
};
const barStyle = { width: '3px', borderRadius: '2px', alignSelf: 'stretch', flexShrink: 0 };
const nameStyle = { fontSize: '12px', fontWeight: 600, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const metaStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.85, marginBottom: '4px' };
const miniBarBg = { height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' };
const miniBarFill = { height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' };
const scoreStyle = { fontSize: '11px', fontWeight: 700, paddingTop: '2px', flexShrink: 0 };

export default AlertPanel;
