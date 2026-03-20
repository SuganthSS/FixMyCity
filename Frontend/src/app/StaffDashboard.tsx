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
  ChevronDown
} from 'lucide-react';
import { ComplaintStatus, Priority, Department } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { cn, getFullImageUrl } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export const StaffDashboard: React.FC = () => {
  const { complaints, updateComplaintStatus, updateComplaintDepartment, loading, error, refreshComplaints } = useComplaints();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-4 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold tracking-tight">{t('dashboard.loading') || 'Loading staff dashboard...'}</p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <Card className="p-10 text-center space-y-6 max-w-md border border-rose-100 bg-rose-50/10">
          <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
             <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-rose-600 font-bold text-lg leading-snug">{error}</p>
          <Button onClick={refreshComplaints} variant="danger" className="mt-4">{t('dashboard.tryAgain')}</Button>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: t('staffDashboard.stats.totalAssigned'), value: complaints.length, icon: AlertCircle, color: 'text-[#000000]', bg: 'bg-gray-100/50' },
    { label: t('staffDashboard.stats.pendingReview'), value: complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { label: t('staffDashboard.stats.inProgress'), value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-100/30' },
    { label: t('staffDashboard.stats.resolved'), value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  ];

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 md:space-y-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('staffDashboard.portal')}</h1>
          <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-2xl">{t('staffDashboard.portalDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-4">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200">{t('staffDashboard.exportQueue')}</Button>
             <Link to="/staff/map" className="flex-1 md:flex-none">
                <Button className="w-full rounded-2xl shadow-lg shadow-black/10">{t('staffDashboard.viewMap')}</Button>
             </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 h-full flex flex-col group relative overflow-hidden">
               <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500', stat.bg)}>
                  <stat.icon className={cn('w-7 h-7', stat.color)} />
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-4xl font-black text-slate-900 mt-1">{stat.value}</h3>
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -rotate-12" />
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-premium mt-8">
        <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#000000] transition-colors" />
              <Input 
                placeholder={t('staffDashboard.searchPlaceholder')} 
                className="pl-12 bg-white border-slate-100 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
              <div className="flex items-center gap-2 pl-3 shrink-0">
                 <Filter className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-tight">{t('staffDashboard.statusFilter')}</span>
              </div>
              <select 
                className="bg-slate-50 border-none text-slate-900 text-xs md:text-sm font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-black/10 cursor-pointer outline-none min-w-[120px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">{t('staffDashboard.all')}</option>
                {Object.values(ComplaintStatus).map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">{t('staffDashboard.tableHeaders.issueDetails')}</th>
                  <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">{t('staffDashboard.tableHeaders.categoryPriority')}</th>
                  <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">{t('staffDashboard.tableHeaders.updateStatus')}</th>
                  <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest text-center">{t('staffDashboard.tableHeaders.urgency')}</th>
                  <th className="px-6 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest">{t('staffDashboard.tableHeaders.department')}</th>
                  <th className="px-8 py-5 font-black text-slate-400 text-[11px] uppercase tracking-widest text-right">{t('staffDashboard.tableHeaders.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-soft group-hover:scale-110 transition-transform duration-500 border-2 border-white">
                          <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base mb-1 group-hover:text-[#374151] transition-colors line-clamp-1">{complaint.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                            <span className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3 h-3 text-rose-400" /> 
                              <span className="truncate">{complaint.location}</span>
                              {complaint.landmark && <span className="text-[#374151] truncate">({complaint.landmark})</span>}
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0"><Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tight">{complaint.category}</span>
                        <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                          <select 
                            className="bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-900 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-black/10 cursor-pointer outline-none w-max"
                            value={complaint.status}
                            onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as ComplaintStatus)}
                          >
                            {Object.values(ComplaintStatus).map(status => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <Badge variant={complaint.status} className="w-max px-3">{complaint.status.replace('_', ' ')}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                         <div className="flex items-center gap-1 font-black text-[#000000] text-lg">
                            <span>▲</span>
                            {complaint.upvotes?.length || 0}
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t('staffDashboard.communitySupport')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <select 
                        className="bg-white border border-slate-100 shadow-soft text-xs font-bold text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black/10 cursor-pointer outline-none w-full"
                        value={complaint.department || ''}
                        onChange={(e) => updateComplaintDepartment(complaint.id, e.target.value as Department)}
                      >
                        <option value="">{t('staffDashboard.unassigned')}</option>
                        {Object.values(Department).map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="outline" className="rounded-2xl border-slate-200 px-6 font-black text-xs uppercase group-hover:bg-[#000000] group-hover:text-white group-hover:border-[#000000] transition-all" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                        {t('staffDashboard.details')}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Search className="w-8 h-8" />
                       </div>
                       <p className="text-slate-400 font-bold text-lg">{t('staffDashboard.noComplaints')}</p>
                       <Button variant="ghost" onClick={() => {setSearchTerm(''); setStatusFilter('ALL');}} className="mt-2 text-[#000000] font-bold">{t('staffDashboard.clearFilters')}</Button>
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
