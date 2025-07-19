// src/routes/libraryRoutes.js
const express = require('express');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook
} = require('../controllers/libraryController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Book catalog
router.get('/books', getAllBooks);
router.get('/books/:id', getBookById);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Issue & return endpoints
router.post('/books/:id/issue', issueBook);
router.post('/books/:id/return', returnBook);

module.exports = router;
