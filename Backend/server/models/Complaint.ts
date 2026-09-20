import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    schemaVersion: {
      type: Number,
      default: 2,
    },
    createdByRole: {
      type: String,
      default: 'citizen',
    },
    trackingCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    complaintCode: {
      type: String,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      default: 'General',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'SEVERE', 'EXTREME'],
      default: 'MODERATE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    workflowStage: {
      type: String,
      enum: [
        'SUBMITTED',
        'TRIAGED',
        'DEPT_ASSIGNED',
        'STAFF_ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_CITIZEN',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
      ],
      default: 'SUBMITTED',
    },
    status: {
      type: String,
      default: 'SUBMITTED',
    },
    lastStatusChangeAt: {
      type: Date,
      default: Date.now,
    },
    assignedDepartment: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, default: 'image' },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
        isResolutionProof: { type: Boolean, default: false },
      },
    ],
    imageUrl: {
      type: String,
    },
    location: {
      address: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      ward: { type: String, default: '' },
      pincode: { type: String, default: '' },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    geoPoint: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    landmark: {
      type: String,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    citizenName: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['WEB', 'MOBILE', 'ADMIN'],
      default: 'WEB',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metrics: {
      firstAssignedAt: { type: Date },
      firstResponseAt: { type: Date },
      resolvedAt: { type: Date },
      closedAt: { type: Date },
    },
    statusHistory: [
      {
        stage: { type: String, required: true },
        status: { type: String },
        message: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        status: String,
        message: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignmentHistory: [
      {
        department: { type: String },
        assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    auditLogs: [
      {
        action: { type: String, required: true },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorRole: { type: String },
        details: { type: mongoose.Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolutionProof: {
      images: [{ type: String }],
      notes: { type: String, default: '' },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: { type: Date },
    },
    resolutionVerified: {
      type: Boolean,
      default: false,
    },
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    citizenActionRequest: {
      requestType: { type: String },
      message: { type: String },
      requestedAt: { type: Date },
      isResolved: { type: Boolean, default: false },
      resolvedAt: { type: Date },
    },
    comments: [
      {
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    internalNotes: [
      {
        note: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    sla: {
      targetResolutionHours: { type: Number, default: 48 },
      dueDate: { type: Date },
      isBreached: { type: Boolean, default: false },
      breachedAt: { type: Date },
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    issueDate: {
      type: Date,
    },
    recurringIssue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Database Indexes
complaintSchema.index({ workflowStage: 1 });
complaintSchema.index({ assignedDepartment: 1 });
complaintSchema.index({ assignedStaff: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ geoPoint: '2dsphere' }, { sparse: true });

// Virtual Getters for Full Backward Compatibility
complaintSchema.virtual('legacyComplaintCode').get(function () {
  return this.trackingCode || this.complaintCode;
});

complaintSchema.virtual('legacyStatus').get(function () {
  return this.workflowStage || this.status;
});

complaintSchema.virtual('legacyDepartment').get(function () {
  return this.assignedDepartment || this.department;
});

complaintSchema.virtual('legacyAssignedTo').get(function () {
  return this.assignedStaff || this.assignedTo;
});

complaintSchema.virtual('legacyImageUrl').get(function () {
  return (this.media && this.media.length > 0 && this.media[0].url) ? this.media[0].url : this.imageUrl;
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
