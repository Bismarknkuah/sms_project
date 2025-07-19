// tests/integration/hostel.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Hostel = require('../../src/models/Hostel');
const User = require('../../src/models/User');

describe('Hostel API', () => {
  let token, hostelId, studentId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Hostel.deleteMany({}), User.deleteMany({})]);
    // seed admin & student
    const admin = new User({ username:'hostadmin', password:'pass123', role:'admin' });
    const student = new User({ username:'hoststud', password:'pass123', role:'student' });
    await admin.save();
    await student.save();
    studentId = student._id.toString();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'hostadmin', password:'pass123' });
    token = login.body.token;
    // seed a hostel
    const h = await Hostel.create({ name:'Hostel A', capacity:50, students: [] });
    hostelId = h._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/hostel should create hostel', async () => {
    const res = await request(app)
      .post('/api/hostel')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'Hostel B', capacity:30 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Hostel B');
  });

  it('GET /api/hostel should list hostels', async () => {
    const res = await request(app)
      .get('/api/hostel')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/hostel/:id/assign should assign student', async () => {
    const res = await request(app)
      .post(`/api/hostel/${hostelId}/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId });
    expect(res.status).toBe(200);
    expect(res.body.students).toContain(studentId);
  });
});
