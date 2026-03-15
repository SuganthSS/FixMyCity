import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { ComplaintStatus, Department, Priority } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { cn, getFullImageUrl } from '../lib/utils';
import { useComplaints } from '../context/ComplaintContext';

export const AdminComplaintsPage: React.FC = () => {
  const { complaints, updateComplaintStatus, updateComplaintDepartment, updateComplaintPriority } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(id, newStatus);
  };

  const handleDepartmentChange = (id: string, newDept: Department) => {
    updateComplaintDepartment(id, newDept);
  };

  const handlePriorityChange = (id: string, newPriority: Priority) => {
    updateComplaintPriority(id, newPriority);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Citizen', 'Priority', 'Status', 'Department', 'Created At'];
    const rows = filtered.map(c => [
      c.id,
      c.title,
      c.citizenName,
      c.priority,
      c.status,
      c.department || 'Unassigned',
      new Date(c.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Complaint Management</h1>
          <p className="text-zinc-500 mt-1">Review, assign, and update the status of city-wide reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <Button onClick={() => alert('Generating system report... Check your downloads in a moment.')}>Generate Report</Button>
        </div>
      </header>

      <Card className="p-4 flex flex-col md:flex-row items-center gap-4 bg-zinc-50/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by ID, title, or citizen name..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="h-11 px-4 rounded-xl bg-white border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-[#F27D26]/20 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ComplaintStatus).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select 
            className="h-11 px-4 rounded-xl bg-white border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-[#F27D26]/20 outline-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            {Object.values(Priority).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
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
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upvotes</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                        <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 line-clamp-1">{complaint.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-mono text-zinc-400">#{complaint.id}</p>
                          {complaint.landmark && (
                            <span className="text-[10px] text-[#2563EB] font-bold truncate">({complaint.landmark})</span>
                          )}
                        </div>
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
                    <select 
                      className={cn(
                        "text-[10px] font-bold rounded-full px-2 py-0.5 border-none focus:ring-0 cursor-pointer uppercase tracking-wider",
                        complaint.priority === Priority.LOW ? "bg-zinc-100 text-zinc-600" :
                        complaint.priority === Priority.MEDIUM ? "bg-blue-100 text-blue-600" :
                        complaint.priority === Priority.HIGH ? "bg-orange-100 text-orange-600" :
                        "bg-red-100 text-red-600"
                      )}
                      value={complaint.priority}
                      onChange={(e) => handlePriorityChange(complaint.id, e.target.value as Priority)}
                    >
                      {Object.values(Priority).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
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
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-zinc-900">
                      {complaint.upvotes?.length || 0}
                    </span>
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
                      <Link to={`/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-3">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
