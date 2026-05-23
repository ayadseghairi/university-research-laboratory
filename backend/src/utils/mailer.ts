import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.MAIL_PORT || 587);

export const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: process.env.MAIL_USER && process.env.MAIL_PASS
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
});

export const getMailFrom = () => process.env.MAIL_FROM || process.env.MAIL_USER || '';
