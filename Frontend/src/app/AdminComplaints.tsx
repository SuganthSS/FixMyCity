import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User,
  Building2,
} from 'lucide-react';
import { Complaint, WorkflowStage, Department } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { getFullImageUrl } from '../lib/utils';
import { complaintApi } from '../services/complaintApi';
import { hodApi } from '../services/hodApi';
import { ResolutionModal } from '../components/ResolutionModal';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [resolutionTargetId, setResolutionTargetId] = useState<string | null>(null);

  useEffect(() => {
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

  const handleStageSelect = async (id: string, newStage: string) => {
    if (newStage === 'RESOLVED') {
      setResolutionTargetId(id);
      return;
    }

    try {
      await complaintApi.updateStage(id, { stage: newStage });
      fetchComplaints();
    } catch (error: any) {
      console.error('Error updating stage:', error);
      alert(error.response?.data?.message || 'Failed to update workflow stage.');
    }
  };

  const handleDepartmentChange = async (id: string, targetDepartment: string) => {
    try {
      await hodApi.transferDepartment(id, targetDepartment);
      fetchComplaints();
    } catch (error: any) {
      console.error('Error transferring department:', error);
      alert(error.response?.data?.message || 'Failed to transfer department.');
    }
  };

  const filtered = complaints.filter((c) => {
    const tracking = c.trackingCode || c.complaintCode || c.id || c._id || '';
    const citizen = c.citizenName || '';
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tracking.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
            placeholder="Search by Tracking Code (FMC-YYYY-XXXX), title, or citizen..." 
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
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Priority / Severity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Workflow Stage</th>
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
                filtered.map((complaint) => {
                  const displayCode = complaint.trackingCode || complaint.complaintCode || complaint.id || complaint._id || '';
                  const displayStage = (complaint.workflowStage || complaint.status || 'SUBMITTED').toString();
                  const displayDepartment = (complaint.assignedDepartment || complaint.department || '').toString();
                  const displayImage = complaint.media?.[0]?.url || complaint.imageUrl || '';

                  return (
                    <tr key={complaint.id || complaint._id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-100 bg-zinc-100 flex items-center justify-center">
                            {displayImage ? (
                              <img src={getFullImageUrl(displayImage)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] text-zinc-400">No Img</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 line-clamp-1">{complaint.title}</p>
                            <p className="text-[10px] font-mono font-bold text-[#F27D26]">{displayCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-zinc-500" />
                          </div>
                          <span className="text-sm text-zinc-600">{complaint.citizenName || 'Citizen'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {complaint.severity && <Badge variant={complaint.severity}>{complaint.severity}</Badge>}
                          <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="text-xs font-bold rounded-lg px-2.5 py-1.5 border border-zinc-200 bg-white focus:ring-2 focus:ring-[#F27D26]/20 transition-all cursor-pointer"
                          value={displayStage}
                          onChange={(e) => handleStageSelect(complaint.id || complaint._id || '', e.target.value)}
                        >
                          {Object.values(WorkflowStage).map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400" />
                          <select 
                            className="text-xs font-medium bg-transparent border border-zinc-200 rounded-lg px-2 py-1 text-zinc-700 cursor-pointer"
                            value={displayDepartment}
                            onChange={(e) => handleDepartmentChange(complaint.id || complaint._id || '', e.target.value as Department)}
                          >
                            <option value="">Unassigned</option>
                            {Object.values(Department).map((d) => (
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
                          <Link to={`/complaints/${complaint.id || complaint._id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-3">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {resolutionTargetId && (
        <ResolutionModal
          complaintId={resolutionTargetId}
          isOpen={Boolean(resolutionTargetId)}
          onClose={() => setResolutionTargetId(null)}
          onResolvedSuccess={fetchComplaints}
        />
      )}
    </div>
  );
};
