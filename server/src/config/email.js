const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Fix for "self-signed certificate" error in dev/antivirus environments
    tls: {
      rejectUnauthorized: false
    }
  });
};

module.exports = createTransporter;
