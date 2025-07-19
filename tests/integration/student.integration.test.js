// tests/integration/student.integration.test.js
const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../../src/index');
const Student  = require('../../src/models/Student');
const User     = require('../../src/models/User');

describe('Student API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // clean up
    await Promise.all([Student.deleteMany({}), User.deleteMany({})]);
    // seed a user
    const user = new User({ username: 'stuuser', password: 'password123', role: 'admin' });
    await user.save();
    // login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'stuuser', password: 'password123' });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a new student', async () => {
    const studentData = {
      studentId: 'S001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      branch: 'Assin Fosu',
      class: 'Grade10',
      section: 'A'
    };
    const res = await request(app)
      .post('/api/student')
      .set('Authorization', `Bearer ${token}`)
      .send(studentData);
    expect(res.statusCode).toBe(201);
    expect(res.body.studentId).toBe('S001');
  });

  it('should list students', async () => {
    const res = await request(app)
      .get('/api/student')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].firstName).toBe('John');
  });
});
