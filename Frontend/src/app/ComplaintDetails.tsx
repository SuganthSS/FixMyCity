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
import { useTranslation } from 'react-i18next';
import { UserRole } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn, getFullImageUrl } from '../lib/utils';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { complaints } = useComplaints();
  const { user } = useAuth();
  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">{t('complaintDetails.notFound')}</h2>
        <Link to="/dashboard" className="text-[#000000] hover:underline mt-4 inline-block">{t('complaintDetails.back')}</Link>
      </div>
    );
  }

  const canSeeReporter = user?.role === UserRole.ADMIN || (user?.role === UserRole.CITIZEN && user.id === complaint.citizenId);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-400">#{complaint.id}</span>
              <Badge variant={complaint.status} className="text-[10px] md:text-xs">{t(`common.${complaint.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}</Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 truncate">{complaint.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:self-start">
          <Button variant="outline" size="sm" className="rounded-xl px-4">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full bg-zinc-100">
              <img 
                src={getFullImageUrl(complaint.imageUrl)} 
                alt={complaint.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">{t('complaintDetails.description')}</h3>
                <p className="text-zinc-600 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('complaintDetails.category')}</p>
                  <p className="text-sm font-semibold text-zinc-900">{t(`common.${complaint.category.split(' ').map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('')}`)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('complaintDetails.priority')}</p>
                  <Badge variant={complaint.priority}>{t(`common.${complaint.priority.toLowerCase()}`)}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('complaintDetails.department')}</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.department || t('complaintDetails.notAssigned')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Landmark</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.landmark || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Issue Date</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.issueDate ? new Date(complaint.issueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Recurring</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.recurringIssue ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </Card>

          {canSeeReporter && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-6">{t('complaintDetails.reporterInfo')}</h3>
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${complaint.citizenId}`} alt="" className="w-full h-full" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{complaint.citizenName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t('complaintDetails.reporterId')}: {complaint.citizenId}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">{t('complaintDetails.locationDetails')}</h3>
            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <MapPin className="w-5 h-5 text-[#000000]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{complaint.location}</p>
                {complaint.latitude && complaint.longitude && (
                  <p className="text-xs text-zinc-500 mt-2">{t('complaintDetails.coordinates')}: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
                )}
                <Button variant="outline" size="sm" className="mt-4 bg-white">{t('complaintDetails.viewOnMap')}</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">{t('complaintDetails.timeline')}</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100">
              {complaint.timeline.map((event, i) => {
                const isLast = i === complaint.timeline.length - 1;
                const isCompleted = !isLast;
                
                return (
                  <div key={i} className="relative pl-8">
                    <div className={cn(
                      'absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10',
                      isLast ? 'bg-[#000000]' : 'bg-green-500'
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
                          isLast ? "text-[#000000]" : "text-zinc-900"
                        )}>
                          {t(`common.${event.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}
                          {isLast && <span className="ml-2 text-[10px] bg-gray-100 text-[#000000] px-2 py-0.5 rounded-full uppercase tracking-wider">{t('complaintDetails.current')}</span>}
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

          <Card className="p-6 bg-gray-50 border-gray-200/50 text-slate-900 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-[#000000]" />
              </div>
              <h3 className="text-lg font-bold">{t('complaintDetails.contactSupport')}</h3>
            </div>
            <p className="text-sm text-slate-600 font-medium mb-6">{t('complaintDetails.supportDesc')}</p>
            <Link to="/support">
              <Button className="w-full bg-[#000000] text-white hover:bg-[#1F2937]">{t('complaintDetails.startChat')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
