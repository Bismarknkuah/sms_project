const HouseManagementService = require('../services/houseManagementService');

exports.getAllHouseManagements = async (req, res) => {
  try {
    const houseManagements = await HouseManagementService.getAllHouseManagements();
    res.json(houseManagements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHouseManagement = async (req, res) => {
  try {
    const houseManagement = await HouseManagementService.createHouseManagement(req.body);
    res.status(201).json(houseManagement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};