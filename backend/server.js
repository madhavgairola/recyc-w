const express = require('express');
const cors = require('cors');
require('dotenv').config();

const binRoutes = require('./src/routes/binRoutes');
const { startSimulation } = require('./src/simulator/binSimulator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bins', binRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('RECYC-W Backend is running!');
});

// Start Server & Simulator
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start fake IoT data generation
  startSimulation();
});
