const binModel = require('../models/binModel');
const { calculatePriority, rankBins } = require('../services/priorityService');
const { predictOverflow } = require('../services/predictionService');
const { optimizeRoute } = require('../services/optimizationService');

// GET /api/bins — returns all bins with priority score + overflow prediction
const getBins = (req, res) => {
  const bins = binModel.getAllBins();

  const enriched = bins.map(bin => ({
    ...bin,
    priority_score: calculatePriority(bin),
    prediction: predictOverflow(bin),
  }));

  res.status(200).json(enriched);
};

// GET /api/critical-bins — bins that are >= 70% full OR will overflow in 30 mins
const getCriticalBins = (req, res) => {
  const bins = binModel.getAllBins();

  const critical = bins
    .map(bin => ({
      ...bin,
      priority_score: calculatePriority(bin),
      prediction: predictOverflow(bin),
    }))
    .filter(bin => bin.fill_level >= 70 || bin.prediction.urgent)
    .sort((a, b) => b.priority_score - a.priority_score);

  res.status(200).json(critical);
};

// POST /api/bins/update
const updateBin = (req, res) => {
  const { id, fill_level } = req.body;
  if (!id || fill_level === undefined) {
    return res.status(400).json({ error: 'Missing id or fill_level' });
  }
  const updatedBin = binModel.updateBinFillLevel(id, fill_level);
  if (updatedBin) {
    res.status(200).json(updatedBin);
  } else {
    res.status(404).json({ error: 'Bin not found' });
  }
};

// GET /api/optimize-route — greedy nearest-neighbor route for Sanitation Circle 1
const getOptimizedRoute = (req, res) => {
  const bins = binModel.getAllBins();
  const result = optimizeRoute(bins);
  res.status(200).json(result);
};

module.exports = { getBins, getCriticalBins, updateBin, getOptimizedRoute };
