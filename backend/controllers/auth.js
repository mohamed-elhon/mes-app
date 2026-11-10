const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { sendEmail, emailTemplates } = require('../utils/email');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;
  
  // Check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }
  
  // Create user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone
  });
  
  // Generate verification token
  const verificationToken = newUser.getSignedJwtToken();
  
  // Send welcome email
  const welcomeEmail = emailTemplates.welcome(`${firstName} ${lastName}`);
  await sendEmail({
    email: newUser.email,
    subject: 'Welcome to E-commerce Store',
    message: welcomeEmail
  });
  
  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const verificationMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Hello ${firstName},</p>
      <p>Please click the following link to verify your email address:</p>
      <p><a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `;
  
  await sendEmail({
    email: newUser.email,
    subject: 'Verify Your Email Address',
    message: verificationMessage
  });
  
  // Generate token
  const token = newUser.getSignedJwtToken();
  
  res.status(200).json({
    success: true,
    token,
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  
  // Generate token
  const token = user.getSignedJwtToken();
  
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // In JWT, logout is handled client-side by removing the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      wishlist: user.wishlist,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, address } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }
  
  // Update user
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Send confirmation email
  const passwordChangeEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not request this change, please contact us immediately.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `;
  
  await sendEmail({
    email: user.email,
    subject: 'Password Changed',
    message: passwordChangeEmail
  });
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }
  
  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  
  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  // Send email
  const resetEmail = emailTemplates.passwordReset(resetUrl);
  
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message: resetEmail
  });
  
  res.status(200).json({
    success: true,
    message: 'Email sent'
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.resetToken;
  
  // Hash the token
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Find user with this reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  
  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();
  
  // Send confirmation email
  const resetConfirmEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Successful</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your password has been successfully reset.</p>
      <p>You can now log in with your new password.</p>
      <p>Best regards,<br/>E-commerce Team</p>
    </div>
  `;
  
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Successful',
    message: resetConfirmEmail
  });
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Check if already verified
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified'
      });
    }
    
    // Verify user
    user.isVerified = true;
    await user.save();
    
    // Send confirmation email
    const verifyEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verified</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your email address has been successfully verified.</p>
        <p>Thank you for joining our community!</p>
        <p>Best regards,<br/>E-commerce Team</p>
      </div>
    `;
    
    await sendEmail({
      email: user.email,
      subject: 'Email Verified',
      message: verifyEmail
    });
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return next(new ErrorResponse('Token is required', 400));
  }
  
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Generate new token
    const newToken = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    return next(new ErrorResponse('Invalid token', 401));
  }
});
