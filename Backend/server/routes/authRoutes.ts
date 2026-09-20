import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  googleLogin, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, changePassword);

// Public Password Reset Endpoints
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
