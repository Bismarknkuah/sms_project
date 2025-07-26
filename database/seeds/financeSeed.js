const mongoose = require('mongoose');
const Finance = require('../../sms-server/models/Finance');
const Student = require('../../sms-server/models/Student');
const env = require('../../sms-server/config/env');
const logger = require('../utils/logger');

const seedFinance = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const students = await Student.find();
    const financeData = [];

    for (const student of students) {
      const finance = {
        transactionType: ['tuition', 'boarding', 'exam_fee'][Math.floor(Math.random() * 3)],
        amount: [500, 300, 200][Math.floor(Math.random() * 3)] * 10,
        studentId: student._id,
        branchId: student.branchId,
        status: ['pending', 'paid', 'overdue'][Math.floor(Math.random() * 3)],
        paymentMethod: ['cash', 'mobile_money', 'bank_transfer'][Math.floor(Math.random() * 3)],
        dueDate: new Date('2025-08-01'),
        paidAt: Math.random() > 0.5 ? new Date('2025-07-15') : null
      };
      financeData.push(finance);
    }

    await Finance.insertMany(financeData);
    logger.info('Finance data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Finance seeding failed', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  seedFinance();
}

module.exports = seedFinance;