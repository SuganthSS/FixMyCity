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
import { cn, getFullImageUrl } from '../lib/utils';
import { Card, Badge, Button } from '../components/UI';
import { ComplaintStatus } from '../types';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';


export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { complaints, loading } = useComplaints();

  const myComplaints = complaints.filter(c => c.citizenId === user?.id);

  const monthlyData = myComplaints.reduce((acc: any, curr) => {
    const month = new Date(curr.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.keys(monthlyData).map(key => ({
    name: key,
    value: monthlyData[key]
  }));

  const stats = [
    { label: t('common.totalReports'), value: myComplaints.length, icon: AlertCircle, color: 'text-[#000000]', bg: 'bg-gray-100' },
    { label: t('common.pending'), value: myComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('common.resolved'), value: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000000]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('dashboard.welcomeBack', { name: user?.name.split(' ')[0] })}</h1>
          <p className="text-zinc-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/report">
          <Button className="h-12 px-6">
            {t('dashboard.reportNew')}
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
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900">{t('dashboard.statusSummary')}</h3>
            <select className="text-xs font-semibold bg-zinc-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>{t('dashboard.monthly')}</option>
              <option>{t('dashboard.weekly')}</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A1A1AA' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#F27D26"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                {t('dashboard.noData')}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">{t('dashboard.quickActions')}</h3>
          <div className="space-y-3 flex-1">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-[#F27D26]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{t('dashboard.nearbyIssues')}</p>
                <p className="text-[11px] text-zinc-500">{t('dashboard.nearbyIssuesDesc')}</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-[#000000]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{t('dashboard.scheduledMaintenance')}</p>
                <p className="text-[11px] text-zinc-500">{t('dashboard.scheduledMaintenanceDesc')}</p>
              </div>
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 text-center italic">{t('dashboard.motto')}</p>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900">{t('dashboard.recentComplaints')}</h3>
          <Link to="/my-complaints" className="text-sm font-bold text-[#F27D26] hover:underline">{t('common.viewAll')}</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {myComplaints.slice(0, 4).map((complaint) => (
            <Link key={complaint.id} to={`/complaint/${complaint.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={getFullImageUrl(complaint.imageUrl)}
                    alt={complaint.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={complaint.status}>{t(`common.${complaint.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-zinc-900 line-clamp-1">{complaint.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                    <span>{t(`common.${complaint.category.split(' ').map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('')}`)}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {myComplaints.length === 0 && (
            <div className="col-span-full p-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-zinc-900">{t('myComplaints.notFound')}</h4>
              <p className="text-zinc-500 mt-2">{t('dashboard.noComplaintsDesc')}</p>
              <Link to="/report" className="mt-6 inline-block">
                <Button>{t('dashboard.reportNow')}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
