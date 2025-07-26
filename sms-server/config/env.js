const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/st-andrews-sms',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secure-jwt-secret-key',
  EMAIL_USER: process.env.EMAIL_USER || 'st.andrews.shs@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'your-email-app-password',
  SUPER_ADMIN_ID: process.env.SUPER_ADMIN_ID || '60d5f8b8b9c1f2a3b4c5d6e7',
  SCHOOL_CONTACT: process.env.SCHOOL_CONTACT || '+233 55 123 4567',
  PAYMENT_OPTIONS: process.env.PAYMENT_OPTIONS || 'MTN Mobile Money, Vodafone Cash, Bank Transfer',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENVIRONMENT: process.env.NODE_ENV || 'development'
};