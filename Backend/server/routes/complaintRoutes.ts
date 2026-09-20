import express from 'express';
import multer from 'multer';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStage,
  updateComplaintStatus,
  submitFeedback,
  reopenComplaint,
  addInternalNote,
  addComment,
  updateComplaintPriority,
  getPublicComplaints,
  toggleUpvote,
} from '../controllers/complaintController';
import { protect } from '../middleware/authMiddleware';
import { admin, allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const uploadImages = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'image', maxCount: 1 },
]);

router
  .route('/')
  .post(protect, allowRoles('citizen'), uploadImages, createComplaint)
  .get(protect, getComplaints);

router.route('/public').get(protect, getPublicComplaints);

router.route('/:id').get(protect, getComplaintById);
router.patch('/:id/upvote', protect, allowRoles('citizen'), toggleUpvote);

router.patch('/:id/stage', protect, allowRoles('staff', 'hod', 'admin'), uploadImages, updateComplaintStage);
router.patch('/:id/status', protect, allowRoles('staff', 'admin'), updateComplaintStatus);

router.post('/:id/feedback', protect, allowRoles('citizen'), submitFeedback);
router.post('/:id/reopen', protect, allowRoles('citizen'), reopenComplaint);
router.post('/:id/internal-notes', protect, allowRoles('staff', 'hod', 'admin'), addInternalNote);
router.post('/:id/comments', protect, addComment);

router.patch('/:id/priority', protect, admin, updateComplaintPriority);

export default router;
