const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // Use Resend SMTP if RESEND_API_KEY is set (recommended for Render)
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
      }
    });
  }

  // If using Gmail, use the dedicated service handler
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
