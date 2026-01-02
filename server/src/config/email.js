const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const logger = require('../utils/logger');

let resendClient = null;
let nodemailerTransporter = null;

// Initialize Resend client if API key is available
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
  logger.info('Email: Using Resend HTTP API');
} else {
  // Fallback to nodemailer for local development
  nodemailerTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  logger.info('Email: Using Nodemailer SMTP');
}

/**
 * Send email using either Resend HTTP API or Nodemailer
 */
const sendEmail = async (to, subject, html) => {
  const from = process.env.EMAIL_FROM || 'MirhalGO <onboarding@resend.dev>';

  if (resendClient) {
    // Use Resend HTTP API (works on Render)
    const { data, error } = await resendClient.emails.send({
      from,
      to,
      subject,
      html
    });

    if (error) {
      logger.error('Resend API error:', error);
      throw new Error(error.message);
    }

    logger.info(`Email sent via Resend to ${to}`, { id: data?.id });
    return { success: true, messageId: data?.id };
  } else if (nodemailerTransporter) {
    // Fallback to Nodemailer SMTP
    const info = await nodemailerTransporter.sendMail({
      from,
      to,
      subject,
      html
    });

    logger.info(`Email sent via Nodemailer to ${to}`, { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } else {
    throw new Error('No email transport configured');
  }
};

module.exports = { sendEmail };
