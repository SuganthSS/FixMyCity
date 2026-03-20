import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { ComplaintStatus, Priority } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { cn, getFullImageUrl } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  [ComplaintStatus.SUBMITTED]: '#F59E0B',
  [ComplaintStatus.UNDER_REVIEW]: '#8B5CF6',
  [ComplaintStatus.IN_PROGRESS]: '#A855F7',
  [ComplaintStatus.RESOLVED]: '#10B981',
  [ComplaintStatus.REJECTED]: '#EF4444',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Road Issue': '#10B981',
  'Streetlight Issue': '#374151',
  'Drainage Issue': '#8B5CF6',
  'Water Leak': '#F59E0B',
};

const COLORS = ['#374151', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];

export const AdminDashboard: React.FC = () => {
  const { complaints, loading, error, refreshComplaints } = useComplaints();

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-4 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold tracking-tight">Loading admin console...</p>
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
          <Button onClick={refreshComplaints} variant="danger" className="mt-4">Try Again</Button>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: AlertCircle, color: 'text-[#000000]', bg: 'bg-gray-100/50' },
    { label: 'Pending Review', value: complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { label: 'In Progress', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50/30' },
    { label: 'Resolved', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  ];

  const categoryData = Object.values(complaints.reduce((acc: any, curr) => {
    acc[curr.category] = acc[curr.category] || { name: curr.category, value: 0 };
    acc[curr.category].value += 1;
    return acc;
  }, {}));

  const statusData = Object.values(complaints.reduce((acc: any, curr) => {
    acc[curr.status] = acc[curr.status] || { name: curr.status.replace('_', ' '), value: 0 };
    acc[curr.status].value += 1;
    return acc;
  }, {}));

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 md:p-8 h-full flex flex-col group relative overflow-hidden">
               <div className={cn('w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6 md:w-7 md:h-7', stat.color)} />
               </div>
               <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">{stat.value}</h3>
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -rotate-12" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 md:p-8 bg-white border-none shadow-premium hover:shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Complaints by Category</h3>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50 w-10 h-10"><MoreVertical className="w-5 h-5 text-slate-400" /></Button>
          </div>
          <div className="h-[340px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC', radius: 12 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', padding: '16px' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={44}>
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No data available</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 md:p-8 flex flex-col bg-slate-50/50 border border-slate-100">
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-10 tracking-tight">Status Distribution</h3>
          <div className="h-[280px] w-full relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => {
                      const statusKey = Object.keys(STATUS_COLORS).find(key => key.replace('_', ' ') === entry.name);
                      return <Cell key={`cell-${index}`} fill={statusKey ? STATUS_COLORS[statusKey] : COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                 <p className="font-bold uppercase tracking-widest text-[10px]">No data available</p>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-3">
            {statusData.map((item: any, i) => {
              const statusKey = Object.keys(STATUS_COLORS).find(key => key.replace('_', ' ') === item.name);
              const color = statusKey ? STATUS_COLORS[statusKey] : COLORS[i % COLORS.length];
              return (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-slate-900">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-premium">
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">High Priority Alerts</h3>
          <Link to="/admin/complaints">
             <Button variant="ghost" size="sm" className="font-black text-[#000000] hover:text-[#1F2937] hover:bg-gray-50 rounded-full flex items-center px-4">
                View All
                <ArrowUpRight className="ml-1 w-4 h-4" />
             </Button>
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {complaints.filter(c => c.priority === Priority.HIGH || c.priority === Priority.CRITICAL).length > 0 ? (
            complaints.filter(c => c.priority === Priority.HIGH || c.priority === Priority.CRITICAL).map((complaint) => (
              <div key={complaint.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shrink-0 shadow-soft group-hover:scale-105 transition-transform duration-500 border-2 border-white">
                    <img src={getFullImageUrl(complaint.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-[#374151] transition-colors mb-1 truncate">{complaint.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg max-w-[150px] md:max-w-none"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{complaint.location}</span></span>
                      <span className="flex items-center gap-2 shrink-0"><Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <Badge variant={complaint.priority} className="px-5 py-2 text-[10px] md:text-[11px]">{complaint.priority}</Badge>
                  <Link to={`/complaints/${complaint.id}`} className="shrink-0">
                    <Button variant="outline" className="rounded-2xl border-slate-200 py-2 px-6">Manage</Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight text-lg">No high priority alerts found. Everything is under control!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 md:space-y-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Admin <span className="text-[#000000]">Console</span></h1>
          <p className="text-slate-500 font-medium text-base md:text-lg lg:max-w-xl">Manage system operations, users, and civic grievances at scale.</p>
        </div>
        <div className="flex flex-wrap gap-4">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200">Export Report</Button>
             <Link to="/admin/analytics" className="flex-1 md:flex-none">
                <Button className="w-full rounded-2xl shadow-lg shadow-black/10">Analytics</Button>
             </Link>
        </div>
      </header>

      {renderOverview()}
    </div>
  );
};
