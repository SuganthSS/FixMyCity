import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  MapPin,
  Filter,
  Search,
  History,
} from 'lucide-react';
import { ComplaintStatus } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { useComplaints } from '../context/ComplaintContext';
import { cn, getFullImageUrl } from '../lib/utils';

/**
 * 1. Staff Assigned Complaints Page (/staff/assigned)
 */
export const StaffAssignedPage: React.FC = () => {
  const { complaints, updateComplaintStatus, loading, error, refreshComplaints } = useComplaints();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeComplaints = complaints.filter(c => c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.REJECTED);

  const filtered = activeComplaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Assigned Complaints</h1>
          <p className="text-slate-500 font-medium text-base">Active complaints assigned to you for resolution.</p>
        </div>
        <Button variant="outline" onClick={refreshComplaints}>Refresh List</Button>
      </header>

      <Card className="p-0 overflow-hidden border-none shadow-premium">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search assigned complaints..."
              className="pl-12 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              className="bg-slate-50 text-slate-900 text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Active Statuses</option>
              {Object.values(ComplaintStatus).filter(s => s !== ComplaintStatus.RESOLVED && s !== ComplaintStatus.REJECTED).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Issue Details</th>
                <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Category / Priority</th>
                <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Update Status</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(complaint => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-soft border-2 border-white">
                        <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link to={`/complaints/${complaint.id}`} className="font-bold text-slate-900 text-base hover:text-emerald-600 hover:underline">
                          {complaint.title}
                        </Link>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">#{complaint.complaintCode || complaint.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-black text-slate-400 uppercase">{complaint.category}</span>
                      <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <select
                      className="bg-slate-50 border border-slate-100 text-[11px] font-black uppercase text-slate-900 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                      value={complaint.status}
                      onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as ComplaintStatus)}
                    >
                      {Object.values(ComplaintStatus).map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 font-medium">No active assigned complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

/**
 * 2. Staff Update Status Page (/staff/update-status)
 */
export const StaffUpdateStatusPage: React.FC = () => {
  const { complaints, updateComplaintStatus, loading, refreshComplaints } = useComplaints();
  const navigate = useNavigate();

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Update Complaint Status</h1>
          <p className="text-slate-500 font-medium text-base">Quickly update stage, status, and resolution progress for assigned issues.</p>
        </div>
        <Button variant="outline" onClick={refreshComplaints}>Refresh</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complaints.map(complaint => (
          <Card key={complaint.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">#{complaint.complaintCode || complaint.id.substring(0, 8)}</span>
                <Link to={`/complaints/${complaint.id}`} className="block text-lg font-bold text-slate-900 hover:text-emerald-600 hover:underline mt-0.5">
                  {complaint.title}
                </Link>
              </div>
              <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2">{complaint.description}</p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Set New Status</label>
                <select
                  className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                  value={complaint.status}
                  onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as ComplaintStatus)}
                >
                  {Object.values(ComplaintStatus).map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <Button variant="outline" size="sm" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                Manage Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * 3. Staff Complaint History Page (/staff/history)
 */
export const StaffHistoryPage: React.FC = () => {
  const { complaints, loading, refreshComplaints } = useComplaints();
  const navigate = useNavigate();

  const historyComplaints = complaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.REJECTED);

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Complaint History</h1>
          <p className="text-slate-500 font-medium text-base">Archived and resolved complaints history handled by you.</p>
        </div>
        <Button variant="outline" onClick={refreshComplaints}>Refresh History</Button>
      </header>

      <Card className="p-0 overflow-hidden border-none shadow-premium">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Resolved & Closed History ({historyComplaints.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Issue Details</th>
                <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">Final Status</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyComplaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-soft border-2 border-white">
                        <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link to={`/complaints/${complaint.id}`} className="font-bold text-slate-900 text-base hover:text-emerald-600 hover:underline">
                          {complaint.title}
                        </Link>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">#{complaint.complaintCode || complaint.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-medium text-sm text-slate-600">{complaint.category}</td>
                  <td className="px-6 py-6">
                    <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                      View Record
                    </Button>
                  </td>
                </tr>
              ))}
              {historyComplaints.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 font-medium">No completed complaint history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
