// src/routes/authRoutes.js
const express = require('express');
const { login } = require('../controllers/authController');
const router = express.Router();

// Public auth endpoint
router.post('/login', login);

module.exports = router;
