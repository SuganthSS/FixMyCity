import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  getPublicComplaints,
  toggleUpvote,
} from '../controllers/complaintController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { admin, allowRoles } from '../middleware/roleMiddleware.ts';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router
  .route('/')
  .post(protect, allowRoles('citizen'), upload.single('image'), createComplaint)
  .get(protect, getComplaints);

// Public route must be before /:id to avoid matching :id with 'public'
router.route('/public').get(protect, getPublicComplaints);

router.route('/:id').get(protect, getComplaintById);
router.patch('/:id/upvote', protect, allowRoles('citizen'), toggleUpvote);

// Staff and Admin routes
router.patch('/:id/status', protect, allowRoles('staff', 'admin'), updateComplaintStatus);
// DEPRECATED: department is now auto-set from category by the AI classifier
// router.patch('/:id/department', protect, allowRoles('staff', 'admin'), updateComplaintDepartment);

// Admin only routes
router.patch('/:id/priority', protect, admin, updateComplaintPriority);

export default router;
