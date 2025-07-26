const LibraryManagementService = require('../services/libraryManagementService');

exports.getAllLibraryManagements = async (req, res) => {
  try {
    const libraryManagements = await LibraryManagementService.getAllLibraryManagements();
    res.json(libraryManagements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLibraryManagement = async (req, res) => {
  try {
    const libraryManagement = await LibraryManagementService.createLibraryManagement(req.body);
    res.status(201).json(libraryManagement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};