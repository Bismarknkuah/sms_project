const TransportManagementService = require('../services/transportManagementService');

exports.getAllTransportManagements = async (req, res) => {
  try {
    const transportManagements = await TransportManagementService.getAllTransportManagements();
    res.json(transportManagements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTransportManagement = async (req, res) => {
  try {
    const transportManagement = await TransportManagementService.createTransportManagement(req.body);
    res.status(201).json(transportManagement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};