require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

async function sendRegistrationEmail(userEmail,userName){
    const subject="Welcome to Bank-Ledger"
    const text=`Hi ${userName},\n\nWelcome to Bank-Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Bank-Ledger Team`
    const html=`<p>Hi ${userName},</p><p>Welcome to Bank-Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Bank-Ledger Team</p>`
    return await sendEmail(userEmail,subject,text,html)
}

async function sendLoginNotificationEmail(userEmail,userName){
    const subject="New Login Notification"
    const text=`Hi ${userName},\n\nWe noticed a new login to your Bank-Ledger account. If this was you, you can safely ignore this email. If you did not log in, please secure your account immediately by changing your password and contacting our support team.\n\nBest regards,\nThe Bank-Ledger Team`
    const html=`<p>Hi ${userName},</p><p>We noticed a new login to your Bank-Ledger account. If this was you, you can safely ignore this email. If you did not log in, please secure your account immediately by changing your password and contacting our support team.</p><p>Best regards,<br>The Bank-Ledger Team</p>`
    return await sendEmail(userEmail,subject,text,html)
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionReceivedEmail(userEmail, name, amount, fromName) {
    const subject = 'You Received a Transaction!';
    const text = `Hello ${name},\n\nYou have received a transaction of $${amount} from ${fromName}.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>You have received a transaction of $${amount} from ${fromName}.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendInitialFundEmail(userEmail, name, amount) {
    const subject = 'Initial Fund Added!';
    const text = `Hello ${name},\n\nAn initial fund of $${amount} has been added to your account.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>An initial fund of $${amount} has been added to your account.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendLoginNotificationEmail,
    sendTransactionEmail,
    sendTransactionReceivedEmail,
    sendInitialFundEmail
};