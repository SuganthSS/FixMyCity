import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Share2,
  MoreHorizontal,
  User
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { complaints } = useComplaints();
  const { user } = useAuth();
  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Complaint not found</h2>
        <Link to="/dashboard" className="text-[#F27D26] hover:underline mt-4 inline-block">Back to dashboard</Link>
      </div>
    );
  }

  const canSeeReporter = user?.role === UserRole.ADMIN || (user?.role === UserRole.CITIZEN && user.id === complaint.citizenId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-400">#{complaint.id}</span>
              <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">{complaint.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full bg-zinc-100">
              <img 
                src={complaint.imageUrl} 
                alt={complaint.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Description</h3>
                <p className="text-zinc-600 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Priority</p>
                  <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.department || 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          </Card>

          {canSeeReporter && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-6">Reporter Information</h3>
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${complaint.citizenId}`} alt="" className="w-full h-full" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{complaint.citizenName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Reporter ID: {complaint.citizenId}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Location Details</h3>
            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <MapPin className="w-5 h-5 text-[#F27D26]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{complaint.location}</p>
                {complaint.latitude && complaint.longitude && (
                  <p className="text-xs text-zinc-500 mt-0.5">Coordinates: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
                )}
                <p className="text-xs text-zinc-500 mt-0.5">Reported from this location</p>
                <Button variant="outline" size="sm" className="mt-3 bg-white">View on Map</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Complaint Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100">
              {complaint.timeline.map((event, i) => {
                const isLast = i === complaint.timeline.length - 1;
                const isCompleted = !isLast;
                
                return (
                  <div key={i} className="relative pl-8">
                    <div className={cn(
                      'absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10',
                      isLast ? 'bg-[#F27D26]' : 'bg-green-500'
                    )}>
                      {isLast ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-sm font-bold",
                          isLast ? "text-[#F27D26]" : "text-zinc-900"
                        )}>
                          {event.status.replace('_', ' ')}
                          {isLast && <span className="ml-2 text-[10px] bg-orange-50 text-[#F27D26] px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-400">{new Date(event.timestamp).toLocaleDateString()}</p>
                      </div>
                      {event.note && <p className="text-xs text-zinc-500 leading-relaxed">{event.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-[#F27D26] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Contact Support</h3>
            </div>
            <p className="text-sm text-white/80 mb-6">Have questions about this report? Chat with our support team directly.</p>
            <Link to="/support">
              <Button className="w-full bg-white text-[#F27D26] hover:bg-zinc-50">Start Chat</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
