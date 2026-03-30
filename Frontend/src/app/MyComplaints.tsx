import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  MoreVertical,
  Ticket
} from 'lucide-react';
import { ComplaintStatus, ComplaintCategory } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../context/ComplaintContext';
import { getFullImageUrl } from '../lib/utils';
import { ticketsApi } from '../services/ticketsApi';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { complaints, loading } = useComplaints();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await ticketsApi.getMyTickets();
      setTickets(res.data);
    } catch(e) {
      console.error('Failed to fetch tickets:', e);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRaiseTicket = async (complaintId: string) => {
    try {
      await ticketsApi.raiseTicket(complaintId);
      await fetchTickets();
    } catch(e) {
      console.error('Failed to raise ticket:', e);
    }
  };

  const myComplaints = complaints.filter(c => c.citizenId === user?.id);

  const filteredComplaints = myComplaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.includes(searchQuery);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">{t('myComplaints.title')}</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">{t('myComplaints.subtitle')}</p>
        </div>
        <Link to="/report" className="w-full md:w-auto">
          <Button className="w-full">{t('dashboard.reportNew')}</Button>
        </Link>
      </header>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center bg-zinc-50/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder={t('myComplaints.searchPlaceholder')}
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-40">
            <select
              className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs md:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black/10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Status</option>
              {Object.values(ComplaintStatus).map(s => (
                <option key={s} value={s}>{t(`common.${s.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 md:w-48">
            <select
              className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs md:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black/10"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Category</option>
              {Object.values(ComplaintCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 hidden md:flex">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint, i) => {
              const ticket = tickets.find(t => t.complaintId?._id === complaint.id || t.complaintId === complaint.id);

              return (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 hover:border-[#374151]/30 hover:shadow-md transition-all group flex flex-col">
                  <Link to={`/complaints/${complaint.id}`} className="block flex-1 cursor-pointer">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={getFullImageUrl(complaint.imageUrl)}
                          alt={complaint.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={complaint.status}>{t(`common.${complaint.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}</Badge>
                              <Badge variant={complaint.priority}>{t(`common.${complaint.priority.toLowerCase()}`)}</Badge>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#374151] transition-colors">
                              {complaint.title}
                            </h3>
                          </div>
                          <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded">#{complaint.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-zinc-500 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100/50 rounded-lg">
                              <Filter className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{t(`common.${complaint.category.split(' ').map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('')}`)}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 bg-zinc-100/50 rounded-lg shrink-0">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="truncate block">{complaint.location}</span>
                              {complaint.landmark && (
                                <span className="text-[10px] text-zinc-400 block truncate">({complaint.landmark})</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100/50 rounded-lg">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100/50 rounded-lg">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{t('common.lastUpdated')}: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#000000] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-end">
                    {ticket ? (
                      ticket.status === 'OPEN' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1 rounded-full font-medium">
                          Ticket Raised — Awaiting Staff ({ticket.ticketCode})
                        </span>
                      ) : ticket.status === 'ACCEPTED' ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-medium">
                          {ticket.ticketCode} — In Progress
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
                          {ticket.ticketCode} — Closed
                        </span>
                      )
                    ) : (
                      complaint.category ? (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleRaiseTicket(complaint.id); }}
                          className="bg-black text-white rounded-lg px-3 py-1.5 text-sm font-medium flex items-center hover:bg-zinc-800 transition-colors"
                        >
                          <Ticket className="w-4 h-4 mr-1.5" /> Raise Ticket
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Department not assigned yet — ticket unavailable</span>
                      )
                    )}
                  </div>
                </Card>
              </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{t('myComplaints.notFound')}</h3>
              <p className="text-zinc-500 mt-1">{t('myComplaints.notFoundDesc')}</p>
              <Button variant="outline" className="mt-6" onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setSearchQuery(''); }}>
                {t('myComplaints.clearFilters')}
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
