const SuperAdminService = require('../services/superAdminService');

exports.getAllSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await SuperAdminService.getAllSuperAdmins();
    res.json(superAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdminService.createSuperAdmin(req.body);
    res.status(201).json(superAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};