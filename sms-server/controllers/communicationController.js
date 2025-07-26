const CommunicationService = require('../services/communicationService');

exports.getAllCommunications = async (req, res) => {
  try {
    const communications = await CommunicationService.getAllCommunications();
    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendCommunication = async (req, res) => {
  try {
    const communication = await CommunicationService.sendCommunication(req.body);
    res.status(201).json(communication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};