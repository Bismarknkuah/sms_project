// src/config/db.js
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGO_URI from environment variables.
 * Exports a function that returns the mongoose connection promise.
 */
function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not defined in environment');
  }
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

module.exports = connectDB;
