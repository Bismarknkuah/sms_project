// tests/integration/communication.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Message = require('../../src/models/Message');
const User = require('../../src/models/User');

describe('Communication API', () => {
  let token, convId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // clean
    await Promise.all([Message.deleteMany({}), User.deleteMany({})]);
    // seed user
    const user = new User({ username:'commuser', password:'pass123', role:'admin' });
    await user.save();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username:'commuser', password:'pass123' });
    token = login.body.token;
    // seed a message thread
    const msg = await Message.create({ conversationId:'thread1', sender:'Alice', text:'Hello', time:new Date() });
    convId = msg.conversationId;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('GET /api/communication should list conversations', async () => {
    const res = await request(app)
      .get('/api/communication')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some(c => c._id === convId)).toBe(true);
  });

  it('GET /api/communication/:id should return messages', async () => {
    const res = await request(app)
      .get(`/api/communication/${convId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.messages.length).toBe(1);
    expect(res.body.messages[0].text).toBe('Hello');
  });

  it('POST /api/communication/:id/send should add a message', async () => {
    const res = await request(app)
      .post(`/api/communication/${convId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text:'Reply' });
    expect(res.status).toBe(201);
    const all = await Message.find({ conversationId: convId });
    expect(all.length).toBe(2);
  });
});
