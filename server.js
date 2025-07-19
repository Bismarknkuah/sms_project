// server.js
require('dotenv').config();
const path    = require('path');
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const jwt     = require('jsonwebtoken');

// your route modules
const academicRoutes      = require('./academicRoutes');
const analyticsRoutes     = require('./analyticsRoutes');
const communicationRoutes = require('./communicationRoutes');
const elearningRoutes     = require('./elearningRoutes');
const financeRoutes       = require('./financeRoutes');
const libraryRoutes       = require('./libraryRoutes');
const staffRoutes         = require('./staffRoutes');
const studentRoutes       = require('./studentRoutes');
const transportRoutes     = require('./transportHostelRoutes');
const authRoutes          = require('./auth');        // assume you have auth.js exporting router

const app = express();

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve front-end
app.use(express.static(path.join(__dirname, 'public')));

// mount auth first
app.use('/api/auth', authRoutes);

// simple JWT auth middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = payload;
    next();
  });
});

// mount your APIs
app.use('/api/academics',      academicRoutes);
app.use('/api/analytics',      analyticsRoutes);
app.use('/api/communication',  communicationRoutes);
app.use('/api/elearning',      elearningRoutes);
app.use('/api/finance',        financeRoutes);
app.use('/api/library',        libraryRoutes);
app.use('/api/staff',          staffRoutes);
app.use('/api/student',        studentRoutes);
app.use('/api/transport',      transportRoutes);

// fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SMS API + UI running at http://localhost:${PORT}`);
});
