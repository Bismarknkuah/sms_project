const LibraryManagement = require('../models/LibraryManagement');

class LibraryManagementService {
  static async getAllLibraryManagements() {
    try {
      return await LibraryManagement.find();
    } catch (error) {
      throw new Error('Failed to fetch library managements');
    }
  }

  static async createLibraryManagement(data) {
    try {
      const libraryManagement = new LibraryManagement(data);
      return await libraryManagement.save();
    } catch (error) {
      throw new Error('Failed to create library management');
    }
  }
}

module.exports = LibraryManagementService;