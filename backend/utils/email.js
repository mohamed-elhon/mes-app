const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    html: options.message
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email could not be sent:', error);
    return false;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to E-commerce Store!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with us. We're excited to have you on board!</p>
      <p>Start shopping now and enjoy amazing deals.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `,
  
  orderConfirmation: (order, user) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your order #${order._id} has been placed successfully!</p>
      <h3>Order Summary:</h3>
      <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Shipping Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
      <p>We'll notify you when your order is shipped.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `,
  
  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click the following link to reset your password:</p>
      <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `,
  
  contactResponse: (message, response) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Contact Request</h2>
      <p>Thank you for contacting us!</p>
      <p>Your message: "${message}"</p>
      ${response ? `<p>Our response: "${response}"</p>` : ''}
      <p>We'll get back to you as soon as possible.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };
