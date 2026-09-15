import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.ts';

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

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'citizen',
    isApproved: role === 'staff' ? false : true,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
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

  const user: any = await User.findOne({ email }).select('+password');

  let isMatch = false;
  if (user && user.password) {
    isMatch = await bcrypt.compare(password, user.password);
  }

  if (user && isMatch) {
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
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
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

    // Match existing user strictly by email
    let user = await User.findOne({ email });

    if (!user) {
      // Force role = "citizen" for new Google OAuth users
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId: sub,
        avatar: picture || null,
        authProvider: 'google',
        role: 'citizen',
        isApproved: true,
      });
    } else if (user.authProvider !== 'google' && !user.googleId) {
      // Auto-link Google account details to existing account without touching role, department, or approval status
      user.googleId = sub;
      user.avatar = picture || user.avatar;
      user.authProvider = 'google';
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
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed. Invalid token.' });
  }
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
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { registerUser, loginUser, googleLogin, getUserProfile };
