const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // If using Gmail, use the dedicated service handler (more reliable on Render)
  if (process.env.EMAIL_HOST?.includes('gmail')) {
    config.service = 'gmail';
  } else {
    config.host = process.env.EMAIL_HOST;
    config.port = parseInt(process.env.EMAIL_PORT);
    config.secure = process.env.EMAIL_SECURE === 'true';
  }

  return nodemailer.createTransport({
    ...config,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false
    }
  });
};

module.exports = createTransporter;
