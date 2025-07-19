const libraryService = require('../services/libraryService');

/**
 * GET /api/library/books
 */
async function getAllBooks(req, res, next) {
  try {
    const list = await libraryService.getAllBooks();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/library/books/:id
 */
async function getBookById(req, res, next) {
  try {
    const b = await libraryService.getBookById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Book not found' });
    res.json(b);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/library/books
 */
async function createBook(req, res, next) {
  try {
    const b = await libraryService.createBook(req.body);
    res.status(201).json(b);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/library/books/:id
 */
async function updateBook(req, res, next) {
  try {
    const updated = await libraryService.updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/library/books/:id
 */
async function deleteBook(req, res, next) {
  try {
    const deleted = await libraryService.deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/library/books/:id/issue
 */
async function issueBook(req, res, next) {
  try {
    const { studentId, returnDate } = req.body;
    const updated = await libraryService.issueBook(req.params.id, studentId, returnDate);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/library/books/:id/return
 */
async function returnBook(req, res, next) {
  try {
    const { studentId } = req.body;
    const updated = await libraryService.returnBook(req.params.id, studentId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook
};
