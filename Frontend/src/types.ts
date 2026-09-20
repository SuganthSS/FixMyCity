export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin',
  HOD = 'hod',
}

export enum WorkflowStage {
  SUBMITTED = 'SUBMITTED',
  TRIAGED = 'TRIAGED',
  DEPT_ASSIGNED = 'DEPT_ASSIGNED',
  STAFF_ASSIGNED = 'STAFF_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CITIZEN = 'WAITING_FOR_CITIZEN',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  REOPENED = 'REOPENED',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum ComplaintCategory {
  ROAD_ISSUE = 'Road Issue',
  WATER_LEAK = 'Water Leak',
  STREETLIGHT_ISSUE = 'Streetlight Issue',
  GARBAGE_ISSUE = 'Garbage Issue',
  DRAINAGE_ISSUE = 'Drainage Issue',
}

export const CATEGORY_TAXONOMY: Record<string, string[]> = {
  'Road Issue': ['Pothole', 'Pavement Damage', 'Missing Signboard', 'Traffic Light Fault', 'Road Divider Damage', 'Other'],
  'Water Leak': ['Pipe Burst', 'Low Pressure', 'Contaminated Water', 'Meter Leak', 'Open Valve', 'Other'],
  'Streetlight Issue': ['Pole Not Working', 'Flickering Lamp', 'Damaged Wiring', 'Exposed Cable', 'Dark Alley', 'Other'],
  'Garbage Issue': ['Uncollected Trash', 'Overflowing Bin', 'Illegal Dumping', 'Stagnant Smell', 'Public Litter', 'Other'],
  'Drainage Issue': ['Blocked Sewer', 'Overflowing Gutter', 'Open Drain', 'Stagnant Floodwater', 'Smelly Drain', 'Other'],
};

export enum Department {
  ROAD = 'Road Department',
  WATER = 'Water Department',
  ELECTRICITY = 'Electricity Board',
  WASTE = 'Waste Management',
  DRAINAGE = 'Drainage Department',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Severity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  EXTREME = 'EXTREME',
}

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: string;
  isApproved?: boolean;
  isBanned?: boolean;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  isRead: boolean;
  complaint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: string;
  message: string;
  time: string;
}

export interface MediaItem {
  url: string;
  caption?: string;
  uploadedAt?: string;
  isResolutionProof?: boolean;
}

export interface StatusHistoryItem {
  stage: string;
  status?: string;
  message?: string;
  updatedBy?: any;
  updatedAt: string;
}

export interface AssignmentHistoryItem {
  department?: string;
  assignedStaff?: any;
  assignedBy?: any;
  assignedAt: string;
  note?: string;
}

export interface ResolutionProof {
  images?: string[];
  notes?: string;
  resolvedBy?: any;
  resolvedAt?: string;
}

export interface CitizenFeedback {
  rating: number;
  comment?: string;
  submittedAt?: string;
}

export interface InternalNote {
  note: string;
  author: any;
  role: string;
  createdAt: string;
}

export interface SlaInfo {
  targetResolutionHours?: number;
  dueDate?: string;
  isBreached?: boolean;
  breachedAt?: string;
}

export interface MetricsInfo {
  firstAssignedAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface ComplaintTimeline {
  status: ComplaintStatus | string;
  timestamp?: string;
  updatedAt?: string;
  message?: string;
  note?: string;
}

export interface Complaint {
  _id?: string;
  id: string;
  schemaVersion?: number;
  trackingCode?: string;
  complaintCode?: string;
  title: string;
  description: string;
  category: ComplaintCategory | string;
  subCategory?: string;
  severity?: Severity | string;
  priority: Priority;
  workflowStage?: WorkflowStage | string;
  status: ComplaintStatus | string;
  lastStatusChangeAt?: string;
  citizenId: any;
  citizenName: string;
  assignedDepartment?: string;
  department?: Department | string;
  assignedStaff?: any;
  assignedTo?: any;
  media?: MediaItem[];
  imageUrl?: string;
  location: any;
  latitude?: number;
  longitude?: number;
  statusHistory?: StatusHistoryItem[];
  assignmentHistory?: AssignmentHistoryItem[];
  resolutionProof?: ResolutionProof;
  resolutionVerified?: boolean;
  citizenFeedback?: CitizenFeedback;
  internalNotes?: InternalNote[];
  sla?: SlaInfo;
  metrics?: MetricsInfo;
  createdAt: string;
  updatedAt: string;
  timeline?: ComplaintTimeline[];
  upvotes: string[];
  landmark?: string;
  issueDate?: string;
  recurringIssue?: boolean;
}
