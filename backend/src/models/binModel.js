// In-memory data store — All bins placed across Connaught Place, Central Delhi

let bins = [
  // Inner Circle — North
  { id: 'bin-001', area_type: 'market', name: 'CP Inner Circle - N',  lat: 28.6338, lng: 77.2168, fill_level: 10, fill_rate: 1.5, last_updated: Date.now() },
  // Inner Circle — East
  { id: 'bin-002', area_type: 'market', name: 'CP Inner Circle - E',  lat: 28.6318, lng: 77.2200, fill_level: 55, fill_rate: 1.4, last_updated: Date.now() },
  // Inner Circle — South
  { id: 'bin-003', area_type: 'market', name: 'CP Inner Circle - S',  lat: 28.6295, lng: 77.2168, fill_level: 85, fill_rate: 1.6, last_updated: Date.now() },
  // Inner Circle — West
  { id: 'bin-004', area_type: 'market', name: 'CP Inner Circle - W',  lat: 28.6316, lng: 77.2138, fill_level: 30, fill_rate: 1.3, last_updated: Date.now() },
  // Palika Bazaar (underground market - high traffic)
  { id: 'bin-005', area_type: 'market', name: 'Palika Bazaar',        lat: 28.6307, lng: 77.2165, fill_level: 70, fill_rate: 1.9, last_updated: Date.now() },
  // Rajiv Chowk Metro Exit
  { id: 'bin-006', area_type: 'market', name: 'Rajiv Chowk Metro',    lat: 28.6328, lng: 77.2197, fill_level: 90, fill_rate: 2.0, last_updated: Date.now() },
  // Outer Circle — Block A (NE)
  { id: 'bin-007', area_type: 'residential', name: 'CP Block A - NE', lat: 28.6350, lng: 77.2210, fill_level: 40, fill_rate: 0.9, last_updated: Date.now() },
  // Outer Circle — Janpath Junction
  { id: 'bin-008', area_type: 'market', name: 'Janpath Junction',     lat: 28.6265, lng: 77.2183, fill_level: 60, fill_rate: 1.7, last_updated: Date.now() },
  // Radial Road — Sansad Marg side
  { id: 'bin-009', area_type: 'low_traffic', name: 'Sansad Marg',     lat: 28.6345, lng: 77.2130, fill_level: 20, fill_rate: 0.5, last_updated: Date.now() },
  // Outer Circle — Block H (NW)
  { id: 'bin-010', area_type: 'residential', name: 'CP Block H - NW', lat: 28.6352, lng: 77.2148, fill_level: 45, fill_rate: 1.0, last_updated: Date.now() },
];

const getAllBins = () => bins;
const getBinById = (id) => bins.find(b => b.id === id);

const updateBinFillLevel = (id, newLevel) => {
  const bin = getBinById(id);
  if (bin) {
    bin.fill_level = newLevel;
    bin.last_updated = Date.now();
    return bin;
  }
  return null;
};

module.exports = { getAllBins, getBinById, updateBinFillLevel };
