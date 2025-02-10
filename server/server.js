const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: [
    'http://localhost:3000',                          
    'https://hospital-inventory-management.vercel.app'  
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',                          
      'https://hospital-inventory-management.vercel.app' 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true  
  }
});

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...', MONGODB_URI ? 'URI is set' : 'URI is missing');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

const inventoryRoutes = require('./routes/inventory');
const locationRoutes = require('./routes/locations');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/locations', locationRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS origins:', app.get('_cors').origin); 
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});