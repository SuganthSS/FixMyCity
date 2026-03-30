import express from 'express';
import {
  createTicket,
  getMyTickets,
  getDepartmentTickets,
  acceptTicket,
  getTicketConversation,
  closeTicket,
} from '../controllers/ticketController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { allowRoles } from '../middleware/roleMiddleware.ts';

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/department', protect, allowRoles('staff'), getDepartmentTickets);
router.patch('/:id/accept', protect, allowRoles('staff'), acceptTicket);
router.patch('/:id/close', protect, closeTicket);
router.get('/conversation/:ticketId', protect, getTicketConversation);

export default router;
