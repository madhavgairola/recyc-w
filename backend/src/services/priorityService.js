// Priority Score = fill_level + time_penalty + area_weight
// Higher score = more urgently needs collection

const AREA_WEIGHTS = {
  market:      30, // markets generate trash faster → higher base priority
  residential: 15,
  low_traffic:  5,
};

const calculatePriority = (bin) => {
  const timeSinceUpdate = (Date.now() - bin.last_updated) / 1000 / 60; // minutes
  const timePenalty = Math.min(timeSinceUpdate * 0.5, 20); // cap at 20 pts
  const areaWeight = AREA_WEIGHTS[bin.area_type] || 10;

  const score = bin.fill_level + timePenalty + areaWeight;
  return Math.round(score * 10) / 10;
};

const rankBins = (bins) => {
  return bins
    .map(bin => ({ ...bin, priority_score: calculatePriority(bin) }))
    .sort((a, b) => b.priority_score - a.priority_score);
};

module.exports = { calculatePriority, rankBins };
