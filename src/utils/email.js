const transporter = require('../config/mail');

/**
 * Send an email.
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
async function sendEmail(to, subject, html) {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"School SMS" <no-reply@school.com>',
    to,
    subject,
    html
  });
  return info;
}

module.exports = { sendEmail };
