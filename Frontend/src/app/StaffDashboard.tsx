import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  MapPin,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';
import { ComplaintStatus, Priority, Department } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { cn } from '../lib/utils';

export const StaffDashboard: React.FC = () => {
  const { complaints, updateComplaintStatus, updateComplaintDepartment } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  const stats = [
    { label: 'Total Assigned', value: complaints.length, icon: AlertCircle, color: 'text-zinc-600', bg: 'bg-zinc-100' },
    { label: 'Pending Review', value: complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'In Progress', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Staff Dashboard</h1>
        <p className="text-zinc-500 mt-1">Manage and resolve civic issues assigned to your department.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Search complaints..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select 
              className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F27D26]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ComplaintStatus).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-4 font-bold text-zinc-900 text-sm">Complaint</th>
                <th className="pb-4 font-bold text-zinc-900 text-sm">Category & Priority</th>
                <th className="pb-4 font-bold text-zinc-900 text-sm">Status</th>
                <th className="pb-4 font-bold text-zinc-900 text-sm">Department</th>
                <th className="pb-4 font-bold text-zinc-900 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={complaint.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm line-clamp-1">{complaint.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{complaint.location}</span>
                          <span>•</span>
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-zinc-600">{complaint.category}</span>
                      <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <select 
                      className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer p-0"
                      value={complaint.status}
                      onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as ComplaintStatus)}
                    >
                      {Object.values(ComplaintStatus).map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <select 
                      className="bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F27D26]"
                      value={complaint.department || ''}
                      onChange={(e) => updateComplaintDepartment(complaint.id, e.target.value as Department)}
                    >
                      <option value="">Unassigned</option>
                      {Object.values(Department).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => window.location.href = `/complaints/${complaint.id}`}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No complaints found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
