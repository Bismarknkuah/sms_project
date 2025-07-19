// tests/integration/finance.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const FinanceTransaction = require('../../src/models/FinanceTransaction');
const User = require('../../src/models/User');

describe('Finance API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([FinanceTransaction.deleteMany({}), User.deleteMany({})]);
    const user = new User({ username:'finuser', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'finuser', password:'pass123' });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/finance should record a transaction', async () => {
    const payload = { studentId:'S200', branch:'Accra Branch', amount:750, date:'2025-07-01' };
    const res = await request(app)
      .post('/api/finance')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(750);
  });

  it('GET /api/finance should return transactions', async () => {
    const res = await request(app)
      .get('/api/finance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].branch).toBe('Accra Branch');
  });
});
