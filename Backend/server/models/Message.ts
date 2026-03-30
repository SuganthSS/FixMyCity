import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['citizen', 'staff', 'admin', 'hod'],
    required: true,
  },
  recipientType: {
    type: String,
    enum: ['broadcast', 'staff', 'citizen', 'admin', 'hod'],
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  complaintRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isReadBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  targetAudience: {
    type: String,
    enum: ['citizens', 'staff', 'hod', 'all'],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
