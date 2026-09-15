import express from 'express';
import { registerUser, loginUser, getUserProfile, googleLogin } from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);

export default router;
