// tests/integration/library.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Book = require('../../src/models/LibraryItem');
const User = require('../../src/models/User');

describe('Library API', () => {
  let token, bookId, studentId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Book.deleteMany({}), User.deleteMany({})]);
    // seed admin and student
    const admin = new User({ username:'libadmin', password:'pass123', role:'admin' });
    const student = new User({ username:'libstud', password:'pass123', role:'student' });
    await admin.save();
    await student.save();
    studentId = student._id.toString();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'libadmin', password:'pass123' });
    token = login.body.token;
    // seed a book
    const book = await Book.create({
      title:'Ghana History',
      author:'Author',
      category:'History',
      totalCopies:2,
      availableCopies:2,
      issues: []
    });
    bookId = book._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/library/books should add book', async () => {
    const res = await request(app)
      .post('/api/library/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title:'Math Text',
        author:'M. Author',
        category:'Math',
        totalCopies:1,
        availableCopies:1
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Math Text');
  });

  it('GET /api/library/books should list books', async () => {
    const res = await request(app)
      .get('/api/library/books')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/library/books/:id/issue should issue a copy', async () => {
    const res = await request(app)
      .post(`/api/library/books/${bookId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId, returnDate:'2025-10-01' });
    expect(res.status).toBe(200);
    expect(res.body.availableCopies).toBe(1);
  });

  it('POST /api/library/books/:id/return should return a copy', async () => {
    const res = await request(app)
      .post(`/api/library/books/${bookId}/return`)
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId });
    expect(res.status).toBe(200);
    expect(res.body.availableCopies).toBe(2);
  });
});
