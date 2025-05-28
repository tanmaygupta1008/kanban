require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes

// const { generateKey } = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/auth', authRoutes); // All auth routes will be prefixed with /api/auth
app.use('/projects', projectRoutes); // New project routes
app.use('/tasks', taskRoutes);     // New task routes
app.use('/resources', resourceRoutes); // Mount the resource routes
app.use('/users', userRoutes); // Mount the user routes


// Simple test route
app.get('/', (req, res) => {
  res.send('Kanban Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// // to generateKey
// JWT_token_gen = require('crypto').randomBytes(64).toString('hex');
// console.log(JWT_token_gen);