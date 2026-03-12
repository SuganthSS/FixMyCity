import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { Card, Badge, Button } from '../components/UI';
import { ComplaintStatus } from '../types';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { name: 'Jan', reported: 120, resolved: 80 },
  { name: 'Feb', reported: 150, resolved: 110 },
  { name: 'Mar', reported: 200, resolved: 140 },
  { name: 'Apr', reported: 180, resolved: 160 },
  { name: 'May', reported: 250, resolved: 190 },
  { name: 'Jun', reported: 300, resolved: 220 },
];

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, loading, error, refreshComplaints } = useComplaints();

  if (loading && complaints.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 font-medium">Loading your dashboard...</p>
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

  const myComplaints = complaints.filter(c => c.citizenId === user?.id);

  const stats = [
    { label: 'Total Reports', value: myComplaints.length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: myComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Resolved', value: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-zinc-500 mt-1">Here's what's happening with your reported issues.</p>
        </div>
        <Link to="/report">
          <Button className="h-12 px-6">
            Report New Issue
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +12%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Activity Overview</h3>
            <select className="text-xs font-semibold bg-zinc-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A1A1AA' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A1A1AA' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="reported"
                  stroke="#F27D26"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorReported)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <Link to="/map" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-[#F27D26]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Nearby Issues</p>
                <p className="text-[11px] text-zinc-500">See what's reported in your area</p>
              </div>
            </Link>
            <Link to="/maintenance" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Scheduled Maintenance</p>
                <p className="text-[11px] text-zinc-500">View upcoming city repairs</p>
              </div>
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 text-center italic">"Working together for a cleaner city"</p>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900">Recent Complaints</h3>
          <Link to="/my-complaints" className="text-sm font-bold text-[#F27D26] hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {myComplaints.slice(0, 4).map((complaint) => (
            <Link key={complaint.id} to={`/complaints/${complaint.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-zinc-900 line-clamp-1">{complaint.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                    <span>{complaint.category}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

import { cn } from '../lib/utils';
