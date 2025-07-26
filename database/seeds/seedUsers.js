const mongoose = require('mongoose');
const User = require('../../sms-server/models/User');
const Staff = require('../../sms-server/models/Staff');
const Parent = require('../../sms-server/models/Parent');
const Student = require('../../sms-server/models/Student');
const House = require('../../sms-server/models/House');
const logger = require('../utils/logger');
const env = require('../../sms-server/config/env');

const seedUser = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const superAdmin = await User.create({
      username: 'superadmin',
      password: 'hashedpassword123', // Hash in production
      role: 'super_admin',
      fullName: 'Super Admin',
      email: 'superadmin@st-andrews.edu.gh',
      phoneNumber: '+233 50 123 4567'
    });

    const branches = await require('./seedBranch')();
    const houses = await House.find();

    const staff = await Staff.insertMany([
      { fullName: 'Mr. Kwame Nkrumah', username: 'teacher1', password: 'hashedpassword123', branchId: branches[0]._id, role: 'teacher', phoneNumber: '+233 24 333 4444', email: 'teacher1@st-andrews.edu.gh', houseId: houses[0]._id, qualifications: ['B.Ed', 'M.Ed'], isHouseMaster: true },
      { fullName: 'Mrs. Akua Mensah', username: 'teacher2', password: 'hashedpassword123', branchId: branches[1]._id, role: 'teacher', phoneNumber: '+233 24 444 5555', email: 'teacher2@st-andrews.edu.gh', houseId: houses[2]._id, qualifications: ['B.Sc', 'PGDE'], isHouseMaster: false },
      { fullName: 'Mr. Kofi Adu', username: 'librarian1', password: 'hashedpassword123', branchId: branches[0]._id, role: 'librarian', phoneNumber: '+233 24 555 6666', email: 'librarian1@st-andrews.edu.gh', houseId: houses[1]._id, qualifications: ['B.A. Library Studies'] }
    ]);

    const parents = await Parent.insertMany([
      { fullName: 'Mr. Kwesi Annan', username: 'parent1', password: 'hashedpassword123', studentId: '60d5f8b8b9c1f2a3b4c5d6e8', branchId: branches[0]._id, phoneNumber: '+233 24 555 6666', email: 'kwesi.annan@parent.com', address: 'P.O. Box 123, Assin Fosu' },
      { fullName: 'Mrs. Adwoa Boafo', username: 'parent2', password: 'hashedpassword123', studentId: '60d5f8b8b9c1f2a3b4c5d6e9', branchId: branches[1]._id, phoneNumber: '+233 24 666 7777', email: 'adwoa.boafo@parent.com', address: 'P.O. Box 456, Accra' }
    ]);

    const students = await Student.insertMany([
      { fullName: 'Kofi Annan', studentId: 'ST001234', branchId: branches[0]._id, studentType: 'boarding', houseId: houses[0]._id, courseId: '60d5f8b8b9c1f2a3b4c5d6ea', parentId: parents[0]._id, dateOfBirth: new Date('2007-05-15'), emergencyContact: '+233 24 555 6666' },
      { fullName: 'Ama Boafo', studentId: 'ST001235', branchId: branches[1]._id, studentType: 'hostel', houseId: houses[2]._id, courseId: '60d5f8b8b9c1f2a3b4c5d6eb', parentId: parents[1]._id, dateOfBirth: new Date('2006-09-22'), emergencyContact: '+233 24 666 7777' }
    ]);

    logger.info('Users, Staff, Parents, and Students seeded successfully');
  } catch (error) {
    logger.error('User seeding failed', { error: error.message });
    throw error;
  }
};

if (require.main === module) {
  seedUser().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedUser;