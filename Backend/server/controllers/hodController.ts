import { Request, Response } from 'express';
import User from '../models/User.ts';
import Complaint from '../models/Complaint.ts';
import Notification from '../models/Notification.ts';

// @desc    Get all complaints in the HOD's department
// @route   GET /api/hod/complaints
// @access  Private (HOD only)
const getDepartmentComplaints = async (req: any, res: Response) => {
  try {
    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const complaints = await Complaint.find({ category: hodUser.department })
      .populate('citizenId', 'name email')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching department complaints:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign a complaint to a staff member
// @route   PATCH /api/hod/complaints/:id/assign
// @access  Private (HOD only)
const assignComplaint = async (req: any, res: Response) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'staffId is required' });
    }

    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify complaint belongs to HOD's department
    if (complaint.category !== hodUser.department) {
      return res.status(403).json({ message: 'Complaint does not belong to your department' });
    }

    // Verify staff belongs to same department
    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }
    if (staffUser.department !== hodUser.department) {
      return res.status(400).json({ message: 'Staff member is not in your department' });
    }
    if (!staffUser.isApproved || staffUser.isBanned) {
      return res.status(400).json({ message: 'Staff member is not active' });
    }

    // Assign the complaint
    complaint.assignedTo = staffUser._id;
    if (complaint.status === 'SUBMITTED') {
      complaint.status = 'ASSIGNED';
    }
    complaint.timeline.push({
      status: 'ASSIGNED',
      message: `Assigned to ${staffUser.name} by HOD`,
      updatedAt: new Date(),
    });
    await complaint.save();

    // Create notification for the staff member
    await Notification.create({
      user: staffUser._id,
      title: 'New Complaint Assignment',
      message: `You have been assigned complaint: ${complaint.title}`,
      complaint: complaint._id,
    });

    // Return updated complaint with populated fields
    const updated = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email')
      .populate('assignedTo', 'name email department');

    res.json(updated);
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all approved staff in the HOD's department
// @route   GET /api/hod/staff
// @access  Private (HOD only)
const getDepartmentStaff = async (req: any, res: Response) => {
  try {
    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const staff = await User.find({
      role: 'staff',
      department: hodUser.department,
      isApproved: true,
      isBanned: false,
    }).select('name email department _id');

    res.json(staff);
  } catch (error) {
    console.error('Error fetching department staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get staff workload (active complaint count per staff)
// @route   GET /api/hod/staff/workload
// @access  Private (HOD only)
const getStaffWorkload = async (req: any, res: Response) => {
  try {
    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const staff = await User.find({
      role: 'staff',
      department: hodUser.department,
      isApproved: true,
      isBanned: false,
    }).select('name email _id');

    const workload = await Promise.all(
      staff.map(async (s) => {
        const activeComplaints = await Complaint.countDocuments({
          assignedTo: s._id,
          status: { $nin: ['RESOLVED', 'REJECTED'] },
        });
        return {
          staffId: s._id,
          staffName: s.name,
          staffEmail: s.email,
          activeComplaints,
        };
      })
    );

    res.json(workload);
  } catch (error) {
    console.error('Error fetching staff workload:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get department statistics
// @route   GET /api/hod/stats
// @access  Private (HOD only)
const getDepartmentStats = async (req: any, res: Response) => {
  try {
    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const baseQuery = { category: hodUser.department };

    const [total, unassigned, submitted, underReview, assigned, inProgress, resolved, rejected] =
      await Promise.all([
        Complaint.countDocuments(baseQuery),
        Complaint.countDocuments({ ...baseQuery, assignedTo: null }),
        Complaint.countDocuments({ ...baseQuery, status: 'SUBMITTED' }),
        Complaint.countDocuments({ ...baseQuery, status: 'UNDER_REVIEW' }),
        Complaint.countDocuments({ ...baseQuery, status: 'ASSIGNED' }),
        Complaint.countDocuments({ ...baseQuery, status: 'IN_PROGRESS' }),
        Complaint.countDocuments({ ...baseQuery, status: 'RESOLVED' }),
        Complaint.countDocuments({ ...baseQuery, status: 'REJECTED' }),
      ]);

    res.json({
      total,
      unassigned,
      byStatus: {
        SUBMITTED: submitted,
        UNDER_REVIEW: underReview,
        ASSIGNED: assigned,
        IN_PROGRESS: inProgress,
        RESOLVED: resolved,
        REJECTED: rejected,
      },
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getDepartmentComplaints,
  assignComplaint,
  getDepartmentStaff,
  getStaffWorkload,
  getDepartmentStats,
};
