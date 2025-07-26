const AuthService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { username, password, role, branchId } = req.body;
    const { token, user } = await AuthService.login(username, password, role, branchId);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const user = await AuthService.getUserInfo(token);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};