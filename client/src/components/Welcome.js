// welcome.js - Welcome Page Controller
const path = require('path');

class WelcomeController {
  // Render welcome/homepage
  static getWelcomePage(req, res) {
    try {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    } catch (error) {
      console.error('Error loading welcome page:', error);
      res.status(500).json({
        success: false,
        message: 'Error loading welcome page'
      });
    }
  }

  // Handle welcome page data requests
  static getWelcomeData(req, res) {
    try {
      const welcomeData = {
        title: 'St. Andrews Senior High School',
        subtitle: 'School Management System',
        motto: 'Perseverance leads to success',
        features: [
          {
            id: 1,
            icon: 'fas fa-users',
            title: 'Student Management',
            description: 'Comprehensive student enrollment, attendance tracking, and academic progress monitoring across all branches.'
          },
          {
            id: 2,
            icon: 'fas fa-chalkboard-teacher',
            title: 'Teacher Portal',
            description: 'Dedicated teacher dashboard for grade management, lesson planning, and student communication.'
          },
          {
            id: 3,
            icon: 'fas fa-chart-line',
            title: 'Academic Analytics',
            description: 'Advanced reporting and analytics to track academic performance and institutional growth.'
          },
          {
            id: 4,
            icon: 'fas fa-money-bill-wave',
            title: 'Finance Management',
            description: 'Complete fee management, payment tracking, and financial reporting system.'
          },
          {
            id: 5,
            icon: 'fas fa-bus',
            title: 'Transport System',
            description: 'School transport management with route optimization and student safety tracking.'
          },
          {
            id: 6,
            icon: 'fas fa-book',
            title: 'Library Management',
            description: 'Digital library system with book inventory, borrowing records, and online resources.'
          },
          {
            id: 7,
            icon: 'fas fa-shield-alt',
            title: 'Security & Safety',
            description: 'Advanced security monitoring and safety protocols across all school premises.'
          },
          {
            id: 8,
            icon: 'fas fa-mobile-alt',
            title: 'Mobile Access',
            description: 'Full mobile compatibility for on-the-go access to all system features.'
          }
        ],
        branches: [
          {
            id: 1,
            name: 'Assin Fosu (Main Campus)',
            location: 'Assin Fosu, Central Region',
            isMain: true
          },
          {
            id: 2,
            name: 'Accra',
            location: 'Accra, Greater Accra Region',
            isMain: false
          },
          {
            id: 3,
            name: 'Dunkwa-on-Offin',
            location: 'Dunkwa-on-Offin, Central Region',
            isMain: false
          },
          {
            id: 4,
            name: 'Mankessim',
            location: 'Mankessim, Central Region',
            isMain: false
          },
          {
            id: 5,
            name: 'Sefwi Asawinso',
            location: 'Sefwi Asawinso, Western North Region',
            isMain: false
          },
          {
            id: 6,
            name: 'Takoradi',
            location: 'Takoradi, Western Region',
            isMain: false
          },
          {
            id: 7,
            name: 'New Edubiase',
            location: 'New Edubiase, Ashanti Region',
            isMain: false
          }
        ],
        socialLinks: {
          facebook: '#',
          twitter: '#',
          instagram: '#',
          linkedin: '#'
        },
        contact: {
          address: 'Login to view address',
          phone: 'Login to view contact details',
          email: 'Login to view email'
        }
      };

      res.json({
        success: true,
        data: welcomeData
      });
    } catch (error) {
      console.error('Error getting welcome data:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving welcome data'
      });
    }
  }

  // Handle contact form submissions (if needed)
  static handleContactForm(req, res) {
    try {
      const { name, email, message } = req.body;

      // Basic validation
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // In a real application, you would save this to a database
      // For now, just log it
      console.log('Contact form submission:', { name, email, message });

      res.json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      });
    } catch (error) {
      console.error('Error handling contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting contact form'
      });
    }
  }
}

module.exports = WelcomeController;