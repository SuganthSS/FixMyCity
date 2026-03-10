import { Request, Response } from 'express';
import Complaint from '../models/Complaint.ts';
import { analyzeComplaint } from '../services/mlService.ts';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req: any, res: Response) => {
  try {
    const { title, description, location, latitude, longitude, category, priority } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // ML Service Integration
    const mlAnalysis = await analyzeComplaint(description, imageUrl);

    const complaint = await Complaint.create({
      title,
      description,
      location,
      latitude,
      longitude,
      imageUrl,
      category: category || mlAnalysis.category,
      priority: priority || mlAnalysis.priority,
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
    console.error(error);
    res.status(400).json({ message: 'Invalid complaint data' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req: any, res: Response) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query = { citizenId: req.user._id };
    }

    let complaints = await Complaint.find(query).populate('citizenId', 'name email');

    // Privacy rules for STAFF
    if (req.user.role === 'staff') {
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
  try {
    const { department } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.department = department || complaint.department;

      if (department) {
        complaint.timeline.push({
          status: complaint.status,
          message: `Complaint assigned to department: ${department}`,
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

export {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintDepartment,
};
