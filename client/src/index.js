// index.js - Server Entry Point
require('dotenv').config();
const app = require('./app');
const http = require('http');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer(app);

// Database connection (if using a database)
const initializeDatabase = async () => {
  try {
    // TODO: Add your database initialization here
    // Example for MongoDB:
    // const mongoose = require('mongoose');
    // await mongoose.connect(process.env.MONGODB_URI);
    // console.log('Connected to MongoDB');

    // Example for MySQL/PostgreSQL:
    // const db = require('./database');
    // await db.connect();
    // console.log('Connected to database');

    console.log('Database initialization completed (placeholder)');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize other services (Redis, email, etc.)
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Service initialization failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Initialize services first
    await initializeServices();

    // Start listening
    server.listen(PORT, HOST, () => {
      console.log('=================================');
      console.log(`🚀 St. Andrews SMS Server Started`);
      console.log('=================================');
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server URL: http://${HOST}:${PORT}`);
      console.log(`Process ID: ${process.pid}`);
      console.log(`Node Version: ${process.version}`);
      console.log('=================================');

      if (NODE_ENV === 'development') {
        console.log('📋 Available endpoints:');
        console.log(`   GET  /                    - Homepage`);
        console.log(`   GET  /login               - Login page`);
        console.log(`   POST /api/login           - Login API`);
        console.log(`   GET  /api/welcome-data    - Welcome data API`);
        console.log(`   GET  /api/branches        - Branches API`);
        console.log(`   GET  /api/students        - Students API`);
        console.log(`   GET  /api/teachers        - Teachers API`);
        console.log(`   GET  /health              - Health check`);
        console.log('=================================');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Handle successful server start
    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
      console.log(`Server listening on ${bind}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close((error) => {
    if (error) {
      console.error('Error during server shutdown:', error);
      process.exit(1);
    }

    console.log('Server closed successfully');

    // Close database connections and other cleanup
    // TODO: Add cleanup logic here

    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

module.exports = server;