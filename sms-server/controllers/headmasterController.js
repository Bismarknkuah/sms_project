const HeadmasterService = require('../services/headmasterService');

exports.getAllHeadmasters = async (req, res) => {
  try {
    const headmasters = await HeadmasterService.getAllHeadmasters();
    res.json(headmasters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHeadmaster = async (req, res) => {
  try {
    const headmaster = await HeadmasterService.createHeadmaster(req.body);
    res.status(201).json(headmaster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};