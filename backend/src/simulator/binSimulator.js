// Simulates IoT sensors updating the fill level of bins realistically over time.
const { getAllBins, updateBinFillLevel } = require('../models/binModel');

// 1. Time-based variation: Multipliers for different times of day
const getTimeMultiplier = () => {
  const hour = new Date().getHours();
  // Peak evening hours (18:00 - 22:00)
  if (hour >= 18 && hour <= 22) return 2.0;
  // Morning rush (08:00 - 10:00)
  if (hour >= 8 && hour <= 10) return 1.5;
  // Late night (00:00 - 05:00)
  if (hour >= 0 && hour <= 5) return 0.2;
  // Default daytime
  return 1.0;
};

// 2. Area-based behavior: Multipliers for different locations
const getAreaMultiplier = (areaType) => {
  switch (areaType) {
    case 'market': return 1.8;
    case 'residential': return 1.0;
    case 'low_traffic': return 0.4;
    default: return 1.0;
  }
};

const startSimulation = () => {
  console.log('🤖 Realistic IoT Bin Simulator started. City data flowing...');
  
  // Update every bin periodically
  setInterval(() => {
    const bins = getAllBins();
    const timeMultiplier = getTimeMultiplier();
    
    bins.forEach(bin => {
      // We only simulate if it hasn't completely overflown
      if (bin.fill_level < 100) {
        // 3. Controlled Randomness (between 0.0 and 2.0)
        const randomValue = Math.random() * 2;
        
        const areaMultiplier = getAreaMultiplier(bin.area_type);
        
        // 4. Smooth Growth Formula
        const increase = (bin.fill_rate * areaMultiplier * timeMultiplier) + randomValue;
        
        let newLevel = bin.fill_level + increase;
        
        // 5. Cap values at 100 maximum
        if (newLevel > 100) newLevel = 100;
        
        // Round to 1 decimal place to simulate a digital sensor reading comfortably
        newLevel = Math.round(newLevel * 10) / 10;
        
        // 6. Update Timestamp and save
        updateBinFillLevel(bin.id, newLevel);
        
        console.log(`📡 [${bin.area_type.toUpperCase()}] Bin ${bin.id} level: ${newLevel}% (+${increase.toFixed(1)}%)`);
      }
    });
  }, 5000); // Wait 5 seconds between update cycles
};

module.exports = { startSimulation };
