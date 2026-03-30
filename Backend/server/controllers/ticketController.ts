import User from '../models/User';
import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import Complaint from '../models/Complaint';
import Message from '../models/Message';

// @desc    Raise a new ticket from a complaint
// @route   POST /api/tickets
// @access  Private (Citizen)
export const createTicket = async (req: any, res: Response) => {
  try {
    const { complaintId } = req.body;
    const citizenId = req.user._id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!complaint.department) {
      return res.status(400).json({ message: 'Complaint has no assigned department yet' });
    }

    // Check if an OPEN or ACCEPTED ticket already exists for this complaint
    const existingTicket = await Ticket.findOne({
      complaintId,
      status: { $in: ['OPEN', 'ACCEPTED'] },
    });

    if (existingTicket) {
      return res.status(400).json({ message: 'A ticket already exists for this complaint' });
    }

    // Auto-generate ticketCode
    const lastTicket = await Ticket.findOne({}).sort({ createdAt: -1 });
    let nextCodeNum = 1;
    if (lastTicket && lastTicket.ticketCode) {
      const match = lastTicket.ticketCode.match(/TKT-(\d+)/);
      if (match) {
        nextCodeNum = parseInt(match[1], 10) + 1;
      }
    }
    const ticketCode = `TKT-${String(nextCodeNum).padStart(4, '0')}`;

    const ticket = await Ticket.create({
      ticketCode,
      complaintId,
      citizenId,
      department: complaint.department,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in citizen's tickets
// @route   GET /api/tickets/my
// @access  Private
export const getMyTickets = async (req: any, res: Response) => {
  try {
    const tickets = await Ticket.find({ citizenId: req.user._id })
      .populate('complaintId', 'title complaintCode status')
      .sort({ createdAt: -1 });
    
    console.log(`DEBUG: User ID: ${req.user._id} (Type: ${typeof req.user._id})`);
    console.log(`DEBUG: Tickets Found: ${tickets.length}`);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching citizen tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all OPEN tickets for staff's department
// @route   GET /api/tickets/department
// @access  Private/Staff
export const getDepartmentTickets = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !(user as any).department) {
      return res.status(400).json({ message: 'Staff user has no assigned department' });
    }

    const department = (user as any).department;

    const tickets = await Ticket.find({
      department,
      status: { $in: ['OPEN', 'ACCEPTED'] },
    })
      .select('-citizenId') // Never expose citizenId
      .populate('complaintId', 'title complaintCode')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching department tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Staff accepts a ticket
// @route   PATCH /api/tickets/:id/accept
// @access  Private/Staff
export const acceptTicket = async (req: any, res: Response) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const staffUser = await User.findById(req.user._id);
    if (!staffUser || (staffUser as any).department !== ticket.department) {
      return res.status(403).json({ message: 'Not authorized for this department' });
    }

    if (ticket.status === 'ACCEPTED' && ticket.acceptedBy?.toString() === req.user._id.toString()) {
      return res.json(ticket);
    }

    if (ticket.status !== 'OPEN') {
      return res.status(400).json({ message: 'Ticket is not OPEN' });
    }

    if (ticket.acceptedBy) {
      return res.status(400).json({ message: 'Ticket already accepted by another staff' });
    }

    ticket.status = 'ACCEPTED';
    ticket.acceptedBy = req.user._id;

    const updatedTicket = await ticket.save();

    res.json(updatedTicket);
  } catch (error) {
    console.error('Error accepting ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get conversation for a ticket
// @route   GET /api/tickets/conversation/:ticketId
// @access  Private
export const getTicketConversation = async (req: any, res: Response) => {
  try {
    const ticketId = req.params.ticketId;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security: Check access rights
    if (req.user.role === 'citizen' && ticket.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'staff') {
       const user = await User.findById(req.user._id);
       const ticketDept = (ticket.department || '').trim().toLowerCase();
       const userDept = ((user as any)?.department || '').trim().toLowerCase();
       if (ticketDept !== userDept) {
         return res.status(403).json({ message: 'Not authorized' });
       }
    }

    const messages = await Message.find({ thread: ticketId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .lean();

    // Enforce output sanitization for staff reading messages
    if (req.user.role === 'staff') {
      messages.forEach(msg => {
        if (msg.sender && (msg.sender as any).role === 'citizen') {
           delete (msg.sender as any)._id; // Strip citizen ID
        }
      });
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching ticket conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Citizen closes a ticket
// @route   PATCH /api/tickets/:id/close
// @access  Private
export const closeTicket = async (req: any, res: Response) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this ticket' });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ message: 'Ticket is already closed' });
    }

    ticket.status = 'CLOSED';
    const updatedTicket = await ticket.save();

    res.json(updatedTicket);
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
