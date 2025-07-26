const StaffService = require('../services/staffService');

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await StaffService.getAllStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const staff = await StaffService.createStaff(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};