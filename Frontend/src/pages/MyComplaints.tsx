import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintStatus, ComplaintCategory } from '../types';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const myComplaints = complaints.filter(c => c.citizenId === user?.id);

  const filteredComplaints = myComplaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.includes(searchQuery);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27D26]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Complaints</h1>
          <p className="text-zinc-500 mt-1">Track the status of your reported civic issues.</p>
        </div>
        <Link to="/report">
          <Button>Report New Issue</Button>
        </Link>
      </header>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center bg-zinc-50/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by title or ID..."
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-40">
            <select
              className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ComplaintStatus).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 md:w-48">
            <select
              className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.values(ComplaintCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint, i) => (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/complaint/${complaint.id}`}>
                  <Card className="p-4 hover:border-[#F27D26]/30 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={complaint.imageUrl}
                          alt={complaint.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                              <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#F27D26] transition-colors">
                              {complaint.title}
                            </h3>
                          </div>
                          <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded">#{complaint.id}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-500 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100 rounded-lg">
                              <Filter className="w-3 h-3" />
                            </div>
                            {complaint.category}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100 rounded-lg">
                              <MapPin className="w-3 h-3" />
                            </div>
                            <span className="truncate">{complaint.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100 rounded-lg">
                              <Calendar className="w-3 h-3" />
                            </div>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100 rounded-lg">
                              <Clock className="w-3 h-3" />
                            </div>
                            Last updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#F27D26] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">No complaints found</h3>
              <p className="text-zinc-500 mt-1">Try adjusting your filters or report a new issue.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setSearchQuery(''); }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
