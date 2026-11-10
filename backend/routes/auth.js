const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth');
const { validateAuth } = require('../middleware/validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateAuth, authController.register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateAuth, authController.login);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authController.logout);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authController.getMe);

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
router.put('/update-profile', authController.updateProfile);

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', authController.updatePassword);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
router.put('/reset-password/:resetToken', authController.resetPassword);

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', authController.verifyEmail);

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
