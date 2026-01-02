const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT);
  const secure = process.env.EMAIL_SECURE === 'true';

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Adding timeouts for better error handling on slow connections/blocks
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false // Helps in environments with proxy/antivirus
    }
  });
};

module.exports = createTransporter;
