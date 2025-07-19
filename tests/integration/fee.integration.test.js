// tests/integration/fee.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Fee = require('../../src/models/Fee');
const User = require('../../src/models/User');

describe('Fee API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Fee.deleteMany({}), User.deleteMany({})]);
    const user = new User({ username:'feeuser', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'feeuser', password:'pass123' });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/fee should create a fee record', async () => {
    const payload = { studentId:'S100', amount:500, dueDate:'2025-09-01', status:'Due' };
    const res = await request(app)
      .post('/api/fee')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe('S100');
  });

  it('GET /api/fee should list fee records', async () => {
    const res = await request(app)
      .get('/api/fee')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].amount).toBe(500);
  });
});
