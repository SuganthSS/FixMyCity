import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Camera, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap,
  Users, 
  BarChart3, 
  Clock,
  MapPin,
  MessageSquare,
  HelpCircle,
  ArrowUpCircle,
  FileSearch,
  XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge } from '../components/UI';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { Logo } from '../components/Logo';

// ─── Animated Dashboard Mockup ──────────────────────────────────────────
const MOCK_COMPLAINTS = [
  {
    id: 'FMC-1042',
    title: 'Pothole on Main Street',
    location: 'MG Road, Sector 12',
    category: 'Road Issue',
    status: 'SUBMITTED',
    statusLabel: 'Submitted',
    time: '2 mins ago',
    statusColor: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
  {
    id: 'FMC-1042',
    title: 'Pothole on Main Street',
    location: 'MG Road, Sector 12',
    category: 'Road Issue',
    status: 'UNDER_REVIEW',
    statusLabel: 'Under Review',
    time: '1 hour ago',
    statusColor: 'bg-violet-100 text-violet-700',
    icon: FileSearch,
    iconColor: 'text-violet-500',
  },
  {
    id: 'FMC-1042',
    title: 'Pothole on Main Street',
    location: 'MG Road, Sector 12',
    category: 'Road Issue',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    time: '3 hours ago',
    statusColor: 'bg-purple-100 text-purple-700',
    icon: Clock,
    iconColor: 'text-purple-500',
  },
  {
    id: 'FMC-1042',
    title: 'Pothole on Main Street',
    location: 'MG Road, Sector 12',
    category: 'Road Issue',
    status: 'RESOLVED',
    statusLabel: 'Resolved',
    time: '1 day ago',
    statusColor: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  }
];

const AnimatedDashboardMockup: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % MOCK_COMPLAINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = MOCK_COMPLAINTS[currentIndex];
  const CurrentIcon = current.icon;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Phone/Dashboard frame */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-gray-200/60 overflow-hidden">
        {/* Top bar */}
        <div className="bg-[#111827] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span className="text-white text-[11px] font-bold tracking-wider uppercase">FixMyCity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400 text-[10px] font-bold">Live</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-5 py-3 bg-[#F9FAFB] border-b border-gray-100 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
            <p className="text-lg font-black text-gray-900">247</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Active</p>
            <p className="text-lg font-black text-purple-600">38</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Resolved</p>
            <p className="text-lg font-black text-emerald-600">192</p>
          </div>
        </div>

        {/* Animated complaint card */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Complaint Tracking</p>
            <div className="flex gap-1">
              {MOCK_COMPLAINTS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    i === currentIndex ? "bg-[#000000] w-4" : "bg-gray-200"
                  )} 
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.status}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", 
                  current.status === 'SUBMITTED' ? 'bg-amber-50' :
                  current.status === 'UNDER_REVIEW' ? 'bg-violet-50' :
                  current.status === 'IN_PROGRESS' ? 'bg-purple-50' :
                  'bg-emerald-50'
                )}>
                  <CurrentIcon className={cn("w-5 h-5", current.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{current.title}</h4>
                    <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">#{current.id}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500 truncate">{current.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider", current.statusColor)}>
                      {current.statusLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{current.time}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] font-black text-gray-900">
                    {current.status === 'SUBMITTED' ? '25%' :
                     current.status === 'UNDER_REVIEW' ? '50%' :
                     current.status === 'IN_PROGRESS' ? '75%' : '100%'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    className={cn("h-1.5 rounded-full",
                      current.status === 'SUBMITTED' ? 'bg-amber-400' :
                      current.status === 'UNDER_REVIEW' ? 'bg-violet-500' :
                      current.status === 'IN_PROGRESS' ? 'bg-purple-500' :
                      'bg-emerald-500'
                    )}
                    initial={{ width: '0%' }}
                    animate={{ width: 
                      current.status === 'SUBMITTED' ? '25%' :
                      current.status === 'UNDER_REVIEW' ? '50%' :
                      current.status === 'IN_PROGRESS' ? '75%' : '100%'
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mini timeline */}
          <div className="mt-4 flex items-center gap-1">
            {MOCK_COMPLAINTS.map((step, i) => {
              const StepIcon = step.icon;
              const isReached = i <= currentIndex;
              return (
                <React.Fragment key={i}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 shrink-0",
                    isReached ? 
                      (i === currentIndex ? 'bg-[#000000] shadow-sm' : 'bg-gray-800') : 
                      'bg-gray-100'
                  )}>
                    <StepIcon className={cn("w-3.5 h-3.5 transition-colors duration-500", isReached ? 'text-white' : 'text-gray-300')} />
                  </div>
                  {i < MOCK_COMPLAINTS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 rounded-full transition-colors duration-500", i < currentIndex ? 'bg-gray-800' : 'bg-gray-100')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-5 py-3 bg-[#F9FAFB] border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-500">78% Resolution Rate</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400">Updated just now</span>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-100 rounded-full blur-xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gray-200 rounded-full blur-2xl opacity-40 pointer-events-none" />
    </div>
  );
};

// ─── Landing Page Component ─────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-[12px] border-b border-zinc-100/50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/">
              <Logo iconSize="w-8 h-8 md:w-10 md:h-10" textSize="text-lg md:text-xl" />
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 md:gap-8"
          >
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <Link to="/login">
              <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] md:text-xs px-2 md:px-4">{t('common.login')}</Button>
            </Link>
            <Link to="/register">
              <Button className="shadow-premium px-4 md:px-8 text-xs md:text-sm">{t('common.register')}</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section — split layout with animated mockup */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-[-300px] right-[-100px] w-[800px] h-[800px] bg-gray-100/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[100px] left-[-200px] w-[600px] h-[600px] bg-gray-50/60 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-10 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="inline-flex items-center gap-2 px-4 md:px-6 py-2 bg-gray-100 text-[#000000] rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase border border-gray-200"
                >
                  <div className="w-1.5 h-1.5 bg-[#000000] rounded-full animate-pulse" />
                  Empowering Smart Governance
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase"
                >
                  {t('landing.heroTitle')}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg font-medium"
                >
                  {t('landing.heroDesc')}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 md:gap-5 pt-2"
                >
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 md:h-16 px-8 md:px-10 text-base md:text-lg bg-[#000000] text-white hover:bg-[#1F2937] shadow-2xl shadow-black/15 group border-none rounded-2xl">
                      {t('common.getStarted')}
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full h-14 md:h-16 px-8 md:px-10 text-base md:text-lg border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl bg-white/50 backdrop-blur-sm">
                      {t('common.createAccount')}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right — animated mockup with floating accents */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 lg:mt-0 relative"
            >
              {/* Floating Stat Card (Top-Left) */}
              <motion.div 
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute -top-6 -left-6 md:-top-10 md:-left-10 z-20 bg-white p-4 md:p-5 rounded-3xl shadow-2xl border border-gray-100 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('landing.mockup.weeklyActivity', 'Weekly Activity')}</p>
                    <p className="text-sm md:text-base font-black text-slate-900 leading-none">{t('landing.mockup.issuesReported', '247 Issues Reported')}</p>
                  </div>
                </div>
              </motion.div>

              <AnimatedDashboardMockup />

              {/* Floating Resolve Chip (Bottom-Right) */}
              <motion.div 
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 z-20 bg-emerald-50 px-4 md:px-6 py-3 md:py-4 rounded-3xl shadow-xl border border-emerald-100 hidden sm:flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs md:text-sm font-black text-emerald-700 uppercase tracking-widest whitespace-nowrap">{t('landing.mockup.issueResolved', 'Issue Resolved Successfully')}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Dark Stats Section */}
      <section className="py-24 bg-[#000000] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-[20%] w-px h-full bg-white transition-opacity" />
          <div className="absolute top-0 left-[40%] w-px h-full bg-white transition-opacity" />
          <div className="absolute top-0 left-[60%] w-px h-full bg-white transition-opacity" />
          <div className="absolute top-0 left-[80%] w-px h-full bg-white transition-opacity" />
        </div>

        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 text-white rounded-full text-xs font-black tracking-widest uppercase border border-white/10 mb-8"
            >
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {t('landing.darkStats.badge', 'Live Platform Metrics')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-8 leading-[0.95]"
            >
              {t('landing.darkStats.title1', 'Report any civic issue')} <br className="hidden md:block" /> {t('landing.darkStats.title2', 'in under 2 minutes.')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed"
            >
              {t('landing.darkStats.desc', 'Simple, fast, and transparent — from submission to resolution. Join thousands of citizens making a difference.')}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { label: t('landing.darkStats.activeIssues', 'Active Issues'), value: "38", color: "text-amber-400", sub: t('landing.darkStats.activeIssuesSub', 'Currently being reviewed') },
              { label: t('landing.darkStats.resolved', 'Resolved'), value: "192", color: "text-emerald-400", sub: t('landing.darkStats.resolvedSub', 'Successfully fixed') },
              { label: t('landing.darkStats.citizensHelped', 'Citizens Helped'), value: "450+", color: "text-white", sub: t('landing.darkStats.citizensHelpedSub', 'Community members') }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center backdrop-blur-sm hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 translate-y-[-100%] group-hover:translate-y-0 transition-transform bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 group-hover:text-white transition-colors">{stat.label}</p>
                <p className={cn("text-5xl md:text-8xl font-black tracking-tighter mb-4", stat.color)}>{stat.value}</p>
                <p className="text-xs font-bold text-gray-400 italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#F5F7FA] relative">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase mb-4">
                {t('common.howItWorks')}
              </h2>
              <p className="text-lg md:text-xl text-zinc-500 font-bold max-w-lg mx-auto md:mx-0">
                {t('landing.howItWorksDesc', 'Transparent and efficient lifecycle for every reported grievance.')}
              </p>
            </div>
            <Link to="/public-feed" className="w-full md:w-auto">
              <Button variant="outline" className="w-full h-14 px-10 border-zinc-200">{t('landing.viewLiveFeed', 'View Live Feed')}</Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Camera className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.report.title'),
                desc: t('landing.howItWorksSteps.report.desc'),
                color: 'bg-gray-100 text-[#000000]',
                badge: 'bg-[#000000]'
              },
              {
                icon: <Search className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.track.title'),
                desc: t('landing.howItWorksSteps.track.desc'),
                color: 'bg-gray-100 text-[#374151]',
                badge: 'bg-gray-500'
              },
              {
                icon: <CheckCircle2 className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.city.title'),
                desc: t('landing.howItWorksSteps.city.desc'),
                color: 'bg-emerald-50 text-emerald-600',
                badge: 'bg-[#111827]'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className={cn(
                  "absolute -top-6 -left-6 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black z-20 shadow-xl border-4 border-[#F5F7FA]",
                  step.badge
                )}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <Card className="p-8 h-full hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden bg-white border-none shadow-sm">
                  <div className={cn('w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner', step.color)}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight uppercase leading-tight min-h-[4rem] flex items-center">{step.title}</h3>
                  <p className="text-zinc-500 font-bold leading-relaxed text-base">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* New Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-200 pt-16"
          >
            {[
              { label: t('landing.statsRow.timeLabel', 'Time to report an issue'), value: t('landing.statsRow.timeValue', '2 min') },
              { label: t('landing.statsRow.resLabel', 'Resolution rate'), value: t('landing.statsRow.resValue', '81%') },
              { label: t('landing.statsRow.coverageLabel', 'Local coverage radius'), value: t('landing.statsRow.coverageValue', '25km') }
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left group">
                <p className="text-5xl md:text-7xl font-black text-zinc-900 mb-2 tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">— {stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-16 px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter uppercase mb-8"
            >
              {t('common.platformFeatures')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-bold"
            >
              {t('landing.platformDesc', 'Supercharging civic governance with a suite of professional-grade tools.')}
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: t('landing.features.ai.title'),
                desc: t('landing.features.ai.desc'),
                color: 'text-[#374151]'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: t('landing.features.tracking.title'),
                desc: t('landing.features.tracking.desc'),
                color: 'text-[#000000]'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: t('landing.features.admin.title'),
                desc: t('landing.features.admin.desc'),
                color: 'text-emerald-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: t('landing.features.community.title'),
                desc: t('landing.features.community.desc'),
                color: 'text-purple-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-2xl transition-all duration-700 group border-none">
                  <div className={cn('w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#000000] group-hover:text-white transition-all shadow-inner', feature.color)}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight uppercase leading-[1.1]">{feature.title}</h3>
                  <p className="text-zinc-500 font-bold leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase mb-10 leading-[0.95]">
                {t('landing.workflow.title1', 'Everything connects.')}<br />{t('landing.workflow.title2', 'Nothing slows you down.')}
              </h2>
              <div className="space-y-6">
                {[
                  t('landing.workflow.point1', 'Report issues with photo and location'),
                  t('landing.workflow.point2', 'Track status from submission to resolution'),
                  t('landing.workflow.point3', 'Community upvoting for priority issues'),
                  t('landing.workflow.point4', 'Real-time notifications on updates')
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-lg font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - Visual Flow */}
            <div className="relative">
              <div className="absolute left-6 top-10 bottom-10 w-px bg-zinc-200" />
              <div className="space-y-12 relative z-10">
                {[
                  { 
                    step: t('landing.workflow.step1', 'Step 1'), 
                    title: t('landing.workflow.step1Title', 'Report Issue'), 
                    desc: t('landing.workflow.step1Desc', 'Fill in details and pin location'),
                    icon: <Camera className="w-5 h-5" />
                  },
                  { 
                    step: t('landing.workflow.step2', 'Step 2'), 
                    title: t('landing.workflow.step2Title', 'Staff Reviews'), 
                    desc: t('landing.workflow.step2Desc', 'Department assigned and assessed'),
                    icon: <Search className="w-5 h-5" />
                  },
                  { 
                    step: t('landing.workflow.step3', 'Step 3'), 
                    title: t('landing.workflow.step3Title', 'Issue Resolved'), 
                    desc: t('landing.workflow.step3Desc', 'Citizen notified on completion'),
                    icon: <CheckCircle2 className="w-5 h-5" />
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    className="flex gap-8 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-[#000000] group-hover:text-white transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">{item.step}</span>
                      <h4 className="text-xl font-black text-zinc-900 mb-2 uppercase">{item.title}</h4>
                      <p className="text-zinc-500 font-bold">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Left - Accordions */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase mb-6">
                  {t('landing.faq.title', 'Common Questions')}
                </h2>
                <p className="text-lg font-bold text-zinc-500">{t('landing.faq.desc', 'Everything you need to know about the platform.')}</p>
              </motion.div>

              <div className="space-y-4">
                {[
                  { q: t('landing.faq.q1', 'How do I report a civic issue?'), a: t('landing.faq.a1', "Simply sign in to your citizen account, click 'Report Issue', pin the location on the map, and upload a photo with details.") },
                  { q: t('landing.faq.q2', 'How long does resolution take?'), a: t('landing.faq.a2', "Each department has specific SLAs. You'll receive real-time updates as the status changes from submitted to resolved.") },
                  { q: t('landing.faq.q3', 'Is my personal information private?'), a: t('landing.faq.a3', "Yes. Your privacy is our priority. Personal details are only visible to authorized department staff handling your case.") },
                  { q: t('landing.faq.q4', 'Can I track my complaint status?'), a: t('landing.faq.a4', "Absolutely. Every report gets a unique ID (e.g., #FMC-1042) that you can track in real-time on your dashboard.") },
                  { q: t('landing.faq.q5', 'What areas does FixMyCity cover?'), a: t('landing.faq.a5', "Currently, we cover all major metropolitan zones and surrounding districts. We are expanding to more areas every month.") }
                ].map((faq, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-zinc-200 rounded-3xl overflow-hidden bg-white"
                  >
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                    >
                      <span className="text-lg font-black text-zinc-900 uppercase tracking-tight">{faq.q}</span>
                      <div className={cn(
                        "w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center transition-transform duration-500",
                        openFaq === i ? "rotate-45 bg-[#000000] border-[#000000] text-white" : "text-zinc-400"
                      )}>
                        <Zap className={cn("w-4 h-4", openFaq === i ? "fill-white" : "")} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-8 pb-8 text-zinc-500 font-bold leading-relaxed border-t border-zinc-100 pt-6">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right - Marketing Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#000000] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-6 leading-none text-white">
                    {t('landing.cta.title1', 'Start reporting')}<br />{t('landing.cta.title2', 'issues in under')}<br />{t('landing.cta.title3', '2 minutes.')}
                  </h3>
                  <p className="text-gray-400 font-bold mb-10 text-lg">{t('landing.cta.desc', 'Join citizens helping build a better city.')}</p>
                  
                  <div className="space-y-4 mb-12">
                    {[t('landing.cta.free', 'Free to use'), t('landing.cta.location', 'Location based'), t('landing.cta.realtime', 'Real-time updates')].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-sm text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4">
                    <Link to="/register">
                      <Button size="lg" className="w-full h-16 bg-white text-[#000000] hover:bg-zinc-100 rounded-2xl font-black uppercase tracking-widest text-xs">
                        {t('landing.cta.button', 'Get Started')}
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="lg" className="w-full h-16 border-white/20 text-white hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="py-40 bg-[#000000] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[100%] bg-white rounded-full blur-[200px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[100%] bg-gray-400 rounded-full blur-[200px]" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 md:mb-10 tracking-tighter uppercase leading-[0.9]">
              {t('common.readyToMakeDifference')}
            </h2>
            <p className="text-white/60 text-lg md:text-xl mb-12 md:mb-16 max-w-3xl mx-auto font-bold leading-relaxed">
              {t('common.joinThousands')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-10">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-20 md:h-24 px-10 md:px-16 text-xl md:text-3xl shadow-2xl bg-white text-[#000000] hover:bg-zinc-100 border-none">
                  {t('common.getStarted')}
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-20 md:h-24 px-10 md:px-16 text-xl md:text-3xl border-white text-white hover:bg-white/10">
                  {t('common.reportIssue')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Logo iconSize="w-8 h-8" textSize="text-xl" />
              </div>
              <p className="text-zinc-500 max-w-sm">
                {t('common.footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-4 md:mb-6">Platform</h4>
              <ul className="space-y-3 md:space-y-4 text-sm text-zinc-600">
                <li><Link to="/help" className="hover:text-[#000000] flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {t('common.help')}</Link></li>
                <li><Link to="/map" className="hover:text-[#000000] flex items-center gap-2"><MapPin className="w-4 h-4" /> {t('common.map')}</Link></li>
                <li><Link to="/maintenance" className="hover:text-[#000000] flex items-center gap-2"><Clock className="w-4 h-4" /> Maintenance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-4 md:mb-6">Support</h4>
              <ul className="space-y-3 md:space-y-4 text-sm text-zinc-600">
                <li><Link to="/support" className="hover:text-[#000000] flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Contact Support</Link></li>
                <li><Link to="/messages" className="hover:text-[#000000] flex items-center gap-2"><Users className="w-4 h-4" /> Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>© 2026 FixMyCity Platform. {t('common.rights')}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#000000]">{t('common.privacy')}</a>
              <a href="#" className="hover:text-[#000000]">{t('common.terms')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
