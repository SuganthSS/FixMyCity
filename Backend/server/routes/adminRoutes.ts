import express from 'express';
import { approveStaff, banUser, unbanUser, getUsers, assignDepartment } from '../controllers/adminController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { admin } from '../middleware/roleMiddleware.ts';

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.patch('/approve-staff/:id', protect, admin, approveStaff);
router.patch('/ban-user/:id', protect, admin, banUser);
router.patch('/unban-user/:id', protect, admin, unbanUser);
router.patch('/assign-department/:userId', protect, admin, assignDepartment);

export default router;
