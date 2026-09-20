import React, { useEffect, useState } from 'react';
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
  RotateCcw,
  ShieldAlert,
  History
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/UI';
import { cn, getFullImageUrl } from '../lib/utils';
import { FeedbackForm } from '../components/FeedbackForm';
import { InternalNotes } from '../components/InternalNotes';
import { complaintApi } from '../services/complaintApi';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { complaints, refreshComplaints, loading } = useComplaints();
  const { user } = useAuth();
  const complaint = complaints.find(c => c.id === id || c._id === id || c.trackingCode === id || c.complaintCode === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReopening, setIsReopening] = useState(false);
  const [reopenError, setReopenError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaint && !loading) {
      refreshComplaints();
    }
  }, [complaint, loading, refreshComplaints]);

  if (loading && !complaint) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27D26]"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center py-20">
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Complaint not found</h2>
        <p className="text-zinc-500 mt-2">The report you are looking for doesn't exist or you don't have access.</p>
        <Link to="/my-complaints" className="mt-8 inline-block">
          <Button variant="outline">Back to My Complaints</Button>
        </Link>
      </div>
    );
  }

  const displayCode = complaint.trackingCode || complaint.complaintCode || complaint.id || complaint._id || '';
  const displayStage = (complaint.workflowStage || complaint.status || 'SUBMITTED').toString();
  const displayDepartment = (complaint.assignedDepartment || complaint.department || 'Not Assigned').toString();

  const mediaList = (complaint.media && complaint.media.length > 0)
    ? complaint.media
    : complaint.imageUrl
    ? [{ url: complaint.imageUrl, caption: 'Report Image' }]
    : [];

  const activeMediaUrl = mediaList[activeImageIndex]?.url || complaint.imageUrl || '';

  const isOwner = user && (user.id === complaint.citizenId || user._id === complaint.citizenId || user.id === (complaint.citizenId as any)?._id);
  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'hod' || user.role === 'admin');
  const isResolved = displayStage === 'RESOLVED';

  let canReopen = false;
  if (isResolved && isOwner) {
    const resolvedTime = complaint.metrics?.resolvedAt || complaint.resolutionProof?.resolvedAt;
    if (resolvedTime) {
      const daysDiff = (new Date().getTime() - new Date(resolvedTime).getTime()) / (1000 * 3600 * 24);
      canReopen = daysDiff <= 7;
    } else {
      canReopen = true;
    }
  }

  const handleReopen = async () => {
    if (!window.confirm('Are you sure you want to reopen this complaint?')) return;
    setIsReopening(true);
    setReopenError(null);
    try {
      await complaintApi.reopenComplaint(complaint.id || complaint._id || '');
      refreshComplaints();
    } catch (err: any) {
      setReopenError(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/my-complaints">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                {displayCode}
              </span>
              <Badge variant={displayStage}>{displayStage.replace('_', ' ')}</Badge>
              {complaint.sla?.isBreached && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" /> SLA BREACHED
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">{complaint.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canReopen && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isReopening}
              onClick={handleReopen}
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reopen Issue
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {reopenError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
          {reopenError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full bg-zinc-100 relative">
              {activeMediaUrl ? (
                <img
                  src={getFullImageUrl(activeMediaUrl)}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image Uploaded</div>
              )}
            </div>

            {mediaList.length > 1 && (
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3 overflow-x-auto">
                {mediaList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      'w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all',
                      activeImageIndex === idx ? 'border-[#F27D26] ring-2 ring-[#F27D26]/20' : 'border-zinc-200 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={getFullImageUrl(item.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Description</h3>
                <p className="text-zinc-600 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-semibold text-zinc-900">{complaint.category}</p>
                  {complaint.subCategory && (
                    <p className="text-xs text-zinc-500">({complaint.subCategory})</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Severity / Priority</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {complaint.severity && <Badge variant={complaint.severity}>{complaint.severity}</Badge>}
                    <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold text-zinc-900">{displayDepartment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tracking Code</p>
                  <p className="text-sm font-mono font-bold text-[#F27D26]">{displayCode}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Location Details</h3>
            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <MapPin className="w-5 h-5 text-[#F27D26]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  {typeof complaint.location === 'string' ? complaint.location : complaint.location?.address || 'Address provided'}
                </p>
                {complaint.landmark && (
                  <p className="text-xs text-zinc-500 mt-0.5">Landmark: {complaint.landmark}</p>
                )}
                <Button variant="outline" size="sm" className="mt-3 bg-white">View on Map</Button>
              </div>
            </div>
          </Card>

          {complaint.assignmentHistory && complaint.assignmentHistory.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 text-zinc-900 font-bold text-lg">
                <History className="w-5 h-5 text-[#F27D26]" />
                Assignment History
              </div>
              <div className="space-y-3">
                {complaint.assignmentHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-800">
                        Department: {item.department || 'Unassigned'}
                      </p>
                      {item.note && <p className="text-zinc-500 italic mt-0.5">{item.note}</p>}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(item.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isResolved && isOwner && (
            <FeedbackForm
              complaintId={complaint.id || complaint._id || ''}
              existingFeedback={complaint.citizenFeedback}
              onFeedbackSubmitted={refreshComplaints}
            />
          )}

          {isStaffOrAdmin && (
            <InternalNotes
              complaintId={complaint.id || complaint._id || ''}
              notes={complaint.internalNotes}
              onNoteAdded={refreshComplaints}
            />
          )}
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Complaint Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100">
              {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                complaint.statusHistory.map((event, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={cn(
                      'absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10',
                      i === 0 ? 'bg-[#F27D26]' : 'bg-zinc-200'
                    )}>
                      {i === 0 ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-900">{(event.stage || event.status || 'SUBMITTED').replace('_', ' ')}</p>
                        <p className="text-[10px] font-medium text-zinc-400">{new Date(event.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {event.message && <p className="text-xs text-zinc-500 leading-relaxed">{event.message}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-8 relative">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 bg-[#F27D26]">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-900">Submitted</p>
                    <p className="text-[10px] font-medium text-zinc-400">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
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
            <Button className="w-full bg-white text-[#F27D26] hover:bg-zinc-50">Start Chat</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
