const mongoose = require('mongoose');
const Communication = require('../../sms-server/models/Communication');
const User = require('../../sms-server/models/User');
const env = require('../../sms-server/config/env');
const logger = require('../utils/logger');

const seedCommunication = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const users = await User.find();
    const communicationData = [];

    for (const user of users) {
      const communication = {
        senderId: user._id,
        recipientIds: users.filter(u => u._id.toString() !== user._id.toString()).map(u => u._id),
        message: `Update from ${user.fullName} regarding branch activities on ${new Date().toDateString()}`,
        type: ['email', 'sms', 'notice'][Math.floor(Math.random() * 3)],
        branchId: user.branchId || users[0].branchId,
        sentAt: new Date(),
        isRead: Math.random() > 0.5
      };
      communicationData.push(communication);
    }

    await Communication.insertMany(communicationData);
    logger.info('Communication data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Communication seeding failed', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  seedCommunication();
}

module.exports = seedCommunication;