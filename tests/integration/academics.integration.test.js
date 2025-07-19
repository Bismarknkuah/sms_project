// tests/integration/academics.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const AcademicRecord = require('../../src/models/AcademicRecord');
const User = require('../../src/models/User');

describe('Academics API', () => {
  let token;
  let recordId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // Clean and seed user & records
    await Promise.all([
      AcademicRecord.deleteMany({}),
      User.deleteMany({})
    ]);
    const user = new User({ username:'acaduser', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'acaduser', password:'pass123' });
    token = login.body.token;

    // Seed two academic records
    const a1 = await AcademicRecord.create({ type:'midterm', period:'2025S1', score:85 });
    const a2 = await AcademicRecord.create({ type:'final',   period:'2025S1', score:92 });
    recordId = a1._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('GET /api/academics/settings should list all records', async () => {
    const res = await request(app)
      .get('/api/academics/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/academics/report?type=midterm should filter by type', async () => {
    const res = await request(app)
      .get('/api/academics/report?type=midterm&period=2025S1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe('midterm');
  });
});
