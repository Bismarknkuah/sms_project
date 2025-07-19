// src/config/auth.js

/**
 * JWT configuration: secret and signing options.
 * jwtSecret: used to sign/verify tokens
 * jwtOptions: token expiration settings
 */
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwtOptions: { expiresIn: '8h' }
};
