const LibraryService = require('../services/libraryService');

exports.getAllLibraries = async (req, res) => {
  try {
    const libraries = await LibraryService.getAllLibraries();
    res.json(libraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLibrary = async (req, res) => {
  try {
    const library = await LibraryService.createLibrary(req.body);
    res.status(201).json(library);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};