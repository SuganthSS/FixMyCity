export const CATEGORY_TAXONOMY: Record<string, string[]> = {
  'Road Issue': ['Pothole', 'Pavement Damage', 'Missing Signboard', 'Traffic Light Fault', 'Road Divider Damage', 'Other'],
  'Water Leak': ['Pipe Burst', 'Low Pressure', 'Contaminated Water', 'Meter Leak', 'Open Valve', 'Other'],
  'Streetlight Issue': ['Pole Not Working', 'Flickering Lamp', 'Damaged Wiring', 'Exposed Cable', 'Dark Alley', 'Other'],
  'Garbage Issue': ['Uncollected Trash', 'Overflowing Bin', 'Illegal Dumping', 'Stagnant Smell', 'Public Litter', 'Other'],
  'Drainage Issue': ['Blocked Sewer', 'Overflowing Gutter', 'Open Drain', 'Stagnant Floodwater', 'Smelly Drain', 'Other'],
};

export interface StageTransitionConfig {
  allowedNext: string[];
  allowedRoles: string[];
}

export const WORKFLOW_TRANSITIONS: Record<string, StageTransitionConfig> = {
  SUBMITTED: {
    allowedNext: ['TRIAGED', 'DEPT_ASSIGNED', 'REJECTED'],
    allowedRoles: ['admin', 'system'],
  },
  TRIAGED: {
    allowedNext: ['DEPT_ASSIGNED', 'REJECTED'],
    allowedRoles: ['admin'],
  },
  DEPT_ASSIGNED: {
    allowedNext: ['STAFF_ASSIGNED', 'DEPT_ASSIGNED', 'REJECTED'],
    allowedRoles: ['hod', 'admin'],
  },
  STAFF_ASSIGNED: {
    allowedNext: ['IN_PROGRESS', 'WAITING_FOR_CITIZEN', 'DEPT_ASSIGNED'],
    allowedRoles: ['staff', 'hod', 'admin'],
  },
  IN_PROGRESS: {
    allowedNext: ['RESOLVED', 'WAITING_FOR_CITIZEN', 'DEPT_ASSIGNED'],
    allowedRoles: ['staff', 'hod', 'admin'],
  },
  WAITING_FOR_CITIZEN: {
    allowedNext: ['IN_PROGRESS', 'STAFF_ASSIGNED'],
    allowedRoles: ['citizen', 'staff', 'hod', 'admin'],
  },
  RESOLVED: {
    allowedNext: ['CLOSED', 'REOPENED'],
    allowedRoles: ['citizen', 'admin', 'system'],
  },
  REOPENED: {
    allowedNext: ['STAFF_ASSIGNED', 'IN_PROGRESS'],
    allowedRoles: ['staff', 'hod', 'admin'],
  },
  CLOSED: {
    allowedNext: [],
    allowedRoles: ['admin'],
  },
  REJECTED: {
    allowedNext: [],
    allowedRoles: ['admin'],
  },
};
