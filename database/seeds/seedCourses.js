const mongoose = require('mongoose');
const Course = require('../../sms-server/models/Course');
const Staff = require('../../sms-server/models/Staff');
const logger = require('../utils/logger');
const env = require('../../sms-server/config/env');

const seedCourse = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const branches = await require('./seedBranch')();
    const teachers = await Staff.find({ role: 'teacher' });

    const courses = await Course.insertMany([
      {
        title: 'General Arts',
        code: 'GA001',
        branchId: branches[0]._id,
        students: [],
        teachers: [teachers[0]._id],
        electiveSubjects: ['Economics', 'Geography', 'Literature', 'Government'],
        curriculumVersion: '2023'
      },
      {
        title: 'Science',
        code: 'SC002',
        branchId: branches[1]._id,
        students: [],
        teachers: [teachers[1]._id],
        electiveSubjects: ['Chemistry', 'Physics', 'Biology', 'Elective Math'],
        curriculumVersion: '2023'
      },
      {
        title: 'Business',
        code: 'BS003',
        branchId: branches[0]._id,
        students: [],
        teachers: [teachers[0]._id],
        electiveSubjects: ['Accounting', 'Costing', 'Business Management'],
        curriculumVersion: '2023'
      }
    ]);

    logger.info('Courses seeded successfully');
  } catch (error) {
    logger.error('Course seeding failed', { error: error.message });
    throw error;
  }
};

if (require.main === module) {
  seedCourse().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedCourse;