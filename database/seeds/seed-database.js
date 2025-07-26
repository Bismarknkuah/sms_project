const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const env = require('../../sms-server/config/env');

const seedBranch = require('./seedBranch');
const seedUser = require('./seedUser');
const seedCourse = require('./seedCourse');
const seedAttendance = require('./attendanceSeed');
const seedFinance = require('./financeSeed');
const seedCommunication = require('./communicationSeed');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    logger.info('Starting database seeding process...');

    // Clear existing data
    await Promise.all([
      mongoose.connection.db.dropCollection('branches'),
      mongoose.connection.db.dropCollection('users'),
      mongoose.connection.db.dropCollection('headmasters'),
      mongoose.connection.db.dropCollection('staff'),
      mongoose.connection.db.dropCollection('students'),
      mongoose.connection.db.dropCollection('houses'),
      mongoose.connection.db.dropCollection('courses'),
      mongoose.connection.db.dropCollection('attendances'),
      mongoose.connection.db.dropCollection('finances'),
      mongoose.connection.db.dropCollection('communications')
    ]).catch(err => logger.warn('Some collections may not exist yet', { error: err.message }));

    // Seed data in sequence
    await seedBranch();
    await seedUser();
    await seedCourse();
    await seedAttendance();
    await seedFinance();
    await seedCommunication();

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;