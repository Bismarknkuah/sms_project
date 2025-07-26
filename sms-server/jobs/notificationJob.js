const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Communication = require('../models/Communication');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

const sendAttendanceNotification = async () => {
  try {
    const today = new Date();
    const attendances = await Attendance.find({ date: today, status: 'absent' }).populate('studentId');

    for (const attendance of attendances) {
      const student = attendance.studentId;
      const parent = await Parent.findOne({ studentId: student._id });
      if (parent) {
        const mailOptions = {
          from: env.EMAIL_USER,
          to: parent.email,
          subject: `Attendance Alert for ${student.fullName} - ${today.toDateString()}`,
          text: `Dear ${parent.fullName},\n\nYour child, ${student.fullName}, was marked as ${attendance.status} today at ${student.branchId.name}. Please contact the school at ${env.SCHOOL_CONTACT} for more details.\n\nRegards,\nSt. Andrews SHS Administration`
        };

        await transporter.sendMail(mailOptions);
        await Communication.create({
          senderId: mongoose.Types.ObjectId(env.SUPER_ADMIN_ID),
          recipientIds: [parent._id],
          message: `Attendance notification sent for ${student.fullName} on ${today.toDateString()}`,
          type: 'email',
          branchId: student.branchId
        });
      }
    }
    console.log(`Attendance notifications sent at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error('Error in attendance notification job:', error);
  }
};

const sendFeeReminder = async () => {
  try {
    const dueDateThreshold = new Date();
    dueDateThreshold.setDate(dueDateThreshold.getDate() + 7);
    const finances = await Finance.find({ status: 'pending', dueDate: { $lte: dueDateThreshold } }).populate('studentId').populate('branchId');

    for (const finance of finances) {
      const student = finance.studentId;
      const parent = await Parent.findOne({ studentId: student._id });
      if (parent) {
        const mailOptions = {
          from: env.EMAIL_USER,
          to: parent.email,
          subject: `Fee Payment Reminder - ${student.fullName}`,
          text: `Dear ${parent.fullName},\n\nA payment of GHS ${finance.amount} for ${finance.transactionType} is due by ${finance.dueDate.toDateString()} for ${student.fullName} at ${finance.branchId.name}. Please settle via ${env.PAYMENT_OPTIONS}. Contact ${env.SCHOOL_CONTACT} for assistance.\n\nRegards,\nSt. Andrews SHS Finance Office`
        };

        await transporter.sendMail(mailOptions);
        await Communication.create({
          senderId: mongoose.Types.ObjectId(env.SUPER_ADMIN_ID),
          recipientIds: [parent._id],
          message: `Fee reminder sent for ${student.fullName} on ${new Date().toDateString()}`,
          type: 'email',
          branchId: student.branchId
        });
      }
    }
    console.log(`Fee reminders sent at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error('Error in fee reminder job:', error);
  }
};

// Schedule jobs
cron.schedule('0 8 * * *', sendAttendanceNotification, { timezone: 'GMT' }); // Daily at 8:00 AM GMT
cron.schedule('0 9 * * *', sendFeeReminder, { timezone: 'GMT' }); // Daily at 9:00 AM GMT

module.exports = { sendAttendanceNotification, sendFeeReminder };