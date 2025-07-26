const WebSocket = require('ws');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Communication = require('../models/Communication');
const Attendance = require('../models/Attendance');
const Finance = require('../models/Finance');
const env = require('../config/env');
const logger = require('../utils/logger');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', async (ws, req) => {
  const token = req.headers['sec-websocket-protocol']?.split(',')[0];
  let user = null;

  try {
    if (!token) throw new Error('Authentication token required');
    const decoded = jwt.verify(token, env.JWT_SECRET);
    user = await User.findById(decoded.userId).select('-password').populate('branchId');

    if (!user) throw new Error('Invalid user');
    if (user.branchId && !user.branchId.isActive) throw new Error('Branch inactive');

    ws.userId = user._id;
    ws.role = user.role;
    ws.branchId = user.branchId?._id;

    logger.info('WebSocket connection established', { userId: user._id, role: user.role });
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to notification service' }));
  } catch (error) {
    logger.error('WebSocket authentication failed', { error: error.message });
    ws.send(JSON.stringify({ type: 'error', message: error.message }));
    ws.close(1008, 'Authentication failed');
    return;
  }

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        if (data.event === 'attendance') {
          ws.send(JSON.stringify({ type: 'subscription', event: 'attendance', status: 'subscribed' }));
        } else if (data.event === 'finance') {
          ws.send(JSON.stringify({ type: 'subscription', event: 'finance', status: 'subscribed' }));
        }
      }
    } catch (error) {
      logger.error('Invalid WebSocket message', { error: error.message });
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed', { userId: ws.userId });
  });

  // Real-time attendance updates
  const attendanceHandler = async () => {
    const changes = await Attendance.watch([{ $match: { operationType: { $in: ['insert', 'update'] } } }]);
    for await (const change of changes) {
      const attendance = await Attendance.findById(change.documentKey._id).populate('studentId').populate('branchId');
      if (attendance && attendance.studentId.branchId.toString() === ws.branchId?.toString()) {
        const parent = await User.findOne({ role: 'parent', 'studentId': attendance.studentId._id });
        if (parent && parent._id.toString() !== ws.userId.toString()) continue;

        ws.send(JSON.stringify({
          type: 'notification',
          event: 'attendance',
          message: `Student ${attendance.studentId.fullName} marked ${attendance.status} on ${attendance.date.toDateString()}`,
          details: attendance
        }));
      }
    }
  };

  // Real-time finance updates
  const financeHandler = async () => {
    const changes = await Finance.watch([{ $match: { operationType: { $in: ['insert', 'update'] } } }]);
    for await (const change of changes) {
      const finance = await Finance.findById(change.documentKey._id).populate('studentId').populate('branchId');
      if (finance && finance.studentId.branchId.toString() === ws.branchId?.toString()) {
        const parent = await User.findOne({ role: 'parent', 'studentId': finance.studentId._id });
        if (parent && parent._id.toString() !== ws.userId.toString()) continue;

        ws.send(JSON.stringify({
          type: 'notification',
          event: 'finance',
          message: `Finance update: ${finance.transactionType} status changed to ${finance.status} for ${finance.studentId.fullName}`,
          details: finance
        }));
      }
    }
  };

  // Start change streams
  attendanceHandler().catch(err => logger.error('Attendance change stream error', { error: err.message }));
  financeHandler().catch(err => logger.error('Finance change stream error', { error: err.message }));
});

wss.on('error', (error) => {
  logger.error('WebSocket server error', { error: error.message });
});

module.exports = wss;