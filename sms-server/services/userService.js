const User = require('../models/User');

class UserService {
  static async getAllUsers() {
    try {
      return await User.find();
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  static async createUser(data) {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }
}

module.exports = UserService;