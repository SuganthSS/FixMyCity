import express from 'express';
import { protect } from '../middleware/authMiddleware.ts';
import { allowRoles } from '../middleware/roleMiddleware.ts';
import {
  getDepartmentComplaints,
  assignComplaint,
  getDepartmentStaff,
  getStaffWorkload,
  getDepartmentStats,
} from '../controllers/hodController.ts';

const router = express.Router();

// All HOD routes require authentication + HOD role
router.get('/complaints', protect, allowRoles('hod'), getDepartmentComplaints);
router.patch('/complaints/:id/assign', protect, allowRoles('hod'), assignComplaint);
router.get('/staff', protect, allowRoles('hod'), getDepartmentStaff);
router.get('/staff/workload', protect, allowRoles('hod'), getStaffWorkload);
router.get('/stats', protect, allowRoles('hod'), getDepartmentStats);

export default router;
