import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.ts';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from '../services/emailService.ts';

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : '';

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Generate unhashed verification token for email link
  const verificationToken = crypto.randomBytes(32).toString('hex');
  // Store SHA-256 hash of token in MongoDB
  const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'citizen',
    isApproved: role === 'staff' ? false : true,
    isEmailVerified: false,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
  });

  if (user) {
    // Send email containing unhashed verification token
    await sendEmailVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });

    res.status(201).json({
      success: true,
      message: "We've sent a verification email to your inbox. Please verify your email before signing in.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: false,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const user: any = await User.findOne({ email: normalizedEmail }).select('+password');

  let isMatch = false;
  if (user && user.password) {
    isMatch = await bcrypt.compare(password, user.password);
  }

  if (user && isMatch) {
    // Check if user is banned
    if (user.isBanned) {
      res.status(403).json({ success: false, message: 'Your account has been restricted. Contact administrator.' });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in.',
        isEmailVerified: false,
        email: user.email,
      });
      return;
    }

    // Check if staff or HOD is approved
    if ((user.role === 'staff' || user.role === 'hod') && !user.isApproved) {
      res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
      return;
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

// @desc    Authenticate user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Google ID token is required' });
    return;
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid token payload or missing email' });
      return;
    }

    const { email, name, picture, sub } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Match existing user strictly by email
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Force role = "citizen" and auto-verify email for new Google OAuth users
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId: sub,
        avatar: picture || null,
        authProvider: 'google',
        role: 'citizen',
        isApproved: true,
        isEmailVerified: true,
      });
    } else {
      if (user.authProvider !== 'google' && !user.googleId) {
        user.googleId = sub;
        user.avatar = picture || user.avatar;
        user.authProvider = 'google';
      }
      // Google authenticated users have verified email via Google
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
      await user.save();
    }

    // Check if user is banned
    if (user.isBanned) {
      res.status(403).json({ message: 'Your account has been restricted. Contact administrator.' });
      return;
    }

    // Check if staff or HOD is approved
    if ((user.role === 'staff' || user.role === 'hod') && !user.isApproved) {
      res.status(403).json({ message: 'Your account is pending admin approval.' });
      return;
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed. Invalid token.' });
  }
};

// @desc    Verify email address using verification token
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Verification token is required.',
    });
    return;
  }

  // Hash incoming token to match stored database hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token and valid expiry
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired email verification token.',
    });
    return;
  }

  // Update verification status and clear token fields
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
};

// @desc    Resend email verification token
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  const genericResponse = {
    success: true,
    message: "If an unverified account exists with that email, a new verification link has been sent.",
  };

  if (!email) {
    res.json(genericResponse);
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // If user does not exist or is already verified, return generic response to prevent user enumeration
  if (!user || user.isEmailVerified) {
    res.json(genericResponse);
    return;
  }

  // Generate new token and 24-hour expiry
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = hashedVerificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  // Send verification email
  await sendEmailVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken,
  });

  res.json(genericResponse);
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    return;
  }

  const user: any = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (user.authProvider === 'google' && !user.password) {
    res.status(400).json({ success: false, message: 'Google OAuth accounts cannot change password directly' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Generic response to prevent user enumeration
  const genericResponse = {
    success: true,
    message: 'If an account exists with that email, a reset link has been sent.',
  };

  if (!email) {
    res.json(genericResponse);
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    res.json(genericResponse);
    return;
  }

  // Prevent Google OAuth users without password from setting local password via reset link
  if (user.authProvider === 'google' && !user.password) {
    res.json(genericResponse);
    return;
  }

  // Generate unhashed reset token for email link
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store hashed version of reset token in MongoDB
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await user.save();

  // Send email containing unhashed token
  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetToken,
  });

  res.json(genericResponse);
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

  // Hash incoming token to match database record
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid, unexpired token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset token.',
    });
    return;
  }

  // Set new password (will be hashed in User pre-save hook)
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
  });
};

export {
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  resendVerification,
  getUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};

