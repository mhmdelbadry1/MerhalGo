const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const Brevo = require('@getbrevo/brevo');
const logger = require('../utils/logger');

let resendClient = null;
let brevoApiInstance = null;
let nodemailerTransporter = null;

// Initialize providers based on environment variables
if (process.env.BREVO_API_KEY) {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  brevoApiInstance = apiInstance;
  logger.info('Email: Using Brevo HTTP API');
} else if (process.env.RESEND_API_KEY) {
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
 * Send email using the available provider
 */
const sendEmail = async (to, subject, html) => {
  let fromEmail = 'mohamed.hassan221012@gmail.com';
  let fromName = 'MirhalGO';

  // Parse EMAIL_FROM if it exists (e.g. "Name <email@domain.com>")
  if (process.env.EMAIL_FROM) {
    const match = process.env.EMAIL_FROM.match(/(.*)<(.*)>/);
    if (match) {
      fromName = match[1].trim();
      fromEmail = match[2].trim();
    } else {
      fromEmail = process.env.EMAIL_FROM.trim();
    }
  }

  const from = `${fromName} <${fromEmail}>`;

  try {
    if (brevoApiInstance) {
      // Use Brevo HTTP API
      try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { name: fromName, email: fromEmail };
        sendSmtpEmail.to = [{ email: to }];

        const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
        logger.info(`Email sent via Brevo to ${to}`, { messageId: result?.body?.messageId });
        return { success: true, messageId: result?.body?.messageId };
      } catch (brevoError) {
        // Extract readable error message from Brevo error
        const errorMessage = brevoError?.response?.body?.message 
          || brevoError?.message 
          || 'Unknown Brevo error';
        const errorCode = brevoError?.response?.body?.code || brevoError?.code;
        logger.error(`Brevo API error: ${errorMessage}`, { code: errorCode });
        throw new Error(`Brevo: ${errorMessage}`);
      }
    } 
    
    if (resendClient) {
      // Use Resend HTTP API
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
    } 
    
    if (nodemailerTransporter) {
      // Fallback to Nodemailer SMTP
      const info = await nodemailerTransporter.sendMail({
        from,
        to,
        subject,
        html
      });

      logger.info(`Email sent via Nodemailer to ${to}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    }

    throw new Error('No email transport configured');
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };
