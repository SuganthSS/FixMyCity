import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  User, 
  LogOut, 
  LayoutDashboard, 
  BarChart3, 
  Users,
  AlertCircle,
  Search,
  Bell,
  MessageSquare,
  Clock,
  Shield,
  ShieldCheck,
  Map
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { cn, getFullImageUrl } from '../lib/utils';
import { Button, Card } from './UI';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion, AnimatePresence } from 'motion/react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';
import { getUnreadCount } from '../services/messagesApi';
import { Notification } from '../types';

import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const { t } = useTranslation();
  const citizenLinks = [
    { to: '/dashboard', icon: Home, label: t('common.home') },
    { to: '/report', icon: PlusCircle, label: t('common.reportIssue') },
    { to: '/public-feed', icon: Users, label: t('common.publicFeed') },
    { to: '/my-complaints', icon: ClipboardList, label: t('common.myComplaints') },
    { to: '/messages', icon: MessageSquare, label: t('common.messages') },
    { to: '/profile', icon: User, label: t('common.profile') },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('common.adminDashboard') },
    { to: '/admin/complaints', icon: AlertCircle, label: t('common.complaintsManagement') },
    { to: '/admin/citizens', icon: Users, label: t('common.citizens') },
    { to: '/admin/hod', icon: ShieldCheck, label: 'HOD Management' },
    { to: '/admin/staff', icon: Shield, label: t('common.staffManagement') },
    { to: '/admin/messages', icon: MessageSquare, label: t('common.messages') },
    { to: '/admin/map', icon: Map, label: t('common.mapView') },
    { to: '/admin/analytics', icon: BarChart3, label: t('common.analytics') },
    { to: '/profile', icon: User, label: t('common.profile') },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: t('common.staffDashboard') },
    { to: '/staff/map', icon: Map, label: t('common.mapView') },
    { to: '/profile', icon: User, label: t('common.profile') },
    { to: '/staff/messages', icon: MessageSquare, label: t('common.messages') },
  ];

  const hodLinks = [
    { to: '/hod/dashboard', icon: LayoutDashboard, label: 'HOD Dashboard' },
    { to: '/hod/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: t('common.profile') },
  ];

  const links = user?.role === UserRole.ADMIN ? adminLinks : 
                user?.role === UserRole.STAFF ? staffLinks : 
                user?.role === UserRole.HOD ? hodLinks :
                citizenLinks;

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF || user?.role === UserRole.HOD) {
      getUnreadCount().then(setUnreadMessages).catch(console.error);
      const interval = setInterval(() => {
        getUnreadCount().then(setUnreadMessages).catch(console.error);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "w-72 bg-[#111827] flex flex-col h-screen fixed inset-y-0 left-0 z-50 lg:sticky top-0 shadow-premium border-r border-[#1F2937] transition-transform duration-300 lg:translate-x-0 lg:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <Logo iconSize="w-10 h-10" textSize="text-2xl" className="[&_span]:!from-white [&_span]:!to-gray-400" />
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300',
              isActive 
                ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <link.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-gray-500")} />
                  {(link.to === '/admin/messages' || link.to === '/messages' || link.to === '/hod/messages') && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#111827] shadow-sm transform scale-[0.6] origin-top-right" />
                  )}
                </div>
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 mt-auto">
        {user?.role === UserRole.CITIZEN && (
          <div className="bg-[#1F2937] rounded-[2.5rem] p-6 mb-6 relative overflow-hidden group border border-white/5 shadow-sm">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <p className="text-sm font-bold text-white mb-1">{t('common.needHelp')}</p>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed font-medium">{t('common.helpDescription')}</p>
            <Link to="/help">
              <Button size="sm" variant="outline" className="w-full bg-[#111827] border-white/10 text-white hover:bg-[#000000] hover:text-white hover:border-white/20 transition-all font-bold">
                {t('common.viewGuide')}
              </Button>
            </Link>
          </div>
        )}
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-[13px] font-bold text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          {t('common.logout')}
        </button>
      </div>
    </aside>
    </>
  );
};

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 lg:h-24 bg-white/60 backdrop-blur-[12px] border-b border-slate-100 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:block lg:flex-1 lg:max-w-sm relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#000000] transition-colors" />
          <input 
            type="text" 
            placeholder={t('common.search')}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:bg-white focus:border-[#374151]/20 focus:ring-4 focus:ring-black/5 transition-all duration-300 shadow-soft"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === UserRole.CITIZEN && <LanguageSwitcher />}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
            className={cn(
              "p-3 text-slate-500 hover:bg-slate-50 rounded-xl relative transition-all",
              showNotifications && "bg-gray-100 text-[#000000]"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed lg:absolute left-4 right-4 lg:left-auto lg:right-0 top-20 lg:top-auto lg:mt-3 lg:w-80 bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{t('common.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-[#000000] uppercase tracking-wider hover:underline">{t('common.markAllRead')}</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification._id} 
                        className={cn("p-5 cursor-pointer hover:bg-slate-50 transition-colors", !notification.isRead && "bg-gray-50/50")}
                        onClick={() => { if (!notification.isRead) handleMarkAsRead(notification._id); }}
                      >
                        <p className="font-bold text-sm text-slate-900 mb-1">{notification.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{notification.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-slate-300" />
                       </div>
                       <p className="text-sm font-medium text-slate-400">{t('common.noNotifications')}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
                  <button className="text-xs font-bold text-slate-500 hover:text-[#000000] transition-colors">{t('common.viewAll')}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={messageRef}>
          <button 
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
            className={cn(
              "p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all",
              showMessages && "bg-gray-100 text-[#000000]"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed lg:absolute left-4 right-4 lg:left-auto lg:right-0 top-20 lg:top-auto lg:mt-3 lg:w-80 bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{t('common.messages')}</h3>
                  <Link to="/messages" onClick={() => setShowMessages(false)}>
                    <button className="text-[10px] font-bold text-[#000000] uppercase tracking-wider hover:underline">{t('common.messages')}</button>
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                   <div className="p-10 text-center">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-6 h-6 text-slate-300" />
                       </div>
                       <p className="text-sm font-medium text-slate-400">{t('common.noMessages')}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
                  <Link to="/messages" onClick={() => setShowMessages(false)}>
                    <button className="text-xs font-bold text-slate-500 hover:text-[#000000] transition-colors">{t('common.openMessageCenter')}</button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-100 mx-2" />
        
        <Link to="/profile" className="flex items-center gap-3 pl-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-[10px] font-black text-[#000000] uppercase tracking-widest">{user?.role}</p>
          </div>
          <img 
            src={getFullImageUrl(user?.avatar)} 
            alt="Avatar" 
            className="w-11 h-11 rounded-xl border-2 border-white shadow-premium"
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
    </header>
  );
};
