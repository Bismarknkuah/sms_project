// tests/integration/grade.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Grade = require('../../src/models/Grade');
const User = require('../../src/models/User');

describe('Grade API', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Grade.deleteMany({}), User.deleteMany({})]);
    const user = new User({ username:'gradeuser', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'gradeuser', password:'pass123' });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/grade should create a grade entry', async () => {
    const payload = { gradeName:'A', minScore:90, maxScore:100 };
    const res = await request(app)
      .post('/api/grade')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.gradeName).toBe('A');
  });

  it('GET /api/grade should return list of grades', async () => {
    const res = await request(app)
      .get('/api/grade')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].gradeName).toBe('A');
  });
});
