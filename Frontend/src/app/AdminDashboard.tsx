import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  MapPin,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { ComplaintStatus, Priority, UserRole, User } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
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
  const { complaints } = useComplaints();
  const { users, updateOtherUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'staff'>('overview');

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

  const renderUserManagement = (roleFilter: UserRole) => {
    const filteredUsers = users.filter(u => u.role === roleFilter);

    return (
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">
            {roleFilter === UserRole.STAFF ? 'Staff Management' : 'User Management'}
          </h3>
          <Badge className="bg-zinc-100 text-zinc-600">{filteredUsers.length} Total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">User</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Joined</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {u.isBanned ? (
                        <Badge className="bg-red-50 text-red-600 border-red-100">Banned</Badge>
                      ) : u.role === UserRole.STAFF && !u.isApproved ? (
                        <Badge className="bg-orange-50 text-orange-600 border-orange-100">Pending Approval</Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Active</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === UserRole.STAFF && !u.isApproved && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateOtherUser(u.id, { isApproved: true })}
                        >
                          <UserCheck className="w-4 h-4 mr-1.5" />
                          Approve
                        </Button>
                      )}
                      {u.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOtherUser(u.id, { isBanned: false })}
                        >
                          <Shield className="w-4 h-4 mr-1.5 text-emerald-600" />
                          Re-enable
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 border-red-100"
                          onClick={() => updateOtherUser(u.id, { isBanned: true })}
                        >
                          <UserX className="w-4 h-4 mr-1.5" />
                          Disable
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Console</h1>
          <p className="text-zinc-500 mt-1">Manage system operations, users, and complaints.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'overview' ? "bg-white text-[#F27D26] shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'users' ? "bg-white text-[#F27D26] shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Citizens
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'staff' ? "bg-white text-[#F27D26] shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Staff
          </button>
        </div>
      </header>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUserManagement(UserRole.CITIZEN)}
      {activeTab === 'staff' && renderUserManagement(UserRole.STAFF)}
    </div>
  );
};

import { cn } from '../lib/utils';
