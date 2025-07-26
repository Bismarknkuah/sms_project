const AdminService = require('../services/adminService');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};