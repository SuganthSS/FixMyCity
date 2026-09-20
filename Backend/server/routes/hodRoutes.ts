import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';
import {
  getDepartmentComplaints,
  assignComplaint,
  transferDepartment,
  getDepartmentStaff,
  getStaffWorkload,
  getDepartmentStats,
} from '../controllers/hodController';

const router = express.Router();

router.get('/complaints', protect, allowRoles('hod'), getDepartmentComplaints);
router.patch('/complaints/:id/assign', protect, allowRoles('hod', 'admin'), assignComplaint);
router.patch('/complaints/:id/transfer-department', protect, allowRoles('hod', 'admin'), transferDepartment);
router.get('/staff', protect, allowRoles('hod'), getDepartmentStaff);
router.get('/staff/workload', protect, allowRoles('hod'), getStaffWorkload);
router.get('/stats', protect, allowRoles('hod'), getDepartmentStats);

export default router;
