const ITAdminService = require('../services/itAdminService');

exports.getAllITAdmins = async (req, res) => {
  try {
    const itAdmins = await ITAdminService.getAllITAdmins();
    res.json(itAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createITAdmin = async (req, res) => {
  try {
    const itAdmin = await ITAdminService.createITAdmin(req.body);
    res.status(201).json(itAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};