const Book = require('../models/LibraryItem');

/**
 * Fetch all books.
 */
async function getAllBooks() {
  return Book.find();
}

/**
 * Fetch one book by ID.
 */
async function getBookById(id) {
  return Book.findById(id);
}

/**
 * Create a new book entry.
 */
async function createBook(data) {
  return Book.create(data);
}

/**
 * Update book details by ID.
 */
async function updateBook(id, data) {
  return Book.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a book by ID.
 */
async function deleteBook(id) {
  return Book.findByIdAndDelete(id);
}

/**
 * Issue a book to a student.
 */
async function issueBook(bookId, studentId, returnDate) {
  const book = await Book.findById(bookId);
  if (book.availableCopies <= 0) {
    throw new Error('No copies available to issue');
  }
  book.availableCopies--;
  book.issues.push({ studentId, issueDate: new Date(), returnDate });
  return book.save();
}

/**
 * Return a previously issued book.
 */
async function returnBook(bookId, studentId) {
  const book = await Book.findById(bookId);
  book.availableCopies++;
  const issue = book.issues.find(i =>
    i.studentId.toString() === studentId && !i.returnedAt
  );
  if (issue) {
    issue.returnedAt = new Date();
    await book.save();
  }
  return book;
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
