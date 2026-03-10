export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin',
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isApproved?: boolean;
  isBanned?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  date: string;
}

export interface Message {
  id: string;
  sender: string;
  message: string;
  time: string;
}

export interface ComplaintTimeline {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  citizenId: string;
  citizenName: string;
  department?: Department;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  timeline: ComplaintTimeline[];
}
