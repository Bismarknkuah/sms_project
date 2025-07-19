// tests/integration/elearning.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Course = require('../../src/models/ECourse');
const User = require('../../src/models/User');

describe('E-learning API', () => {
  let token, courseId, studentId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Course.deleteMany({}), User.deleteMany({})]);
    // seed admin
    const admin = new User({ username:'elearnadmin', password:'pass123', role:'admin' });
    await admin.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'elearnadmin', password:'pass123' });
    token = login.body.token;
    // seed a course
    const course = await Course.create({
      name:'Math 101',
      teacherId: admin._id,
      students: []
    });
    courseId = course._id.toString();
    // seed a student user
    const student = new User({ username:'stud', password:'pass123', role:'student' });
    await student.save();
    studentId = student._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/elearning should create a course', async () => {
    const res = await request(app)
      .post('/api/elearning')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'Science 101', teacherId: studentId });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Science 101');
  });

  it('GET /api/elearning should list courses', async () => {
    const res = await request(app)
      .get('/api/elearning')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/elearning/:id/enroll should enroll student', async () => {
    const res = await request(app)
      .post(`/api/elearning/${courseId}/enroll`)
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId });
    expect(res.status).toBe(200);
    expect(res.body.students).toContain(studentId);
  });

  it('GET /api/elearning/student/:studentId/courses should return enrolled', async () => {
    const res = await request(app)
      .get(`/api/elearning/student/${studentId}/courses`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(c => c._id === courseId)).toBe(true);
  });
});
