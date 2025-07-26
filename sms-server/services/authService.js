const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
  static async login(username, password, role, branchId) {
    try {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password)) || user.role !== role) {
        throw new Error('Invalid credentials or role');
      }
      if (role !== 'super_admin' && user.branchId !== branchId) {
        throw new Error('Unauthorized branch');
      }
      const token = jwt.sign({ id: user._id, role, branchId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
      return { token, user: { role, branchId } };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  static async getUserInfo(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return await User.findById(decoded.id);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;