import { Request, Response } from 'express';
import User from '../models/User';
import Complaint from '../models/Complaint';
import Notification from '../models/Notification';
import { sanitizeComplaintForResponse } from './complaintController';

// @desc    Get all complaints in the HOD's department
// @route   GET /api/hod/complaints
// @access  Private (HOD only)
const getDepartmentComplaints = async (req: any, res: Response) => {
  try {
    const hodUser = await User.findById(req.user._id);
    if (!hodUser || !hodUser.department) {
      return res.status(400).json({ message: 'HOD department not configured' });
    }

    const complaints = await Complaint.find({
      $or: [
        { assignedDepartment: hodUser.department },
        { category: hodUser.department },
        { department: hodUser.department },
      ],
    })
      .populate('citizenId', 'name email')
      .populate('assignedStaff', 'name email department')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 });

    const sanitized = complaints.map(c => sanitizeComplaintForResponse(c, req.user.role));
    res.json(sanitized);
  } catch (error) {
    console.error('Error fetching department complaints:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign a complaint to a staff member
// @route   PATCH /api/hod/complaints/:id/assign
// @access  Private (HOD / Admin)
const assignComplaint = async (req: any, res: Response) => {
  try {
    const { staffId, note } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'staffId is required' });
    }

    const hodUser = await User.findById(req.user._id);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role === 'hod') {
      if (!hodUser || !hodUser.department) {
        return res.status(400).json({ message: 'HOD department not configured' });
      }
      const dept = complaint.assignedDepartment || complaint.category;
      if (dept !== hodUser.department) {
        return res.status(403).json({ message: 'Complaint does not belong to your department' });
      }
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }
    if (!staffUser.isApproved || staffUser.isBanned) {
      return res.status(400).json({ message: 'Staff member is not active' });
    }

    complaint.assignedStaff = staffUser._id;
    complaint.assignedTo = staffUser._id;
    complaint.workflowStage = 'STAFF_ASSIGNED';
    complaint.status = 'STAFF_ASSIGNED';
    complaint.lastStatusChangeAt = new Date();

    if (!complaint.metrics?.firstAssignedAt) {
      complaint.metrics = {
        ...(complaint.metrics || {}),
        firstAssignedAt: new Date(),
      };
    }

    const assignmentNote = note || `Assigned to ${staffUser.name} by ${req.user.role.toUpperCase()}`;
    complaint.assignmentHistory.push({
      department: complaint.assignedDepartment || complaint.category,
      assignedStaff: staffUser._id,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      note: assignmentNote,
    });

    complaint.statusHistory.push({
      stage: 'STAFF_ASSIGNED',
      status: 'STAFF_ASSIGNED',
      message: assignmentNote,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    complaint.timeline.push({
      status: 'STAFF_ASSIGNED',
      message: assignmentNote,
      updatedAt: new Date(),
    });

    await complaint.save();

    await Notification.create({
      user: staffUser._id,
      title: 'New Complaint Assignment',
      message: `You have been assigned complaint: ${complaint.title} (${complaint.trackingCode || complaint.complaintCode})`,
      complaint: complaint._id,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email')
      .populate('assignedStaff', 'name email department')
      .populate('assignedTo', 'name email department');

    res.json(sanitizeComplaintForResponse(updated, req.user.role));
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Transfer complaint to another department
// @route   PATCH /api/hod/complaints/:id/transfer-department
// @access  Private (HOD / Admin)
const transferDepartment = async (req: any, res: Response) => {
  try {
    const { targetDepartment, reason } = req.body;
    if (!targetDepartment) {
      return res.status(400).json({ message: 'targetDepartment is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const oldDept = complaint.assignedDepartment || complaint.category;
    complaint.assignedDepartment = targetDepartment;
    complaint.department = targetDepartment;
    complaint.category = targetDepartment;
    complaint.assignedStaff = null;
    complaint.assignedTo = null;
    complaint.workflowStage = 'DEPT_ASSIGNED';
    complaint.status = 'DEPT_ASSIGNED';
    complaint.lastStatusChangeAt = new Date();

    const transferNote = reason || `Department transferred from ${oldDept} to ${targetDepartment}`;

    complaint.assignmentHistory.push({
      department: targetDepartment,
      assignedStaff: undefined,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      note: transferNote,
    });

    complaint.statusHistory.push({
      stage: 'DEPT_ASSIGNED',
      status: 'DEPT_ASSIGNED',
      message: transferNote,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    complaint.timeline.push({
      status: 'DEPT_ASSIGNED',
      message: transferNote,
      updatedAt: new Date(),
    });

    await complaint.save();

    res.json(sanitizeComplaintForResponse(complaint, req.user.role));
  } catch (error: any) {
    console.error('Error transferring department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
          $or: [
            { assignedStaff: s._id },
            { assignedTo: s._id },
          ],
          workflowStage: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] },
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

    const baseQuery = {
      $or: [
        { assignedDepartment: hodUser.department },
        { category: hodUser.department },
      ],
    };

    const [total, unassigned, submitted, inProgress, resolved, rejected] =
      await Promise.all([
        Complaint.countDocuments(baseQuery),
        Complaint.countDocuments({ ...baseQuery, assignedStaff: null, assignedTo: null }),
        Complaint.countDocuments({ ...baseQuery, workflowStage: 'SUBMITTED' }),
        Complaint.countDocuments({ ...baseQuery, workflowStage: 'IN_PROGRESS' }),
        Complaint.countDocuments({ ...baseQuery, workflowStage: 'RESOLVED' }),
        Complaint.countDocuments({ ...baseQuery, workflowStage: 'REJECTED' }),
      ]);

    res.json({
      total,
      unassigned,
      byStatus: {
        SUBMITTED: submitted,
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
  transferDepartment,
  getDepartmentStaff,
  getStaffWorkload,
  getDepartmentStats,
};
