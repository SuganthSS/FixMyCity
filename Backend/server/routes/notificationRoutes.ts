import express from 'express';
import { getNotifications, markAllAsRead, markAsRead } from '../controllers/notificationController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/read-all')
  .patch(protect, markAllAsRead);

router.route('/:id/read')
  .patch(protect, markAsRead);

export default router;
