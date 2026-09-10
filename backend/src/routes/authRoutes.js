import express from 'express';
import { register, login, googleLogin, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Redirect endpoints for traditional Google OAuth flow
router.get('/google', (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return res.status(400).send('GOOGLE_CLIENT_ID is not configured in backend environment variables.');
  }
  const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback');
  const scope = encodeURIComponent('email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
  // Simple callback handler that instructs client or redirects with status
  res.send('Google OAuth callback received. Please use the Google OAuth login button on the React application.');
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// Protected route
router.get('/me', protect, getMe);

export default router;
