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
  MapPin
} from 'lucide-react';
import { ComplaintStatus, Priority } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { cn } from '../lib/utils';
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

const COLORS = ['#F27D26', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B'];

export const AdminDashboard: React.FC = () => {
  const { complaints, loading, error, refreshComplaints } = useComplaints();

  if (loading && complaints.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 font-medium">Loading admin console...</p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button onClick={refreshComplaints} variant="outline" className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: AlertCircle, color: 'text-zinc-600', bg: 'bg-zinc-100', trend: '+5.2%', isUp: true },
    { label: 'Pending Review', value: complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2.1%', isUp: false },
    { label: 'In Progress', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', isUp: true },
    { label: 'Resolved', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', trend: '+8.4%', isUp: true },
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
                <Badge className={cn(stat.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50')}>
                  {stat.isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900">Complaints by Category</h3>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#F27D26" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-8">Status Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((item: any, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">High Priority Alerts</h3>
          <Link to="/admin/complaints" className="text-sm font-bold text-[#F27D26] hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-zinc-100">
          {complaints.filter(c => c.priority === Priority.HIGH || c.priority === Priority.CRITICAL).length > 0 ? (
            complaints.filter(c => c.priority === Priority.HIGH || c.priority === Priority.CRITICAL).map((complaint) => (
              <div key={complaint.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={complaint.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{complaint.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {complaint.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                  <Link to={`/complaints/${complaint.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-zinc-500 text-sm">No high priority alerts found. Everything is under control!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Console</h1>
          <p className="text-zinc-500 mt-1">Manage system operations, users, and complaints.</p>
        </div>
      </header>

      {renderOverview()}
    </div>
  );
};
