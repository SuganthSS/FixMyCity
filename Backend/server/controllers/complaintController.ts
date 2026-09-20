import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import { Counter } from '../models/Counter';
import Notification from '../models/Notification';
import { WORKFLOW_TRANSITIONS, CATEGORY_TAXONOMY } from '../config/workflow';
import { analyzeComplaint } from '../services/mlService';

export const sanitizeComplaintForResponse = (complaintDoc: any, requesterRole?: string, isSearch: boolean = false) => {
  const plainObj = typeof complaintDoc.toObject === 'function' ? complaintDoc.toObject() : { ...complaintDoc };

  if (requesterRole === 'citizen') {
    delete plainObj.internalNotes;
    delete plainObj.auditLogs;
  }

  if (requesterRole === 'staff' && !isSearch) {
    delete plainObj.citizenId;
    delete plainObj.citizenName;
  }

  return plainObj;
};

// @desc    Create a new complaint (V2)
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req: any, res: Response) => {
  try {
    const { 
      title, 
      description, 
      category,
      subCategory,
      severity,
      location, 
      latitude, 
      longitude, 
      landmark,
      issueDate,
      recurringIssue
    } = req.body;

    const sanitizedCategory = category && category !== 'undefined' ? category : undefined;
    const currentYear = new Date().getFullYear();
    const counterKey = `complaint_tracking_${currentYear}`;

    const counter = await Counter.findOneAndUpdate(
      { _id: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const trackingCode = `FMC-${currentYear}-${String(counter.seq).padStart(4, '0')}`;

    const uploadedFiles = req.files as Express.Multer.File[] | undefined;
    let media: Array<{ url: string; caption?: string; uploadedAt?: Date; isResolutionProof?: boolean }> = [];

    if (uploadedFiles && uploadedFiles.length > 0) {
      media = uploadedFiles.slice(0, 5).map((file) => ({
        url: `/uploads/${file.filename}`,
        caption: 'Report Image',
        uploadedAt: new Date(),
        isResolutionProof: false,
      }));
    } else if (req.file) {
      media = [{
        url: `/uploads/${req.file.filename}`,
        caption: 'Report Image',
        uploadedAt: new Date(),
        isResolutionProof: false,
      }];
    } else if (req.body.imageUrl) {
      media = [{
        url: req.body.imageUrl,
        caption: 'Report Image',
        uploadedAt: new Date(),
        isResolutionProof: false,
      }];
    }

    const primaryImageUrl = media.length > 0 ? media[0].url : '';

    const parsedRecurringIssue = recurringIssue === 'true' || recurringIssue === true;
    const parsedIssueDate = issueDate ? new Date(issueDate) : undefined;

    let mlAnalysis = { category: 'General', priority: 'MEDIUM' };
    try {
      mlAnalysis = await analyzeComplaint(title, description, primaryImageUrl);
    } catch (e) {
      console.warn('ML Analysis skipped or failed:', e);
    }

    const finalCategory = sanitizedCategory || mlAnalysis.category;
    const parsedSubCategory = subCategory || (CATEGORY_TAXONOMY[finalCategory] ? CATEGORY_TAXONOMY[finalCategory][0] : 'General');
    const parsedSeverity = severity || 'MODERATE';

    const createdDate = new Date();
    const dueDate = new Date(createdDate.getTime() + 48 * 60 * 60 * 1000);

    const locationObj = {
      address: typeof location === 'string' ? location : location?.address || description?.substring(0, 50) || '',
      landmark: landmark || location?.landmark || '',
      city: location?.city || 'Default City',
      ward: location?.ward || 'General',
      pincode: location?.pincode || '',
      coordinates: {
        latitude: latitude ? Number(latitude) : location?.coordinates?.latitude,
        longitude: longitude ? Number(longitude) : location?.coordinates?.longitude,
      },
    };

    let geoPoint = null;
    if (locationObj.coordinates.latitude !== undefined && locationObj.coordinates.longitude !== undefined) {
      geoPoint = {
        type: 'Point',
        coordinates: [locationObj.coordinates.longitude, locationObj.coordinates.latitude],
      };
    }

    const complaint = await Complaint.create({
      schemaVersion: 2,
      createdByRole: req.user.role || 'citizen',
      trackingCode,
      complaintCode: trackingCode,
      title,
      description,
      category: finalCategory,
      subCategory: parsedSubCategory,
      severity: parsedSeverity,
      workflowStage: 'SUBMITTED',
      status: 'SUBMITTED',
      assignedDepartment: finalCategory,
      department: finalCategory,
      media,
      imageUrl: primaryImageUrl,
      location: locationObj,
      geoPoint,
      latitude: locationObj.coordinates.latitude,
      longitude: locationObj.coordinates.longitude,
      landmark: locationObj.landmark,
      issueDate: parsedIssueDate,
      recurringIssue: parsedRecurringIssue,
      citizenId: req.user._id,
      citizenName: req.user.name,
      sla: {
        targetResolutionHours: 48,
        dueDate,
        isBreached: false,
      },
      statusHistory: [
        {
          stage: 'SUBMITTED',
          status: 'SUBMITTED',
          message: 'Complaint submitted successfully.',
          updatedBy: req.user._id,
          updatedAt: createdDate,
        },
      ],
      timeline: [
        {
          status: 'SUBMITTED',
          message: 'Complaint has been submitted successfully.',
          updatedAt: createdDate,
        },
      ],
    });

    res.status(201).json(sanitizeComplaintForResponse(complaint, req.user.role));
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    res.status(400).json({ message: 'Invalid complaint data', error: error.message });
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

    if (req.query.complaintCode || req.query.trackingCode) {
      const code = req.query.trackingCode || req.query.complaintCode;
      query.$or = [
        { trackingCode: { $regex: new RegExp(`^${code}$`, 'i') } },
        { complaintCode: { $regex: new RegExp(`^${code}$`, 'i') } },
      ];
    }

    if (req.user.role === 'staff' && !req.query.search && !req.query.complaintCode && !req.query.trackingCode) {
      query.$or = [
        { assignedStaff: req.user._id },
        { assignedTo: req.user._id },
      ];
    }

    const complaints = await Complaint.find(query).select('+department').populate('citizenId', 'name email');
    const isSearch = Boolean(req.query.search);
    const responseData = complaints.map((c) => sanitizeComplaintForResponse(c, req.user.role, isSearch));

    res.json(responseData);
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

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.citizenId._id.toString() === req.user._id.toString();
    const isAuthorized = req.user.role === 'admin' || req.user.role === 'hod' || req.user.role === 'staff' || isOwner;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.json(sanitizeComplaintForResponse(complaint, req.user.role));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint workflow stage
// @route   PATCH /api/complaints/:id/stage
// @access  Private (Staff, HOD, Admin)
const updateComplaintStage = async (req: any, res: Response) => {
  try {
    const { stage, message, completionNotes, resolutionImages } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const currentStage = complaint.workflowStage || 'SUBMITTED';
    const transitionRule = WORKFLOW_TRANSITIONS[currentStage];

    if (!transitionRule || !transitionRule.allowedNext.includes(stage)) {
      return res.status(400).json({
        message: `Invalid stage transition from ${currentStage} to ${stage}. Allowed next stages: ${transitionRule?.allowedNext.join(', ') || 'None'}`,
      });
    }

    if (!transitionRule.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not permitted to transition from ${currentStage}. Required roles: ${transitionRule.allowedRoles.join(', ')}`,
      });
    }

    if (stage === 'RESOLVED') {
      if (!completionNotes || completionNotes.trim() === '') {
        return res.status(400).json({ message: 'Completion notes are required when resolving a complaint.' });
      }

      const images = Array.isArray(resolutionImages) ? resolutionImages : (req.files ? (req.files as Express.Multer.File[]).map(f => `/uploads/${f.filename}`) : []);
      if (images.length === 0) {
        return res.status(400).json({ message: 'At least one resolution proof image is required to resolve a complaint.' });
      }

      complaint.resolutionProof = {
        images,
        notes: completionNotes,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
      };
      complaint.metrics = {
        ...(complaint.metrics || {}),
        resolvedAt: new Date(),
      };
    }

    if (stage === 'CLOSED') {
      complaint.metrics = {
        ...(complaint.metrics || {}),
        closedAt: new Date(),
      };
    }

    complaint.workflowStage = stage;
    complaint.status = stage;
    complaint.lastStatusChangeAt = new Date();

    const stageMessage = message || `Workflow stage updated to ${stage}`;
    complaint.statusHistory.push({
      stage,
      status: stage,
      message: stageMessage,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    complaint.timeline.push({
      status: stage,
      message: stageMessage,
      updatedAt: new Date(),
    });

    await Notification.create({
      user: complaint.citizenId,
      title: `Complaint Stage: ${stage}`,
      message: `Your complaint stage was updated to ${stage}`,
      complaint: complaint._id,
    });

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error: any) {
    console.error('Error updating stage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Legacy update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private/Admin
const updateComplaintStatus = async (req: any, res: Response) => {
  return updateComplaintStage(req, res);
};

// @desc    Submit citizen feedback
// @route   POST /api/complaints/:id/feedback
// @access  Private (Citizen owner only)
const submitFeedback = async (req: any, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the complaint owner can submit feedback' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    complaint.citizenFeedback = {
      rating: numRating,
      comment: comment || '',
      submittedAt: new Date(),
    };

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reopen a complaint
// @route   POST /api/complaints/:id/reopen
// @access  Private (Citizen owner only)
const reopenComplaint = async (req: any, res: Response) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the complaint owner can reopen the complaint' });
    }

    if (complaint.workflowStage !== 'RESOLVED') {
      return res.status(400).json({ message: 'Only resolved complaints can be reopened' });
    }

    const resolvedAt = complaint.metrics?.resolvedAt || complaint.resolutionProof?.resolvedAt;
    if (resolvedAt) {
      const daysDiff = (new Date().getTime() - new Date(resolvedAt).getTime()) / (1000 * 3600 * 24);
      if (daysDiff > 7) {
        return res.status(400).json({ message: 'Complaints can only be reopened within 7 days of resolution' });
      }
    }

    complaint.workflowStage = 'REOPENED';
    complaint.status = 'REOPENED';
    complaint.resolutionVerified = false;
    complaint.lastStatusChangeAt = new Date();

    const msg = reason || 'Complaint reopened by citizen';
    complaint.statusHistory.push({
      stage: 'REOPENED',
      status: 'REOPENED',
      message: msg,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    complaint.timeline.push({
      status: 'REOPENED',
      message: msg,
      updatedAt: new Date(),
    });

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error: any) {
    console.error('Error reopening complaint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add internal note
// @route   POST /api/complaints/:id/internal-notes
// @access  Private (Staff, HOD, Admin)
const addInternalNote = async (req: any, res: Response) => {
  try {
    const { note } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.internalNotes.push({
      note,
      author: req.user._id,
      role: req.user.role,
      createdAt: new Date(),
    });

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error: any) {
    console.error('Error adding internal note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add public/role comment
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req: any, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.comments.push({
      text,
      author: req.user._id,
      role: req.user.role,
      createdAt: new Date(),
    });

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateComplaintDepartment = async (req: any, res: Response) => {
  return res.status(410).json({ message: 'Department is set via transfer-department endpoint by HOD/Admin.' });
};

const updateComplaintPriority = async (req: any, res: Response) => {
  try {
    const { priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.priority = priority || complaint.priority;
      const updatedComplaint = await complaint.save();
      res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPublicComplaints = async (req: any, res: Response) => {
  try {
    const complaints = await Complaint.find().select('-citizenId -citizenName -internalNotes -auditLogs');
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      complaint.upvotes.push(req.user._id);
    } else {
      complaint.upvotes.splice(upvoteIndex, 1);
    }

    const updatedComplaint = await complaint.save();
    res.json(sanitizeComplaintForResponse(updatedComplaint, req.user.role));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
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
  updateComplaintDepartment,
  getPublicComplaints,
  toggleUpvote,
};
