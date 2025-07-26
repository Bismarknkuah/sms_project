const mongoose = require('mongoose');
const Attendance = require('../../sms-server/models/Attendance');
const Student = require('../../sms-server/models/Student');
const env = require('../../sms-server/config/env');
const logger = require('../utils/logger');

const seedAttendance = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const students = await Student.find();
    const attendanceData = [];

    for (const student of students) {
      const attendance = {
        studentId: student._id,
        date: new Date('2025-07-01'),
        status: ['present', 'absent', 'late'][Math.floor(Math.random() * 3)],
        branchId: student.branchId,
        studentType: student.studentType,
        checkInTime: '08:00',
        checkOutTime: student.studentType === 'day' ? '14:00' : '17:00',
        remarks: Math.random() > 0.7 ? 'Late due to traffic' : ''
      };
      attendanceData.push(attendance);
    }

    await Attendance.insertMany(attendanceData);
    logger.info('Attendance data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Attendance seeding failed', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  seedAttendance();
}

module.exports = seedAttendance;