const mongoose = require('mongoose');
const Branch = require('../../sms-server/models/Branch');
const Headmaster = require('../../sms-server/models/Headmaster');
const logger = require('../utils/logger');
const env = require('../../sms-server/config/env');

const seedBranch = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const headmasters = await Headmaster.insertMany([
      { username: 'head_assin', password: 'hashedpassword123', fullName: 'Mr. John Doe', phoneNumber: '+233 24 111 2222', email: 'head_assin@st-andrews.edu.gh' },
      { username: 'head_accra', password: 'hashedpassword123', fullName: 'Mrs. Jane Smith', phoneNumber: '+233 24 222 3333', email: 'head_accra@st-andrews.edu.gh' },
      { username: 'head_mankessim', password: 'hashedpassword123', fullName: 'Mr. Kwame Asante', phoneNumber: '+233 24 333 4444', email: 'head_mankessim@st-andrews.edu.gh' },
      { username: 'head_takoradi', password: 'hashedpassword123', fullName: 'Mrs. Akua Mensah', phoneNumber: '+233 24 444 5555', email: 'head_takoradi@st-andrews.edu.gh' },
      { username: 'head_sefwi', password: 'hashedpassword123', fullName: 'Mr. Yaw Osei', phoneNumber: '+233 24 555 6666', email: 'head_sefwi@st-andrews.edu.gh' },
      { username: 'head_dunkwa', password: 'hashedpassword123', fullName: 'Mrs. Abena Gyamfi', phoneNumber: '+233 24 666 7777', email: 'head_dunkwa@st-andrews.edu.gh' },
      { username: 'head_newedubiase', password: 'hashedpassword123', fullName: 'Mr. Kofi Appiah', phoneNumber: '+233 24 777 8888', email: 'head_newedubiase@st-andrews.edu.gh' }
    ]);

    const branches = await Branch.insertMany([
      { name: 'Assin Fosu', location: 'Central Region', capacity: 1500, contactNumber: '+233 24 123 4567', email: 'assin@st-andrews.edu.gh', headmasterId: headmasters[0]._id },
      { name: 'Accra', location: 'Greater Accra', capacity: 1800, contactNumber: '+233 24 234 5678', email: 'accra@st-andrews.edu.gh', headmasterId: headmasters[1]._id },
      { name: 'Mankessim', location: 'Central Region', capacity: 1200, contactNumber: '+233 24 345 6789', email: 'mankessim@st-andrews.edu.gh', headmasterId: headmasters[2]._id },
      { name: 'Takoradi', location: 'Western Region', capacity: 1600, contactNumber: '+233 24 456 7890', email: 'takoradi@st-andrews.edu.gh', headmasterId: headmasters[3]._id },
      { name: 'Sefwi Asawinso', location: 'Western North', capacity: 1000, contactNumber: '+233 24 567 8901', email: 'sefwiasawinso@st-andrews.edu.gh', headmasterId: headmasters[4]._id },
      { name: 'Dunkwa-on-Offin', location: 'Central Region', capacity: 1400, contactNumber: '+233 24 678 9012', email: 'dunkwa@st-andrews.edu.gh', headmasterId: headmasters[5]._id },
      { name: 'New Edubiase', location: 'Ashanti Region', capacity: 1300, contactNumber: '+233 24 789 0123', email: 'newedubiase@st-andrews.edu.gh', headmasterId: headmasters[6]._id }
    ]);

    logger.info('Branches and Headmasters seeded successfully');
  } catch (error) {
    logger.error('Branch seeding failed', { error: error.message });
    throw error;
  }
};

if (require.main === module) {
  seedBranch().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedBranch;