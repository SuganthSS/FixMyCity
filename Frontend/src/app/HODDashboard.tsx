import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import { hodApi } from '../services/hodApi';

interface StaffWorkload {
  staffId: string;
  staffName: string;
  staffEmail: string;
  activeComplaints: number;
}

interface DeptStats {
  total: number;
  unassigned: number;
  byStatus: Record<string, number>;
}

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

export const HODDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [workload, setWorkload] = useState<StaffWorkload[]>([]);
  const [stats, setStats] = useState<DeptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsData, staffData, workloadData, statsData] = await Promise.all([
        hodApi.getComplaints(),
        hodApi.getStaff(),
        hodApi.getStaffWorkload(),
        hodApi.getStats(),
      ]);
      setComplaints(complaintsData);
      setStaff(staffData);
      setWorkload(workloadData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load HOD dashboard:', error);
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

  const unassignedComplaints = complaints.filter(c => !c.assignedTo);
  const assignedComplaints = complaints.filter(c => c.assignedTo);

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
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">HOD Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage department complaints and staff assignments.</p>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900">{stats.total}</p>
                <p className="text-xs text-zinc-500 font-medium">Total Complaints</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900">{stats.unassigned}</p>
                <p className="text-xs text-zinc-500 font-medium">Unassigned</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900">{stats.byStatus.IN_PROGRESS || 0}</p>
                <p className="text-xs text-zinc-500 font-medium">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900">{stats.byStatus.RESOLVED || 0}</p>
                <p className="text-xs text-zinc-500 font-medium">Resolved</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Staff Workload */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-zinc-400" />
            Staff Workload
          </h3>
          <Badge className="bg-zinc-100 text-zinc-600">{workload.length} Staff</Badge>
        </div>
        <div className="p-6">
          {workload.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workload.map(w => (
                <div key={w.staffId} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{w.staffName}</p>
                    <p className="text-xs text-zinc-500">{w.staffEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-zinc-900">{w.activeComplaints}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">Active</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-400 text-sm py-4">No staff members in your department yet.</p>
          )}
        </div>
      </Card>

      {/* Unassigned Complaints */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-400" />
            Unassigned Complaints
          </h3>
          <Badge className="bg-orange-50 text-orange-600">{unassignedComplaints.length}</Badge>
        </div>
        <div className="overflow-x-auto">
          {unassignedComplaints.length > 0 ? (
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
                {unassignedComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-zinc-900">{c.title}</p>
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
            <div className="p-8 text-center text-zinc-400 text-sm">All complaints have been assigned!</div>
          )}
        </div>
      </Card>

      {/* Assigned Complaints */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Assigned Complaints
          </h3>
          <Badge className="bg-blue-50 text-blue-600">{assignedComplaints.length}</Badge>
        </div>
        <div className="overflow-x-auto">
          {assignedComplaints.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Complaint</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Priority</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Assigned To</th>
                  <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {assignedComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-zinc-900">{c.title}</p>
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
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-sm">No complaints have been assigned yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
};
