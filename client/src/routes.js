// routes.js - Application Routes
const express = require('express');
const router = express.Router();
const WelcomeController = require('./welcome');
const path = require('path');

// Welcome/Homepage routes
router.get('/', WelcomeController.getWelcomePage);
router.get('/welcome', WelcomeController.getWelcomePage);
router.get('/home', WelcomeController.getWelcomePage);

// API routes for welcome page data
router.get('/welcome-data', WelcomeController.getWelcomeData);
router.post('/contact', WelcomeController.handleContactForm);

// Authentication routes
router.get('/login', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/login.html'));
  } catch (error) {
    console.error('Error loading login page:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading login page'
    });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // Basic validation
    if (!username || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and user type are required'
      });
    }

    // TODO: Implement proper authentication logic
    // This is just a placeholder for demonstration
    if (username === 'admin' && password === 'password') {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: 1,
          username: username,
          userType: userType,
          name: 'Administrator'
        },
        token: 'sample-jwt-token' // In production, generate actual JWT
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Dashboard routes (protected)
router.get('/dashboard', (req, res) => {
  // TODO: Add authentication middleware check
  try {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard'
    });
  }
});

// Student routes
router.get('/students', (req, res) => {
  // TODO: Add authentication middleware
  try {
    res.json({
      success: true,
      data: {
        students: [
          // Sample student data
          {
            id: 1,
            name: 'John Doe',
            class: 'Form 1A',
            branch: 'Assin Fosu (Main Campus)',
            status: 'Active'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// Teacher routes
router.get('/teachers', (req, res) => {
  // TODO: Add authentication middleware
  try {
    res.json({
      success: true,
      data: {
        teachers: [
          // Sample teacher data
          {
            id: 1,
            name: 'Jane Smith',
            subject: 'Mathematics',
            branch: 'Assin Fosu (Main Campus)',
            status: 'Active'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers'
    });
  }
});

// Branch routes
router.get('/branches', (req, res) => {
  try {
    const branches = [
      {
        id: 1,
        name: 'Assin Fosu (Main Campus)',
        location: 'Assin Fosu, Central Region',
        isMain: true,
        students: 450,
        teachers: 25
      },
      {
        id: 2,
        name: 'Accra',
        location: 'Accra, Greater Accra Region',
        isMain: false,
        students: 380,
        teachers: 22
      },
      {
        id: 3,
        name: 'Dunkwa-on-Offin',
        location: 'Dunkwa-on-Offin, Central Region',
        isMain: false,
        students: 320,
        teachers: 18
      },
      {
        id: 4,
        name: 'Mankessim',
        location: 'Mankessim, Central Region',
        isMain: false,
        students: 290,
        teachers: 16
      },
      {
        id: 5,
        name: 'Sefwi Asawinso',
        location: 'Sefwi Asawinso, Western North Region',
        isMain: false,
        students: 260,
        teachers: 15
      },
      {
        id: 6,
        name: 'Takoradi',
        location: 'Takoradi, Western Region',
        isMain: false,
        students: 410,
        teachers: 23
      },
      {
        id: 7,
        name: 'New Edubiase',
        location: 'New Edubiase, Ashanti Region',
        isMain: false,
        students: 350,
        teachers: 20
      }
    ];

    res.json({
      success: true,
      data: { branches }
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branches'
    });
  }
});

// Academic routes
router.get('/academics', (req, res) => {
  // TODO: Add authentication middleware
  try {
    res.json({
      success: true,
      data: {
        currentTerm: 'First Term 2024',
        totalStudents: 2460,
        totalTeachers: 139,
        totalClasses: 84,
        upcomingEvents: [
          {
            id: 1,
            title: 'Mid-term Examinations',
            date: '2024-08-15',
            type: 'examination'
          },
          {
            id: 2,
            title: 'Parent-Teacher Conference',
            date: '2024-08-22',
            type: 'meeting'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching academic data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching academic data'
    });
  }
});

// Finance routes
router.get('/finance', (req, res) => {
  // TODO: Add authentication middleware
  try {
    res.json({
      success: true,
      data: {
        totalRevenue: 1250000,
        pendingFees: 185000,
        paidFees: 1065000,
        expenses: 980000,
        recentTransactions: [
          {
            id: 1,
            studentName: 'John Doe',
            amount: 1500,
            type: 'Fee Payment',
            date: '2024-07-25',
            status: 'Completed'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching finance data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching finance data'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // TODO: Implement proper session/token invalidation
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// About page
router.get('/about', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/about.html'));
  } catch (error) {
    console.error('Error loading about page:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading about page'
    });
  }
});

module.exports = router;