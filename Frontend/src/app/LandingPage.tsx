import React from 'react';
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
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge } from '../components/UI';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

import { Logo } from '../components/Logo';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-[12px] border-b border-zinc-100/50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/">
              <Logo iconSize="w-10 h-10" textSize="text-xl" />
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-8"
          >
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="ghost" className="font-black uppercase tracking-widest text-xs">{t('common.login')}</Button>
            </Link>
            <Link to="/register">
              <Button className="shadow-premium px-8">{t('common.register')}</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        {/* Modern Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        <div className="absolute top-[-300px] right-[-100px] w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[100px] left-[-200px] w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-10 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-black tracking-widest uppercase border border-blue-100"
              >
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                Empowering Smart Governance
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl lg:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase"
              >
                {t('landing.heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-blue-600" : ""}>{word} </span>
                ))}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl text-slate-500 mb-14 leading-relaxed max-w-2xl mx-auto font-medium"
              >
                {t('landing.heroDesc')}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 pt-4"
              >
                <Link to="/login">
                  <Button size="lg" className="h-20 px-12 text-xl bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-600/20 group border-none rounded-3xl">
                    {t('common.getStarted')}
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="h-20 px-12 text-xl border-slate-200 text-slate-900 hover:bg-slate-50 rounded-3xl bg-white/50 backdrop-blur-sm">
                    {t('common.createAccount')}
                  </Button>
                </Link>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F5F7FA] relative">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
          >
            <div>
              <h2 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase mb-4">
                {t('common.howItWorks')}
              </h2>
              <p className="text-xl text-zinc-500 font-bold max-w-lg">
                Transparent and efficient lifecycle for every reported grievance.
              </p>
            </div>
            <Link to="/public-feed">
              <Button variant="outline" className="h-14 px-10 border-zinc-200">View Live Feed</Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Camera className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.report.title'),
                desc: t('landing.howItWorksSteps.report.desc'),
                color: 'bg-blue-50 text-[#2563EB]'
              },
              {
                icon: <Search className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.track.title'),
                desc: t('landing.howItWorksSteps.track.desc'),
                color: 'bg-blue-50 text-blue-600'
              },
              {
                icon: <CheckCircle2 className="w-10 h-10" />,
                title: t('landing.howItWorksSteps.city.title'),
                desc: t('landing.howItWorksSteps.city.desc'),
                color: 'bg-emerald-50 text-emerald-600'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="p-8 h-full hover:-translate-y-3 transition-all duration-500 group">
                  <div className={cn('w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner', step.color)}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight uppercase leading-tight min-h-[4rem] flex items-center">{step.title}</h3>
                  <p className="text-zinc-500 font-bold leading-relaxed text-base">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-6xl font-black text-zinc-900 tracking-tighter uppercase mb-8"
            >
              {t('common.platformFeatures')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-zinc-500 max-w-3xl mx-auto font-bold"
            >
              Supercharging civic governance with a suite of professional-grade tools.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: t('landing.features.ai.title'),
                desc: t('landing.features.ai.desc'),
                color: 'text-blue-500'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: t('landing.features.tracking.title'),
                desc: t('landing.features.tracking.desc'),
                color: 'text-orange-500'
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
                  <div className={cn('w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2563EB] group-hover:text-white transition-all shadow-inner', feature.color)}>
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

      <section className="py-40 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[100%] bg-blue-600 rounded-full blur-[200px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[100%] bg-white rounded-full blur-[200px]" />
        </div>
        
        <div className="max-w-5xl mx-auto px-10 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.9]">
              {t('common.readyToMakeDifference')}
            </h2>
            <p className="text-white/60 text-xl mb-16 max-w-3xl mx-auto font-bold leading-relaxed">
              {t('common.joinThousands')}
            </p>
            <div className="flex flex-wrap justify-center gap-10">
              <Link to="/login">
                <Button size="lg" className="h-24 px-16 text-3xl shadow-2xl bg-white text-[#0F172A] hover:bg-zinc-100 border-none">
                  {t('common.getStarted')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-24 px-16 text-3xl border-white text-white hover:bg-white/10">
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
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Logo iconSize="w-8 h-8" textSize="text-xl" />
              </div>
              <p className="text-zinc-500 max-w-sm">
                {t('common.footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><Link to="/help" className="hover:text-[#2563EB] flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {t('common.help')}</Link></li>
                <li><Link to="/map" className="hover:text-[#2563EB] flex items-center gap-2"><MapPin className="w-4 h-4" /> {t('common.map')}</Link></li>
                <li><Link to="/maintenance" className="hover:text-[#2563EB] flex items-center gap-2"><Clock className="w-4 h-4" /> Maintenance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><Link to="/support" className="hover:text-[#2563EB] flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Contact Support</Link></li>
                <li><Link to="/messages" className="hover:text-[#2563EB] flex items-center gap-2"><Users className="w-4 h-4" /> Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>© 2026 FixMyCity Platform. {t('common.rights')}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#2563EB]">{t('common.privacy')}</a>
              <a href="#" className="hover:text-[#2563EB]">{t('common.terms')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
