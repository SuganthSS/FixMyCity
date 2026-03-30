import { Request, Response } from 'express';
import User from '../models/User.ts';

// @desc    Approve staff account
// @route   PATCH /api/admin/approve-staff/:id
// @access  Private/Admin
const approveStaff = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role !== 'staff') {
        res.status(400).json({ message: 'User is not a staff member' });
        return;
      }

      user.isApproved = true;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Ban user or staff
// @route   PATCH /api/admin/ban-user/:id
// @access  Private/Admin
const banUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isBanned = true;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        isBanned: updatedUser.isBanned,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unban user or staff
// @route   PATCH /api/admin/unban-user/:id
// @access  Private/Admin
const unbanUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isBanned = false;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        isBanned: updatedUser.isBanned,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (for admin dashboard)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign department to staff
// @route   PATCH /api/admin/assign-department/:userId
// @access  Private/Admin
const assignDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.body;
    const user = await User.findById(req.params.userId);

    if (user) {
      if (user.role !== 'staff' && user.role !== 'hod') {
        res.status(400).json({ message: 'Can only assign departments to staff or HOD members' });
        return;
      }
      
      const validDepartments = ['Road Issue', 'Water Leak', 'Streetlight Issue', 'Garbage Issue', 'Drainage Issue'];
      if (!validDepartments.includes(department)) {
         res.status(400).json({ message: 'Invalid department' });
         return;
      }

      user.department = department;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        isApproved: updatedUser.isApproved,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { approveStaff, banUser, unbanUser, getUsers, assignDepartment };
