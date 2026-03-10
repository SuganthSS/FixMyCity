import { Complaint, ComplaintStatus, ComplaintCategory, Priority, Department } from './types';

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    title: 'Huge Pothole on Main Street',
    description: 'There is a very deep pothole near the intersection of Main and Oak. It is dangerous for cyclists and small cars.',
    category: ComplaintCategory.ROAD_ISSUE,
    status: ComplaintStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    citizenId: 'user1',
    citizenName: 'John Citizen',
    department: Department.ROAD,
    location: '123 Main St, Downtown',
    imageUrl: 'https://picsum.photos/seed/pothole/800/600',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-03T14:30:00Z',
    timeline: [
      { status: ComplaintStatus.SUBMITTED, timestamp: '2024-03-01T10:00:00Z', note: 'Issue reported by citizen.' },
      { status: ComplaintStatus.UNDER_REVIEW, timestamp: '2024-03-02T09:00:00Z', note: 'Assigned to inspection team.' },
      { status: ComplaintStatus.ASSIGNED, timestamp: '2024-03-02T11:00:00Z', note: 'Assigned to Road Department.' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: '2024-03-03T14:30:00Z', note: 'Repair crew dispatched.' },
    ]
  },
  {
    id: '2',
    title: 'Broken Streetlight',
    description: 'The streetlight outside house number 45 has been flickering and now it is completely out.',
    category: ComplaintCategory.STREETLIGHT_ISSUE,
    status: ComplaintStatus.SUBMITTED,
    priority: Priority.MEDIUM,
    citizenId: 'user1',
    citizenName: 'John Citizen',
    location: '45 Sunset Blvd',
    imageUrl: 'https://picsum.photos/seed/light/800/600',
    createdAt: '2024-03-04T18:20:00Z',
    updatedAt: '2024-03-04T18:20:00Z',
    timeline: [
      { status: ComplaintStatus.SUBMITTED, timestamp: '2024-03-04T18:20:00Z', note: 'Issue reported.' }
    ]
  },
  {
    id: '3',
    title: 'Water Leakage in Park',
    description: 'A pipe seems to have burst near the public fountain in Central Park. Water is flooding the walkway.',
    category: ComplaintCategory.WATER_LEAK,
    status: ComplaintStatus.RESOLVED,
    priority: Priority.URGENT,
    citizenId: 'user2',
    citizenName: 'Jane Smith',
    department: Department.WATER,
    location: 'Central Park, North Entrance',
    imageUrl: 'https://picsum.photos/seed/water/800/600',
    createdAt: '2024-02-25T08:15:00Z',
    updatedAt: '2024-02-26T16:00:00Z',
    timeline: [
      { status: ComplaintStatus.SUBMITTED, timestamp: '2024-02-25T08:15:00Z' },
      { status: ComplaintStatus.ASSIGNED, timestamp: '2024-02-25T10:00:00Z' },
      { status: ComplaintStatus.RESOLVED, timestamp: '2024-02-26T16:00:00Z', note: 'Pipe replaced and area cleaned.' }
    ]
  },
  {
    id: '4',
    title: 'Garbage Pileup',
    description: 'Garbage has not been collected for over a week at the corner of 5th and Maple.',
    category: ComplaintCategory.GARBAGE_ISSUE,
    status: ComplaintStatus.ASSIGNED,
    priority: Priority.LOW,
    citizenId: 'user1',
    citizenName: 'John Citizen',
    department: Department.WASTE,
    location: 'Corner of 5th and Maple',
    imageUrl: 'https://picsum.photos/seed/garbage/800/600',
    createdAt: '2024-03-05T09:00:00Z',
    updatedAt: '2024-03-05T11:30:00Z',
    timeline: [
      { status: ComplaintStatus.SUBMITTED, timestamp: '2024-03-05T09:00:00Z' },
      { status: ComplaintStatus.ASSIGNED, timestamp: '2024-03-05T11:30:00Z' }
    ]
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', message: 'Your complaint has been moved to UNDER_REVIEW', date: '2 hours ago' },
  { id: 'n2', message: 'Complaint #1 has been assigned to Road Department', date: '5 hours ago' },
  { id: 'n3', message: 'Your complaint about water leak has been RESOLVED', date: '1 day ago' },
];

export const MOCK_MESSAGES = [
  { id: 'm1', sender: 'Admin', message: 'Your complaint is being reviewed', time: '10 minutes ago' },
  { id: 'm2', sender: 'Road Dept', message: 'Crew is on the way to Main St', time: '1 hour ago' },
  { id: 'm3', sender: 'Support', message: 'Thank you for your feedback!', time: '2 hours ago' },
];
