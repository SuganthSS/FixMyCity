import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Send, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { Button } from '../components/UI';
import {
  getInbox,
  getSentMessages,
  sendMessage,
  markAsRead,
  getThread,
  MessageData
} from '../services/messagesApi';
import api from '../services/api';
import { hodApi } from '../services/hodApi';
import { useAuth } from '../context/AuthContext';

export function HODMessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'announcements' | 'staff' | 'admin' | 'inbox'>('announcements');
  const [broadcasts, setBroadcasts] = useState<MessageData[]>([]);

  // Staff Tab State
  const [departmentStaff, setDepartmentStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [staffMessageContent, setStaffMessageContent] = useState('');
  const [staffMessageSuccess, setStaffMessageSuccess] = useState<string | null>(null);
  const [sentStaffMessages, setSentStaffMessages] = useState<MessageData[]>([]);
  const [staffComplaintSearchQuery, setStaffComplaintSearchQuery] = useState('');
  const [staffSelectedComplaint, setStaffSelectedComplaint] = useState<any | null>(null);
  const [isSearchingStaffComplaint, setIsSearchingStaffComplaint] = useState(false);
  const [staffComplaintSearchError, setStaffComplaintSearchError] = useState<string | null>(null);

  // Message Admin Tab State
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSelectedComplaint, setAdminSelectedComplaint] = useState<any | null>(null);
  const [adminSearchError, setAdminSearchError] = useState<string | null>(null);
  const [isSearchingAdminComplaint, setIsSearchingAdminComplaint] = useState(false);
  const [adminContent, setAdminContent] = useState('');
  const [adminSendSuccess, setAdminSendSuccess] = useState<string | null>(null);
  const [sentAdminMessages, setSentAdminMessages] = useState<MessageData[]>([]);

  // Inbox State
  const [inboxMessages, setInboxMessages] = useState<MessageData[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [threadMessages, setThreadMessages] = useState<Record<string, MessageData[]>>({});
  const [isLoadingThread, setIsLoadingThread] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadStaff();
    loadMessages();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await hodApi.getStaff();
      setDepartmentStaff(data);
    } catch (error) {
      console.error('Failed to load department staff', error);
    }
  };

  const loadMessages = async () => {
    try {
      const [inbox, sent] = await Promise.all([getInbox(), getSentMessages()]);

      // Inbox: all incoming messages (from staff, admin, broadcasts)
      setInboxMessages(inbox);

      // Extract broadcasts for the dedicated tab
      const bcs = inbox.filter(m => m.recipientType === 'broadcast')
                       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBroadcasts(bcs);

      // Sent admin messages
      const toAdmin = sent.filter(m => m.recipientType === 'admin');
      setSentAdminMessages(toAdmin);

      // Sent staff messages
      const toStaff = sent.filter(m => m.recipientType === 'staff');
      setSentStaffMessages(toStaff);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  // ─── Staff Tab Handlers ───

  const handleSearchStaffComplaint = async () => {
    if (!staffComplaintSearchQuery.trim()) return;
    setIsSearchingStaffComplaint(true);
    setStaffComplaintSearchError(null);
    setStaffSelectedComplaint(null);
    try {
      const complaints = await hodApi.getComplaints();
      const found = complaints.find((c: any) => 
        c.complaintCode.toLowerCase() === staffComplaintSearchQuery.trim().toLowerCase()
      );
      if (found) {
        setStaffSelectedComplaint(found);
        setStaffComplaintSearchError(null);
      } else {
        setStaffComplaintSearchError('Complaint not found in your department.');
      }
    } catch (error) {
      console.error('Failed to search staff complaint', error);
      setStaffComplaintSearchError('Error searching complaints.');
    } finally {
      setIsSearchingStaffComplaint(false);
    }
  };

  const handleSendToStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMessageContent.trim() || !selectedStaff) return;
    setIsSending(true);
    setStaffMessageSuccess(null);
    try {
      await sendMessage({
        recipientType: 'staff',
        recipient: selectedStaff._id,
        content: staffMessageContent,
        complaintRef: staffSelectedComplaint?._id,
      });
      setStaffMessageContent('');
      setStaffMessageSuccess('Message sent successfully');
      setTimeout(() => setStaffMessageSuccess(null), 3000);
      setSelectedStaff(null);
      setStaffSelectedComplaint(null);
      setStaffComplaintSearchQuery('');
      setStaffComplaintSearchError(null);
      await loadMessages();
    } catch (error) {
      console.error('Failed to send to staff', error);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Message Admin Handlers ───

  const handleSearchAdminComplaint = async () => {
    if (!adminSearchQuery.trim()) return;
    setIsSearchingAdminComplaint(true);
    setAdminSearchError(null);
    setAdminSelectedComplaint(null);
    setAdminSendSuccess(null);

    try {
      const res = await api.get('/complaints', { params: { complaintCode: adminSearchQuery.trim() } });
      if (res.data && res.data.length > 0) {
        const complaint = res.data[0];
        // Verify complaint belongs to HOD's department
        if (user?.department && complaint.category !== user.department) {
          setAdminSearchError(`This complaint belongs to ${complaint.category}, not your department (${user.department}).`);
          return;
        }
        setAdminSelectedComplaint(complaint);
      } else {
        setAdminSearchError('Complaint not found. Please check the code.');
      }
    } catch (error) {
      console.error('Search failed', error);
      setAdminSearchError('Complaint not found. Please check the code.');
    } finally {
      setIsSearchingAdminComplaint(false);
    }
  };

  const handleSendToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminContent.trim() || !adminSelectedComplaint) return;
    setIsSending(true);
    setAdminSendSuccess(null);
    try {
      await sendMessage({
        recipientType: 'admin',
        complaintRef: adminSelectedComplaint._id,
        content: adminContent,
      });
      setAdminContent('');
      setAdminSendSuccess('Message sent to Admin successfully');
      setTimeout(() => setAdminSendSuccess(null), 3000);
      setAdminSelectedComplaint(null);
      setAdminSearchQuery('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send to admin', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReply = async (msg: MessageData) => {
    const content = replyContent[msg._id];
    if (!content?.trim()) return;
    
    setIsSending(true);
    const threadId = msg.thread || msg._id;
    try {
      await sendMessage({
        recipientType: 'admin',
        recipient: msg.sender._id,
        thread: threadId,
        complaintRef: msg.complaintRef as string,
        content,
      });
      setReplyContent(prev => ({ ...prev, [msg._id]: '' }));
      
      // Refresh the thread history immediately
      const updatedThread = await getThread(threadId);
      setThreadMessages(prev => ({ ...prev, [threadId]: updatedThread }));
      
      await loadMessages();
    } catch (error) {
      console.error('Failed to send reply', error);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Inbox Handlers ───

  const handleReadBroadcast = async (msg: MessageData) => {
    if (!user?._id) return;
    if (!(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString())) {
      try {
        await markAsRead(msg._id);
        const updatedBcs = broadcasts.map(m => m._id === msg._id ? { ...m, isReadBy: [...(m.isReadBy || []), user!._id] } : m);
        setBroadcasts(updatedBcs);
        // Also update inbox state to keep sync
        setInboxMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isReadBy: [...(m.isReadBy || []), user!._id] } : m));
      } catch (error) {
        console.error('Failed to mark broadcast as read', error);
      }
    }
  };

  const handleToggleInboxMsg = async (msg: MessageData) => {
    const isExpanding = expandedMsg !== msg._id;
    const threadId = msg.thread || msg._id;

    if (isExpanding) {
      setExpandedMsg(msg._id);
      
      // Fetch thread messages if not a broadcast
      if (msg.recipientType !== 'broadcast') {
        setIsLoadingThread(msg._id);
        try {
          const threadData = await getThread(threadId);
          setThreadMessages(prev => ({ ...prev, [threadId]: threadData }));
        } catch (error) {
          console.error('Failed to fetch thread', error);
        } finally {
          setIsLoadingThread(null);
        }
      }

      if (!msg.isRead && msg.recipientType !== 'broadcast') {
        try {
          await markAsRead(msg._id);
          setInboxMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
        } catch (error) {
          console.error('Failed to mark as read', error);
        }
      } else if (msg.recipientType === 'broadcast') {
        const isUnread = user?._id && !(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString());
        if (isUnread) {
          try {
            await markAsRead(msg._id);
            setInboxMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isReadBy: [...(m.isReadBy || []), user!._id] } : m));
          } catch (error) {
            console.error('Failed to mark broadcast as read', error);
          }
        }
      }
    } else {
      setExpandedMsg(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string, className: string }> = {
      staff: { label: 'Staff', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      admin: { label: 'Admin', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
      citizen: { label: 'Citizen', className: 'bg-green-50 text-green-700 border border-green-200' },
      hod: { label: 'HOD', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    };
    const badge = badges[role] || { label: role, className: 'bg-gray-100 text-gray-600' };
    return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">HOD Messages</h1>
        <p className="text-gray-500 mt-2">Communicate with your department staff and escalate to administration.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'announcements' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Announcements
          {activeTab === 'announcements' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'staff' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Message Staff
          {activeTab === 'staff' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'admin' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Message Admin
          {activeTab === 'admin' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'inbox' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Inbox
          {activeTab === 'inbox' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
      </div>

      {/* ─── Announcements Tab ─── */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {broadcasts.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No announcements yet.</p>
            </div>
          ) : (
            broadcasts.map((msg) => {
              const isUnread = user?._id && !(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString());
              return (
                <div 
                  key={msg._id} 
                  onClick={() => handleReadBroadcast(msg)}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-gray-400">
                      {format(new Date(msg.createdAt), 'MMM dd, yyyy h:mm a')}
                    </span>
                    {isUnread && (
                      <span className="bg-[#000000] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className={`text-gray-800 leading-relaxed ${isUnread ? 'font-medium' : ''}`}>
                    {msg.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── Message Staff Tab ─── */}
      {activeTab === 'staff' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#000000] mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-gray-400" />
              Send Message to Staff
            </h2>

            {/* Staff Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Select Staff Member</h3>
              {departmentStaff.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm">No staff assigned to your department yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {departmentStaff.map(staff => (
                    <div
                      key={staff._id}
                      onClick={() => {
                        setSelectedStaff(staff);
                        setStaffComplaintSearchError(null); // Clear errors when changing staff
                      }}
                      className={`cursor-pointer transition-all ${
                        selectedStaff?._id === staff._id
                          ? 'bg-white border-2 border-black rounded-xl p-3'
                          : 'bg-white border border-gray-200 rounded-xl p-3 hover:border-black'
                      }`}
                    >
                      <p className="font-bold text-sm text-[#000000] mb-1">{staff.name}</p>
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {staff.department || staff.email}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Link Complaint (Optional) */}
            {selectedStaff && (
              <div className="mb-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Link a Complaint (Optional)</h3>
                {!staffSelectedComplaint ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={staffComplaintSearchQuery}
                        onChange={(e) => setStaffComplaintSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchStaffComplaint()}
                        placeholder="e.g. CMP-1042"
                        className="flex-1 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm"
                      />
                      <Button
                        onClick={handleSearchStaffComplaint}
                        disabled={isSearchingStaffComplaint || !staffComplaintSearchQuery.trim()}
                        className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                        type="button"
                      >
                        {isSearchingStaffComplaint ? '...' : 'Find'}
                      </Button>
                    </div>
                    {staffComplaintSearchError && (
                      <p className="text-red-500 text-sm mt-1">{staffComplaintSearchError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                            {staffSelectedComplaint.complaintCode}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                            {staffSelectedComplaint.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#000000] text-sm">{staffSelectedComplaint.title}</h4>
                      </div>
                      <button 
                        onClick={() => { setStaffSelectedComplaint(null); setStaffComplaintSearchQuery(''); setStaffComplaintSearchError(null); }}
                        className="text-gray-400 hover:text-rose-500 transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        ✕ Unlink
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message Form */}
            {selectedStaff && (
              <form onSubmit={handleSendToStaff} className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message to {selectedStaff.name}</label>
                  <textarea
                    value={staffMessageContent}
                    onChange={(e) => setStaffMessageContent(e.target.value)}
                    placeholder="Type your instructions or questions..."
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {staffMessageSuccess && (
                      <span className="text-green-600 text-sm font-medium animate-in fade-in flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {staffMessageSuccess}
                      </span>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSending || !staffMessageContent.trim()}
                    className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-8"
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Sent Staff History */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sent to Staff</h3>
            <div className="space-y-4">
              {sentStaffMessages.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No messages sent to staff yet.</p>
                </div>
              ) : (
                sentStaffMessages.map((msg) => (
                  <div key={msg._id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-400">
                          {format(new Date(msg.createdAt), 'MMM dd, yyyy h:mm a')}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                          To: {msg.recipient?.name || 'Staff Member'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[#000000] font-medium leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Message Admin Tab ─── */}
      {activeTab === 'admin' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#000000] mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-gray-400" />
              Escalate to Admin by Complaint
            </h2>

            {/* Step 1: Search Complaint */}
            {!adminSelectedComplaint ? (
              <div className="space-y-4 max-w-xl">
                <label className="block text-sm font-bold text-gray-700">Search Complaint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAdminComplaint()}
                    placeholder="e.g. CMP-1042"
                    className="flex-1 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm"
                  />
                  <Button
                    onClick={handleSearchAdminComplaint}
                    disabled={isSearchingAdminComplaint || !adminSearchQuery.trim()}
                    className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                  >
                    {isSearchingAdminComplaint ? '...' : 'Search'}
                  </Button>
                </div>
                {adminSearchError && (
                  <p className="text-red-500 text-sm mt-2">{adminSearchError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Complaint Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-mono">
                          {adminSelectedComplaint.complaintCode}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {adminSelectedComplaint.category || 'No Department'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                          {adminSelectedComplaint.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#000000] mt-1">{adminSelectedComplaint.title}</h4>
                    </div>
                    <button 
                      onClick={() => { setAdminSelectedComplaint(null); setAdminSearchError(null); }}
                      className="text-gray-400 hover:text-rose-500 transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>

                {/* Message Form */}
                <form onSubmit={handleSendToAdmin} className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message to Admin</label>
                    <textarea
                      value={adminContent}
                      onChange={(e) => setAdminContent(e.target.value)}
                      placeholder="Escalate the issue, provide department updates, request resources..."
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {adminSendSuccess && (
                        <span className="text-green-600 text-sm font-medium animate-in fade-in flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {adminSendSuccess}
                        </span>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSending || !adminContent.trim()}
                      className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-8"
                    >
                      {isSending ? 'Sending...' : 'Send to Admin'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sent Admin History */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sent to Admin</h3>
            <div className="space-y-4">
              {sentAdminMessages.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No messages sent to admin yet.</p>
                </div>
              ) : (
                sentAdminMessages.map((msg) => (
                  <div key={msg._id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-gray-400">
                        {format(new Date(msg.createdAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      {msg.complaintRef && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                          Linked
                        </span>
                      )}
                    </div>
                    <p className="text-[#000000] font-medium leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Inbox Tab ─── */}
      {activeTab === 'inbox' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {inboxMessages.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No messages yet.</p>
            </div>
          ) : (
            inboxMessages.map((msg) => {
              const isBroadcast = msg.recipientType === 'broadcast';
              const isUnread = isBroadcast
                ? user?._id && !(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString())
                : !msg.isRead;

              return (
                <div 
                  key={msg._id} 
                  className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${isUnread ? 'border-l-4 border-l-[#000000]' : ''}`}
                >
                  <div 
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleToggleInboxMsg(msg)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                          {isBroadcast ? '📢' : (msg.sender?.name?.charAt(0) || '?')}
                        </div>
                        <div>
                          <p className="font-bold text-[#000000]">
                            {isBroadcast ? 'Broadcast Announcement' : msg.sender?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {!isBroadcast && getRoleBadge(msg.senderRole)}
                            {msg.complaintRef && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                Complaint Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gray-400">
                          {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                        </span>
                        {isUnread && (
                          <span className="bg-[#000000] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 pl-14">
                      <p className={`text-gray-700 ${isUnread ? 'font-medium' : ''} ${expandedMsg === msg._id ? '' : 'truncate'} leading-relaxed`}>
                        {msg.content}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-end text-gray-400">
                      {expandedMsg === msg._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {expandedMsg === msg._id && (
                    <div className="bg-gray-50 border-t border-gray-100 p-5 pl-14 animate-in slide-in-from-top-2 duration-300">
                      {/* Thread Messages */}
                      {!isBroadcast && (
                        <div className="mb-8 space-y-6">
                          {isLoadingThread === msg._id ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-pulse text-gray-400 text-sm font-medium">Loading conversation...</div>
                            </div>
                          ) : (threadMessages[msg.thread || msg._id] || [msg]).map((m, idx) => (
                            <div key={m._id} className="flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-xs text-gray-700">{m.sender?.name}</span>
                                {getRoleBadge(m.senderRole)}
                                <span className="text-[10px] font-bold text-gray-400">
                                  {format(new Date(m.createdAt), 'MMM dd, h:mm a')}
                                </span>
                              </div>
                              <div className={`max-w-[90%] rounded-2xl p-4 ${
                                m.senderRole === 'hod' 
                                  ? 'bg-[#000000] text-white rounded-tr-none self-end' 
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Single message fallback for broadcasts */}
                      {isBroadcast && (
                        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap mb-5">
                          {msg.content}
                        </p>
                      )}

                      {/* Reply Form - Only for non-broadcast messages from admin */}
                      {!isBroadcast && (
                        <div className="pt-6 border-t border-gray-200">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Reply to Admin</p>
                          <textarea
                            value={replyContent[msg._id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [msg._id]: e.target.value }))}
                            placeholder="Type your response to admin..."
                            className="w-full h-24 p-4 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all"
                          />
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => handleSendReply(msg)}
                              disabled={isSending || !(replyContent[msg._id] || '').trim()}
                              className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                              size="sm"
                            >
                              {isSending ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
