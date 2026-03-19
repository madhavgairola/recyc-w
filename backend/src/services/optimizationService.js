// Sanitation Circle 1 — Connaught Place jurisdiction
// Greedy nearest-neighbor route optimization

const { haversineDistance } = require('../utils/distance');
const { calculatePriority } = require('./priorityService');

// Depot: NDMC Sanitation Circle 1 office — Parliament Street, CP
// (within jurisdiction: Parliament Street upto Patel Chowk)
const DEPOT = {
  id: 'depot',
  name: 'NDMC Circle 1 Depot (Parliament St.)',
  lat: 28.6295,
  lng: 77.2183,
};

// Collection threshold — only plan routes for bins at or above this level
const COLLECTION_THRESHOLD = 80;

/**
 * Greedy Nearest Neighbor algorithm.
 * Starting from the depot, always move to the closest unvisited bin.
 * Returns ordered array of stops: [depot, bin, bin, ..., depot]
 */
const optimizeRoute = (bins) => {
  // Filter to only bins that need collection (80%+)
  const candidates = bins
    .filter(b => b.fill_level >= COLLECTION_THRESHOLD)
    .map(b => ({ ...b, priority_score: calculatePriority(b) }));

  if (candidates.length === 0) {
    return { 
      stops: [DEPOT], 
      totalDistance: 0, 
      totalDistanceKm: "0.00",
      durationMinutes: 0,
      message: 'No bins require collection (all below 80%).' 
    };
  }

  const route = [DEPOT];
  const unvisited = [...candidates];
  let currentPos = DEPOT;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    unvisited.forEach((bin, idx) => {
      const dist = haversineDistance(currentPos.lat, currentPos.lng, bin.lat, bin.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    const nearest = unvisited.splice(nearestIdx, 1)[0];
    totalDistance += nearestDist;
    route.push(nearest);
    currentPos = nearest;
  }

  // Return to depot
  totalDistance += haversineDistance(currentPos.lat, currentPos.lng, DEPOT.lat, DEPOT.lng);
  route.push({ ...DEPOT, id: 'depot-return' });

  // Assume avg speed of 18 km/h (5 m/s) in Delhi traffic
  const avgSpeedMS = 5; 
  const durationSeconds = totalDistance / avgSpeedMS;
  const durationMinutes = Math.ceil(durationSeconds / 60);

  return {
    depot: DEPOT,
    stops: route,
    totalBins: candidates.length,
    totalDistance: Math.round(totalDistance), 
    totalDistanceKm: (totalDistance / 1000).toFixed(2),
    durationMinutes: durationMinutes,
    message: `Optimized route for ${candidates.length} critical bin(s) in Sanitation Circle 1`,
  };
};

module.exports = { optimizeRoute, DEPOT };
