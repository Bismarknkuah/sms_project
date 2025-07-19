// tests/integration/transport.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Transport = require('../../src/models/Transport');
const User = require('../../src/models/User');

describe('Transport API', () => {
  let token, routeId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Promise.all([Transport.deleteMany({}), User.deleteMany({})]);
    const admin = new User({ username:'transadmin', password:'pass123', role:'admin' });
    await admin.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'transadmin', password:'pass123' });
    token = login.body.token;
    const route = await Transport.create({
      routeName:'Route A',
      branch:'Accra Branch',
      driverName:'Driver',
      vehicleNumber:'XYZ123',
      capacity:20
    });
    routeId = route._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('POST /api/transport/routes should create route', async () => {
    const res = await request(app)
      .post('/api/transport/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        routeName:'Route B',
        branch:'Assin Fosu',
        driverName:'Driver B',
        vehicleNumber:'ABC456',
        capacity:30
      });
    expect(res.status).toBe(201);
    expect(res.body.routeName).toBe('Route B');
  });

  it('GET /api/transport/routes should list routes', async () => {
    const res = await request(app)
      .get('/api/transport/routes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /api/transport/routes/:id should remove route', async () => {
    const res = await request(app)
      .delete(`/api/transport/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
