const Library = require('../models/Library');

class LibraryService {
  static async getAllLibraries() {
    try {
      return await Library.find();
    } catch (error) {
      throw new Error('Failed to fetch libraries');
    }
  }

  static async createLibrary(data) {
    try {
      const library = new Library(data);
      return await library.save();
    } catch (error) {
      throw new Error('Failed to create library');
    }
  }
}

module.exports = LibraryService;