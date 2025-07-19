// tests/integration/analytics.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const AnalyticsConfig = require('../../src/models/AnalyticsConfig');
const Student = require('../../src/models/Student');
const FinanceTransaction = require('../../src/models/FinanceTransaction');
const User = require('../../src/models/User');

describe('Analytics API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([
      AnalyticsConfig.deleteMany({}),
      Student.deleteMany({}),
      FinanceTransaction.deleteMany({}),
      User.deleteMany({})
    ]);
    // seed data
    const user = new User({ username:'analyst', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'analyst', password:'pass123' });
    token = login.body.token;

    await Student.create([{ branch:'Accra Branch' }, { branch:'Accra Branch' }, { branch:'Assin Fosu' }]);
    await FinanceTransaction.create([
      { branch:'Accra Branch', amount:100 },
      { branch:'Assin Fosu',    amount:200 }
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('GET /api/analytics/enrollment should return grouped counts', async () => {
    const res = await request(app)
      .get('/api/analytics/enrollment')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const accra = res.body.find(r => r._id === 'Accra Branch');
    expect(accra.count).toBe(2);
  });

  it('GET /api/analytics/finance should return sums', async () => {
    const res = await request(app)
      .get('/api/analytics/finance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const assin = res.body.find(r => r._id === 'Assin Fosu');
    expect(assin.total).toBe(200);
  });
});
