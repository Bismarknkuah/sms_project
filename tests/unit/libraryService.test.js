// tests/unit/libraryService.test.js
const Book = require('../../src/models/LibraryItem');
const libraryService = require('../../src/services/libraryService');

jest.mock('../../src/models/LibraryItem');

describe('libraryService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllBooks returns list', async () => {
    Book.find.mockResolvedValue(['b1','b2']);
    const result = await libraryService.getAllBooks();
    expect(Book.find).toHaveBeenCalled();
    expect(result).toEqual(['b1','b2']);
  });

  it('issueBook throws when no copies', async () => {
    Book.findById.mockResolvedValue({ availableCopies:0 });
    await expect(libraryService.issueBook('bid','sid','2025-12-31'))
      .rejects.toThrow('No copies available to issue');
  });
});
