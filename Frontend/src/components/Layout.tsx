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
  Map,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { Button, Card } from './UI';
import { MOCK_NOTIFICATIONS, MOCK_MESSAGES } from '../mockData';
import { motion, AnimatePresence } from 'motion/react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const citizenLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/report', icon: PlusCircle, label: 'Report Issue' },
    { to: '/my-complaints', icon: ClipboardList, label: 'My Complaints' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/complaints', icon: AlertCircle, label: 'Complaints Management' },
    { to: '/admin/citizens', icon: Users, label: 'Citizens' },
    { to: '/admin/staff', icon: Shield, label: 'Staff Management' },
    { to: '/admin/map', icon: Map, label: 'Map View' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Staff Dashboard' },
    { to: '/staff/map', icon: Map, label: 'Map View' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const links = user?.role === UserRole.ADMIN ? adminLinks : 
                user?.role === UserRole.STAFF ? staffLinks : 
                citizenLinks;

  return (
    <aside className="w-64 bg-white border-r border-zinc-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center">
          <AlertCircle className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-zinc-900 tracking-tight">FixMyCity</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive 
                ? 'bg-[#F27D26] text-white shadow-md shadow-orange-100' 
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-orange-50 rounded-2xl p-4 mb-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#F27D26] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-xs font-semibold text-[#F27D26] mb-1">Need Help?</p>
          <p className="text-[10px] text-orange-700/70 mb-3">Check our guide for reporting issues effectively.</p>
          <Link to="/help">
            <Button size="sm" variant="outline" className="w-full bg-white border-orange-100 text-[#F27D26] hover:bg-orange-50">
              View Guide
            </Button>
          </Link>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  
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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search reports, IDs, or status..." 
          className="w-full bg-zinc-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#F27D26]/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
            className={cn(
              "p-2.5 text-zinc-500 hover:bg-zinc-50 rounded-xl relative transition-all",
              showNotifications && "bg-zinc-100 text-[#F27D26]"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-zinc-50 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">Notifications</h3>
                  <button className="text-[10px] font-bold text-[#F27D26] uppercase tracking-wider hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
                      <p className="text-sm text-zinc-700 group-hover:text-zinc-900 leading-snug">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {notif.date}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-zinc-50 text-center">
                  <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={messageRef}>
          <button 
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
            className={cn(
              "p-2.5 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all",
              showMessages && "bg-zinc-100 text-[#F27D26]"
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
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-zinc-50 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">Messages</h3>
                  <Link to="/messages" onClick={() => setShowMessages(false)}>
                    <button className="text-[10px] font-bold text-[#F27D26] uppercase tracking-wider hover:underline">New message</button>
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                  {MOCK_MESSAGES.map((msg) => (
                    <Link key={msg.id} to="/messages" onClick={() => setShowMessages(false)}>
                      <div className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 font-bold text-zinc-400 text-xs">
                          {msg.sender[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-zinc-900 truncate">{msg.sender}</p>
                            <span className="text-[10px] text-zinc-400 font-medium">{msg.time}</span>
                          </div>
                          <p className="text-xs text-zinc-500 truncate">{msg.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-3 bg-zinc-50 text-center">
                  <Link to="/messages" onClick={() => setShowMessages(false)}>
                    <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900">Open message center</button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-[1px] bg-zinc-100 mx-2" />
        
        <Link to="/profile" className="flex items-center gap-3 pl-2 hover:bg-zinc-50 p-1.5 rounded-2xl transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900">{user?.name}</p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{user?.role}</p>
          </div>
          <img 
            src={user?.avatar} 
            alt="Avatar" 
            className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
    </header>
  );
};
