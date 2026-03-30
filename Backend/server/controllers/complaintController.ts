import { Request, Response } from 'express';
import Complaint from '../models/Complaint.ts';
import Notification from '../models/Notification.ts';
import { analyzeComplaint } from '../services/mlService.ts';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req: any, res: Response) => {
  try {
    const { 
      title, 
      description, 
      location, 
      latitude, 
      longitude, 
      category, 
      priority,
      landmark,
      issueDate,
      recurringIssue
    } = req.body;
    const sanitizedCategory = category && category !== 'undefined' ? category : undefined;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '';

    console.log('Submission Body:', req.body);
    console.log('Submission File:', req.file);

    // Explicitly parse boolean and handle Date
    const parsedRecurringIssue = recurringIssue === 'true' || recurringIssue === true;
    const parsedIssueDate = issueDate ? new Date(issueDate) : undefined;

    // ML Service Integration
    const mlAnalysis = await analyzeComplaint(title, description, imageUrl);

    // Generate complaintCode
    const lastComplaint = await Complaint.findOne({ complaintCode: { $exists: true } }).sort({ createdAt: -1 });
    let nextCodeNum = 1001;
    if (lastComplaint && lastComplaint.complaintCode) {
      const match = lastComplaint.complaintCode.match(/CMP-(\d+)/);
      if (match) {
        nextCodeNum = parseInt(match[1], 10) + 1;
      }
    }
    const complaintCode = `CMP-${nextCodeNum}`;

    const complaint = await Complaint.create({
      complaintCode,
      title,
      description,
      location,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      imageUrl,
      category: sanitizedCategory || mlAnalysis.category,
      department: sanitizedCategory || mlAnalysis.category,
      priority: priority || mlAnalysis.priority || 'MEDIUM',
      landmark,
      issueDate: parsedIssueDate,
      recurringIssue: parsedRecurringIssue,
      citizenId: req.user._id,
      citizenName: req.user.name,
      timeline: [
        {
          status: 'SUBMITTED',
          message: 'Complaint has been submitted successfully.',
        },
      ],
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(400).json({ message: 'Invalid complaint data' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req: any, res: Response) => {
  try {
    let query: any = {};
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    }

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    if (req.query.complaintCode) {
      query.complaintCode = { $regex: new RegExp(`^${req.query.complaintCode}$`, 'i') };
    }

    // Staff filter: only assigned complaints unless searching for messaging
    if (req.user.role === 'staff' && !req.query.search && !req.query.complaintCode) {
      query.assignedTo = req.user._id;
    }

    let complaints = await Complaint.find(query).select('+department').populate('citizenId', 'name email');
    console.log(`DEBUG: Found ${complaints.length} complaints for query`, query);

    // Privacy rules for STAFF - allow info if searching for messaging purposes
    if (req.user.role === 'staff' && !req.query.search) {
      complaints = complaints.map((complaint: any) => {
        const c = complaint.toObject() as any;
        delete c.citizenId;
        delete c.citizenName;
        return c;
      });
    }

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req: any, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('citizenId', 'name email');

    if (complaint) {
      // Access control: only creator, staff or admin
      if (req.user.role === 'admin' || req.user.role === 'staff' || complaint.citizenId._id.toString() === req.user._id.toString()) {
        let responseData = complaint.toObject() as any;

        // Privacy rules for STAFF
        if (req.user.role === 'staff') {
          delete responseData.citizenId;
          delete responseData.citizenName;
        }

        res.json(responseData);
      } else {
        res.status(403).json({ message: 'Not authorized to view this complaint' });
      }
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private/Admin
const updateComplaintStatus = async (req: any, res: Response) => {
  try {
    const { status, message } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      if (status) {
        complaint.status = status;
        complaint.timeline.push({
          status,
          message: message || `Status updated to ${status}`,
        });
      }

      if (status) {
        // Create notification for citizen
        await Notification.create({
          user: complaint.citizenId,
          title: 'Status Updated',
          message: `Your complaint status was updated to ${status}`,
          complaint: complaint._id
        });
      }

      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint department
// @route   PATCH /api/complaints/:id/department
// @access  Private/Staff/Admin
const updateComplaintDepartment = async (req: any, res: Response) => {
  return res.status(410).json({ message: 'Department is now set automatically by the AI classifier. Manual override is disabled.' });
};

// @desc    Update complaint priority
// @route   PATCH /api/complaints/:id/priority
// @access  Private/Admin
const updateComplaintPriority = async (req: any, res: Response) => {
  try {
    const { priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.priority = priority || complaint.priority;

      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all public complaints
// @route   GET /api/complaints/public
// @access  Private
const getPublicComplaints = async (req: any, res: Response) => {
  try {
    let complaints = await Complaint.find().select('-citizenId -citizenName');
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle upvote on a complaint
// @route   PATCH /api/complaints/:id/upvote
// @access  Private
const toggleUpvote = async (req: any, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const userId = req.user._id.toString();
    const upvoteIndex = complaint.upvotes.findIndex(
      (id) => id.toString() === userId
    );

    if (upvoteIndex === -1) {
      // Add upvote
      complaint.upvotes.push(req.user._id);
    } else {
      // Remove upvote
      complaint.upvotes.splice(upvoteIndex, 1);
    }

    // Auto priority escalation
    const upvoteCount = complaint.upvotes.length;
    let newPriority = complaint.priority;

    if (upvoteCount > 100) {
      newPriority = 'CRITICAL';
    } else if (upvoteCount > 50) {
      newPriority = 'HIGH';
    } else if (upvoteCount > 10) {
      newPriority = 'MEDIUM';
    } else {
      newPriority = 'LOW';
    }

    if (newPriority !== complaint.priority) {
      complaint.priority = newPriority;
      complaint.timeline.push({
        status: complaint.status,
        message: `Priority updated to ${newPriority} based on community upvotes (${upvoteCount} votes)`,
        updatedAt: new Date(),
      });
    }

    const updatedComplaint = await complaint.save();
    
    // Privacy rules for returning
    const responseData = updatedComplaint.toObject() as any;
    delete responseData.citizenId;
    delete responseData.citizenName;

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintDepartment,
  getPublicComplaints,
  toggleUpvote,
};
