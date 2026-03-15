import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  XCircle,
  FileSearch
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../context/ComplaintContext';
import { Card, Badge, Button } from '../components/UI';
import { ComplaintStatus } from '../types';
import { motion } from 'motion/react';
import { cn, getFullImageUrl } from '../lib/utils';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { complaints, loading, error, refreshComplaints } = useComplaints();

  if (loading && complaints.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold tracking-tight">{t('dashboard.loading')}</p>
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

  const myComplaints = complaints.filter(c => c.citizenId === user?.id);

  const stats = [
    { label: t('common.totalReports'), value: myComplaints.length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { label: t('common.pending'), value: myComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { label: t('common.resolved'), value: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  ];

  return (
    <div className="p-10 space-y-8 max-w-[1600px] mx-auto overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Hey, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/report">
          <Button className="h-14 px-8 text-base shadow-lg shadow-blue-500/20" variant="primary">
            {t('dashboard.reportNew')}
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Stat Cards - Bento pieces */}
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-8 h-full flex flex-col justify-between group relative overflow-hidden">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500', stat.bg)}>
                <stat.icon className={cn('w-7 h-7', stat.color)} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -rotate-12" />
            </Card>
          </motion.div>
        ))}

        {/* Status Summary - Large Bento piece */}
        <Card className="lg:col-span-4 p-8 bg-slate-50/50 border-2 border-white shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('dashboard.statusSummary')}</h3>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white rounded-full">Weekly</Button>
                <Button variant="ghost" size="sm" className="rounded-full">Monthly</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { 
                status: ComplaintStatus.SUBMITTED, 
                label: t('common.submitted'), 
                count: myComplaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length,
                icon: AlertCircle,
                color: 'text-blue-600',
                bg: 'bg-blue-100/50'
              },
              { 
                status: ComplaintStatus.UNDER_REVIEW, 
                label: t('common.underReview'), 
                count: myComplaints.filter(c => c.status === ComplaintStatus.UNDER_REVIEW).length,
                icon: FileSearch,
                color: 'text-violet-600',
                bg: 'bg-violet-100/50'
              },
              { 
                status: ComplaintStatus.IN_PROGRESS, 
                label: t('common.inProgress'), 
                count: myComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
                icon: Clock,
                color: 'text-blue-500',
                bg: 'bg-blue-100/30'
              },
              { 
                status: ComplaintStatus.RESOLVED, 
                label: t('common.resolved'), 
                count: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
                icon: CheckCircle2,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100/50'
              },
              { 
                status: ComplaintStatus.REJECTED, 
                label: t('common.rejected'), 
                count: myComplaints.filter(c => c.status === ComplaintStatus.REJECTED).length,
                icon: XCircle,
                color: 'text-rose-600',
                bg: 'bg-rose-100/50'
              }
            ].map((item, i) => (
              <motion.div 
                key={item.status} 
                className="flex flex-col items-center p-6 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-premium hover:-translate-y-1 transition-all group lg:aspect-square justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.05) }}
              >
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500', item.bg)}>
                  <item.icon className={cn('w-6 h-6', item.color)} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{item.label}</p>
                <p className="text-3xl font-black text-slate-900">{item.count}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick Actions & Recent Complaints - Mix of sizes */}
        <div className="lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 p-8 flex flex-col bg-blue-50/80 border-blue-100/50 text-slate-900 border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 blur-3xl rounded-full" />
                <h3 className="text-xl font-black mb-8 relative z-10">{t('dashboard.quickActions')}</h3>
                <div className="space-y-4 flex-1 relative z-10">
                    <Link to="/map" className="w-full flex items-center gap-4 p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">{t('dashboard.nearbyIssues')}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{t('dashboard.nearbyIssuesDesc')}</p>
                        </div>
                    </Link>
                    <Link to="/maintenance" className="w-full flex items-center gap-4 p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">{t('dashboard.scheduledMaintenance')}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{t('dashboard.scheduledMaintenanceDesc')}</p>
                        </div>
                    </Link>
                </div>
                <div className="mt-8 relative z-10 text-center">
                    <p className="text-xs font-bold text-blue-600/60 italic">"Working together for a cleaner city"</p>
                </div>
            </Card>

            <Card className="lg:col-span-2 p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('dashboard.recentComplaints')}</h3>
                    <Link to="/my-complaints">
                        <Button variant="ghost" size="sm" className="font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full flex items-center">
                            {t('common.viewAll')}
                            <ArrowUpRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                    {myComplaints.slice(0, 2).map((complaint) => (
                        <Link key={complaint.id} to={`/complaints/${complaint.id}`} className="group">
                            <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden group-hover:shadow-premium group-hover:-translate-y-1 transition-all duration-300">
                                <div className="aspect-[16/9] relative overflow-hidden">
                                    <img
                                        src={getFullImageUrl(complaint.imageUrl)}
                                        alt={complaint.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge variant={complaint.status} className="shadow-premium backdrop-blur-md bg-white/80 border-none">{complaint.status.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{complaint.title}</h4>
                                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                                        <span>{complaint.category}</span>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
