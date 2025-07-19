// tests/integration/staff.integration.test.js
const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../../src/index');
const Staff    = require('../../src/models/Staff');
const User     = require('../../src/models/User');

describe('Staff API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // clean up
    await Promise.all([Staff.deleteMany({}), User.deleteMany({})]);
    // seed a user
    const user = new User({ username: 'staffuser', password: 'password123', role: 'admin' });
    await user.save();
    // login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'staffuser', password: 'password123' });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a new staff member', async () => {
    const staffData = {
      staffId: 'T001',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      branch: 'Accra Branch',
      role: 'teacher'
    };
    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${token}`)
      .send(staffData);
    expect(res.statusCode).toBe(201);
    expect(res.body.staffId).toBe('T001');
  });

  it('should list staff', async () => {
    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].firstName).toBe('Alice');
  });
});
