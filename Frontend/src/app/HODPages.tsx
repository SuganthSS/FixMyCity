import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertCircle,
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../components/UI';
import { hodApi } from '../services/hodApi';

interface ComplaintItem {
  _id: string;
  complaintCode?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  citizenName: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
  createdAt: string;
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface StaffWorkload {
  staffId: string;
  staffName: string;
  staffEmail: string;
  activeComplaints: number;
}

const priorityColor = (p: string) => {
  switch (p) {
    case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
    case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'MEDIUM': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    default: return 'bg-green-50 text-green-600 border-green-100';
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-600';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600';
    case 'ASSIGNED': return 'bg-indigo-50 text-indigo-600';
    case 'REJECTED': return 'bg-red-50 text-red-600';
    default: return 'bg-zinc-50 text-zinc-600';
  }
};

/**
 * 1. HOD All Complaints Page (/hod/complaints)
 */
export const HODComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await hodApi.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.complaintCode && c.complaintCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Department Complaints</h1>
          <p className="text-zinc-500 mt-1">All complaints filed under your department.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search by title, description or code..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              className="border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Complaint</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Category</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Priority</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Assigned To</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/complaints/${c._id}`} className="font-bold text-sm text-zinc-900 hover:text-emerald-600 hover:underline">
                          {c.title}
                        </Link>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded shrink-0">
                          #{c.complaintCode || c._id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{c.citizenName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-700">{c.category}</td>
                    <td className="px-6 py-4">
                      <Badge className={priorityColor(c.priority)}>{c.priority}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColor(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {c.assignedTo?.name ? (
                        <span className="font-semibold text-zinc-900">{c.assignedTo.name}</span>
                      ) : (
                        <span className="text-orange-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/complaints/${c._id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm">No complaints found matching filter criteria.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * 2. HOD Unassigned Complaints Page (/hod/unassigned)
 */
export const HODUnassignedPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsData, staffData] = await Promise.all([
        hodApi.getComplaints(),
        hodApi.getStaff(),
      ]);
      setComplaints(complaintsData.filter((c: any) => !c.assignedTo));
      setStaff(staffData);
    } catch (err) {
      console.error('Failed to load unassigned complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (complaintId: string) => {
    const staffId = selectedStaff[complaintId];
    if (!staffId) return;

    try {
      setAssigningId(complaintId);
      await hodApi.assignComplaint(complaintId, staffId);
      setSuccessMsg('Complaint assigned successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
    } catch (error: any) {
      console.error('Assignment failed:', error);
      setSuccessMsg(error.response?.data?.message || 'Assignment failed');
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Unassigned Complaints</h1>
          <p className="text-zinc-500 mt-1">Assign pending department complaints to available staff members.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-400" />
            Pending Assignment ({complaints.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {complaints.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Complaint</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Priority</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Date</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Assign To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {complaints.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/complaints/${c._id}`} className="font-bold text-sm text-zinc-900 hover:text-emerald-600 hover:underline">
                          {c.title}
                        </Link>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded shrink-0">
                          #{c.complaintCode || c._id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{c.citizenName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={priorityColor(c.priority)}>{c.priority}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColor(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="border border-gray-300 rounded-lg p-2 text-sm"
                          value={selectedStaff[c._id] || ''}
                          onChange={(e) => setSelectedStaff(prev => ({ ...prev, [c._id]: e.target.value }))}
                        >
                          <option value="" disabled>Select Staff</option>
                          {staff.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(c._id)}
                          disabled={!selectedStaff[c._id] || assigningId === c._id}
                          className="bg-black text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {assigningId === c._id ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm">All complaints have been assigned!</div>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * 3. HOD Assigned Complaints Page (/hod/assigned)
 */
export const HODAssignedPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await hodApi.getComplaints();
      setComplaints(data.filter((c: any) => c.assignedTo));
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Assigned Complaints</h1>
          <p className="text-zinc-500 mt-1">Track complaints actively assigned to department staff members.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Active Assignments ({complaints.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {complaints.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Complaint</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Priority</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Assigned Staff</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {complaints.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/complaints/${c._id}`} className="font-bold text-sm text-zinc-900 hover:text-emerald-600 hover:underline">
                          {c.title}
                        </Link>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded shrink-0">
                          #{c.complaintCode || c._id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{c.citizenName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={priorityColor(c.priority)}>{c.priority}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColor(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-zinc-900">{c.assignedTo?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">{c.assignedTo?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/complaints/${c._id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm">No complaints assigned yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * 4. HOD Staff Management Page (/hod/staff-management)
 */
export const HODStaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [workload, setWorkload] = useState<StaffWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffData, workloadData] = await Promise.all([
        hodApi.getStaff(),
        hodApi.getStaffWorkload(),
      ]);
      setStaff(staffData);
      setWorkload(workloadData);
    } catch (err) {
      console.error('Failed to load staff management:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Staff Management</h1>
          <p className="text-zinc-500 mt-1">Monitor department staff members and active workload distribution.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Department Staff Members ({staff.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {staff.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Staff Name</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Email</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Department</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Active Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {staff.map(s => {
                  const wl = workload.find(w => w.staffId === s._id);
                  return (
                    <tr key={s._id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-zinc-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{s.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{s.department}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-zinc-100 text-zinc-900">
                          {wl?.activeComplaints ?? 0} Active Tasks
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm">No active staff members found in your department.</div>
          )}
        </div>
      </Card>
    </div>
  );
};
