const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');

router.get('/', binController.getBins);
router.get('/critical', binController.getCriticalBins);
router.get('/optimize-route', binController.getOptimizedRoute);
router.post('/update', binController.updateBin);
router.post('/collect', binController.collectBins);

module.exports = router;
