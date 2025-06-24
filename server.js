const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());
app.use(express.json());

// Davis API credentials
const API_KEY = 'bvgu5bfmm99lvfrqhlffy3l8pmpbq26v';
const API_SECRET = 'lhcttqhmgxipv3zy8xgupadhbgowwcs1';
const STATION_ID = '92193';

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Davis Weather API is running',
    endpoints: {
      weather: '/api/davis-weather',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Davis weather endpoint
app.get('/api/davis-weather', async (req, res) => {
  try {
    console.log('Fetching Davis weather data for station:', STATION_ID);
    
    const apiUrl = `https://api.weatherlink.com/v2/current/${STATION_ID}?api-key=${API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Api-Secret': API_SECRET,
        'Accept': 'application/json',
        'User-Agent': 'Weather-Dashboard/1.0'
      }
    });

    console.log('WeatherLink API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WeatherLink API error:', errorText);
      throw new Error(`WeatherLink API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Successfully fetched weather data - sensors:', data.sensors ? data.sensors.length : 0);
    
    // Send response with CORS headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      station_id: STATION_ID
    });

  } catch (error) {
    console.error('Error fetching Davis data:', error.message);
    
    res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      station_id: STATION_ID
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: ['/api/davis-weather', '/health'],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Davis Weather API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Weather API: http://localhost:${PORT}/api/davis-weather`);
});
