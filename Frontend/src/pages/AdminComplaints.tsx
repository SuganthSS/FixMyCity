import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Complaint, ComplaintStatus, Department, Priority } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { cn, getFullImageUrl } from '../lib/utils';
import { complaintApi } from '../services/complaintApi';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await complaintApi.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    try {
      await complaintApi.updateStatus(id, newStatus);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDepartmentChange = async (id: string, newDept: Department) => {
    try {
      await complaintApi.updateDepartment(id, newDept);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, department: newDept, updatedAt: new Date().toISOString() } : c));
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const filtered = complaints.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Complaint Management</h1>
          <p className="text-zinc-500 mt-1">Review, assign, and update the status of city-wide reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Filters</Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </header>

      <Card className="p-4 flex items-center gap-4 bg-zinc-50/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by ID, title, or citizen name..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11">
          <Filter className="w-4 h-4" />
        </Button>
      </Card>

      <Card className="overflow-hidden border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Complaint</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    {loading ? 'Loading...' : 'No data available'}
                  </td>
                </tr>
              ) : (
                filtered.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                        <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 line-clamp-1">{complaint.title}</p>
                        <p className="text-[10px] font-mono text-zinc-400">#{complaint.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-zinc-500" />
                      </div>
                      <span className="text-sm text-zinc-600">{complaint.citizenName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={cn(
                        "text-xs font-bold rounded-lg px-2 py-1 border-none focus:ring-2 focus:ring-offset-1 transition-all",
                        complaint.status === ComplaintStatus.RESOLVED ? "bg-green-100 text-green-700" : 
                        complaint.status === ComplaintStatus.SUBMITTED ? "bg-yellow-100 text-yellow-700" :
                        "bg-zinc-100 text-zinc-700"
                      )}
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value as ComplaintStatus)}
                    >
                      {Object.values(ComplaintStatus).map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-400" />
                      <select 
                        className="text-xs font-medium bg-transparent border-none focus:ring-0 p-0 text-zinc-600"
                        value={complaint.department || ''}
                        onChange={(e) => handleDepartmentChange(complaint.id, e.target.value as Department)}
                      >
                        <option value="">Unassigned</option>
                        {Object.values(Department).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-3">
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
