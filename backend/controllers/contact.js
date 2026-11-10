const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const { sendEmail, emailTemplates } = require('../utils/email');

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;
  
  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message
  });
  
  // Send confirmation email to user
  const confirmationEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Contacting Us</h2>
      <p>Hello ${name},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `;
  
  await sendEmail({
    email,
    subject: 'Thank You for Contacting Us',
    message: confirmationEmail
  });
  
  // Send notification email to admin
  const adminEmail = process.env.EMAIL_USER || 'admin@ecommerce.com';
  const notificationEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Please respond to this message as soon as possible.</p>
    </div>
  `;
  
  await sendEmail({
    email: adminEmail,
    subject: `New Contact Message: ${subject}`,
    message: notificationEmail
  });
  
  res.status(201).json({
    success: true,
    message: 'Contact message sent successfully',
    data: contact
  });
});

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, isRead, isResolved, search } = req.query;
  
  let query = {};
  
  if (isRead) {
    query.isRead = isRead === 'true';
  }
  
  if (isResolved) {
    query.isResolved = isResolved === 'true';
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }
  
  const results = await paginate(Contact, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  res.status(200).json(results);
});

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContact = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return next(new ErrorResponse('Contact message not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact message
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContact = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isRead, isResolved, response } = req.body;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return next(new ErrorResponse('Contact message not found', 404));
  }
  
  // Update contact
  if (isRead !== undefined) contact.isRead = isRead;
  if (isResolved !== undefined) contact.isResolved = isResolved;
  if (response) contact.response = response;
  
  await contact.save();
  
  // If response is provided, send email to user
  if (response) {
    const responseEmail = emailTemplates.contactResponse(contact.message, response);
    
    await sendEmail({
      email: contact.email,
      subject: `Re: ${contact.subject}`,
      message: responseEmail
    });
    
    // Mark as resolved if not already
    if (!contact.isResolved) {
      contact.isResolved = true;
      await contact.save();
    }
  }
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return next(new ErrorResponse('Contact message not found', 404));
  }
  
  await contact.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Contact message deleted successfully'
  });
});

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return next(new ErrorResponse('Contact message not found', 404));
  }
  
  contact.isRead = true;
  await contact.save();
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Mark contact as resolved
// @route   PUT /api/contact/:id/resolve
// @access  Private/Admin
exports.markAsResolved = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return next(new ErrorResponse('Contact message not found', 404));
  }
  
  contact.isResolved = true;
  await contact.save();
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
exports.getContactStats = asyncHandler(async (req, res, next) => {
  const totalContacts = await Contact.countDocuments();
  const unreadContacts = await Contact.countDocuments({ isRead: false });
  const unresolvedContacts = await Contact.countDocuments({ isResolved: false });
  
  // Contacts by date
  const contactsByDate = await Contact.aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);
  
  // Contacts by subject
  const contactsBySubject = await Contact.aggregate([
    { $group: {
      _id: '$subject',
      count: { $sum: 1 }
    }},
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalContacts,
      unreadContacts,
      unresolvedContacts,
      contactsByDate,
      contactsBySubject
    }
  });
});
