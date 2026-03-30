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
import { ComplaintStatus, Department, Priority, ComplaintCategory } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { cn, getFullImageUrl } from '../lib/utils';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';

export const AdminComplaintsPage: React.FC = () => {
  const { complaints } = useComplaints();
  const { users } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');



  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Citizen', 'Priority', 'Status', 'Department', 'Created At'];
    const rows = filtered.map(c => [
      c.id,
      c.title,
      c.citizenName,
      c.priority,
      c.status,
      c.category || 'Unclassified',
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
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Complaint Oversight</h1>
          <p className="text-zinc-500 mt-1">Review and monitor status of city-wide reports at a high level.</p>
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {Object.values(ComplaintCategory).map(c => (
              <option key={c} value={c}>{c}</option>
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
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Submitted</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Category (Dept)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((complaint) => {
                const assignedStaff = users.find(u => u.id === complaint.assignedTo);
                
                return (
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
                            <span className="text-[10px] text-[#374151] font-bold truncate">({complaint.landmark})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-zinc-600">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-600">
                        {complaint.category || 'Unclassified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-zinc-600">{assignedStaff ? assignedStaff.name : 'Unassigned'}</span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
