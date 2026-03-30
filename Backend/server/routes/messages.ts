import express from 'express';
import { protect } from '../middleware/authMiddleware.ts';
import Message from '../models/Message.ts';
import User from '../models/User.ts';

const router = express.Router();

// GET /api/messages/find-hod?department=Road Issue
router.get('/find-hod', protect, async (req: any, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ message: 'department query parameter is required' });
    }

    const hod = await User.findOne({
      role: 'hod',
      department: department as string,
    }).select('_id name email department');

    if (!hod) {
      return res.status(404).json({ message: 'No HOD found for this department' });
    }

    res.json(hod);
  } catch (error) {
    console.error('Error finding HOD:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/unread-count
router.get('/unread-count', protect, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let query: any = { recipient: userId, isRead: false };

    if (role === 'citizen') {
      query = {
        $or: [
          { recipient: userId, isRead: false },
          { recipientType: 'broadcast', targetAudience: { $in: ['citizens', 'all'] }, isReadBy: { $ne: userId } },
        ],
      };
    } else if (role === 'staff') {
      query = {
        $or: [
          { recipient: userId, isRead: false },
          { recipientType: 'broadcast', targetAudience: { $in: ['staff', 'all'] }, isReadBy: { $ne: userId } },
        ],
      };
    } else if (role === 'hod') {
      query = {
        $or: [
          { recipient: userId, isRead: false },
          { recipientType: 'broadcast', targetAudience: { $in: ['hod', 'all'] }, isReadBy: { $ne: userId } },
        ],
      };
    } else if (role === 'admin') {
      query = { recipientType: 'admin', isRead: false };
    }

    const count = await Message.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/inbox
router.get('/inbox', protect, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let messages: any[] = [];

    if (role === 'citizen') {
      // Citizens see: targeted broadcasts + ticket-threaded messages only
      messages = await Message.find({
        $or: [
          { recipientType: 'broadcast', targetAudience: { $in: ['citizens', 'all'] } },
          { recipient: userId, thread: { $ne: null } },
        ],
      })
        .populate('sender', 'name email role')
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 });
    } else if (role === 'staff') {
      // Staff see: direct messages where they are recipient + targeted broadcasts
      messages = await Message.find({
        $or: [
          { recipient: userId },
          { recipientType: 'broadcast', targetAudience: { $in: ['staff', 'all'] } },
        ],
      })
        .populate('sender', 'name email role')
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 });
    } else if (role === 'admin') {
      // Admin see: messages where recipientType is 'admin' (HOD escalations), excluding self-sent
      messages = await Message.find({
        recipientType: 'admin',
        sender: { $ne: userId }
      })
        .populate('sender', 'name email role')
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 });
    } else if (role === 'hod') {
      // HOD see: direct messages where they are recipient + targeted broadcasts
      messages = await Message.find({
        $or: [
          { recipient: userId },
          { recipientType: 'broadcast', targetAudience: { $in: ['hod', 'all'] } },
        ],
      })
        .populate('sender', 'name email role')
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/sent
router.get('/sent', protect, async (req: any, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/thread/:threadId
router.get('/thread/:threadId', protect, async (req: any, res) => {
  try {
    const { threadId } = req.params;
    const messages = await Message.find({
      $or: [{ _id: threadId }, { thread: threadId }],
    })
      .populate('sender', 'name email role')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/messages/:id/read
router.patch('/:id/read', protect, async (req: any, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipientType === 'broadcast') {
      if (!message.isReadBy.includes(req.user._id)) {
        message.isReadBy.push(req.user._id);
        await message.save();
      }
    } else {
      if (message.recipient?.toString() === req.user._id.toString()) {
        message.isRead = true;
        await message.save();
      }
    }

    res.json(message);
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages
router.post('/', protect, async (req: any, res) => {
  try {
    const { recipientType, recipient, complaintRef, content, thread, targetAudience } = req.body;
    const sender = req.user._id;
    const senderRole = req.user.role;

    const newMessage = new Message({
      sender,
      senderRole,
      recipientType,
      recipient: recipient || null,
      complaintRef: complaintRef || null,
      content,
      thread: thread || null,
      targetAudience: recipientType === 'broadcast' ? (targetAudience || 'all') : null,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
