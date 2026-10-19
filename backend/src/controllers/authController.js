import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register (also /api/auth/register)
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: 'local'
    });

    const jwtSecret = process.env.JWT_SECRET || 'vision2system_jwt_secret_key_2026';
    const token = generateToken(user._id, jwtSecret);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login (also /api/auth/login)
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Auth. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'vision2system_jwt_secret_key_2026';
    const token = generateToken(user._id, jwtSecret);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * @desc    Authenticate or Register via Google OAuth Credential
 * @route   POST /api/users/google (also /api/auth/google)
 * @access  Public
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: 'Server error: GOOGLE_CLIENT_ID environment variable is missing on backend.' });
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload.' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'vision2system_jwt_secret_key_2026';
    const token = generateToken(user._id, jwtSecret);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    return res.status(401).json({ message: 'Google authentication failed. Invalid credential token.' });
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/users/me (also /api/auth/me)
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving user profile.' });
  }
};
