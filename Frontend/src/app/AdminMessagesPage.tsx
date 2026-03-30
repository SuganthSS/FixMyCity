import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Send, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Inbox as InboxIcon } from 'lucide-react';
import { Button } from '../components/UI';
import { 
  getInbox, 
  getSentMessages, 
  sendMessage, 
  markAsRead, 
  MessageData 
} from '../services/messagesApi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function AdminMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'hod' | 'inbox'>('broadcast');
  
  // Broadcast State
  const [sentBroadcasts, setSentBroadcasts] = useState<MessageData[]>([]);
  const [broadcastContent, setBroadcastContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'citizens' | 'staff' | 'hod' | 'all'>('all');

  // Message HOD State
  const [hodSearchQuery, setHodSearchQuery] = useState('');
  const [hodSelectedComplaint, setHodSelectedComplaint] = useState<any | null>(null);
  const [hodSearchError, setHodSearchError] = useState<string | null>(null);
  const [isSearchingHodComplaint, setIsSearchingHodComplaint] = useState(false);
  const [hodUser, setHodUser] = useState<any | null>(null);
  const [hodLookupError, setHodLookupError] = useState<string | null>(null);
  const [hodContent, setHodContent] = useState('');
  const [hodSendSuccess, setHodSendSuccess] = useState<string | null>(null);

  // Inbox State
  const [inboxThreads, setInboxThreads] = useState<Record<string, MessageData[]>>({});
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      if (activeTab === 'broadcast') {
        const sent = await getSentMessages();
        setSentBroadcasts(sent.filter(m => m.recipientType === 'broadcast'));
      } else if (activeTab === 'inbox') {
        const [inbox, sent] = await Promise.all([getInbox(), getSentMessages()]);
        
        // Group messages by thread - a thread root is either msg.thread or msg._id
        const threads: Record<string, MessageData[]> = {};
        
        // Combine all messages relevant to the inbox context
        // Received messages (inbox) + Sent messages that are part of a conversation
        const allRelevant = [...inbox, ...sent].filter(m => m.recipientType !== 'broadcast');
        
        allRelevant.forEach(m => {
          const threadId = m.thread || m._id;
          if (!threads[threadId]) threads[threadId] = [];
          threads[threadId].push(m);
        });

        // Sort messages within each thread by date
        Object.keys(threads).forEach(id => {
          threads[id].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });

        setInboxThreads(threads);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  // ─── Broadcast Handlers ───

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;
    setIsSending(true);
    try {
      await sendMessage({
        recipientType: 'broadcast',
        content: broadcastContent,
        targetAudience,
      });
      setBroadcastContent('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send broadcast', error);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Message HOD Handlers ───

  const handleSearchHodComplaint = async () => {
    if (!hodSearchQuery.trim()) return;
    setIsSearchingHodComplaint(true);
    setHodSearchError(null);
    setHodSelectedComplaint(null);
    setHodUser(null);
    setHodLookupError(null);
    setHodSendSuccess(null);

    try {
      const res = await api.get('/complaints', { params: { complaintCode: hodSearchQuery.trim() } });
      if (res.data && res.data.length > 0) {
        const complaint = res.data[0];
        setHodSelectedComplaint(complaint);
        await findHodForDepartment(complaint.category);
      } else {
        setHodSearchError('Complaint not found. Please check the code.');
      }
    } catch (error) {
      console.error('Search failed', error);
      setHodSearchError('Complaint not found. Please check the code.');
    } finally {
      setIsSearchingHodComplaint(false);
    }
  };

  const findHodForDepartment = async (department: string) => {
    try {
      const res = await api.get('/messages/find-hod', { params: { department } });
      setHodUser(res.data);
      setHodLookupError(null);
    } catch (error: any) {
      console.error('HOD lookup failed', error);
      setHodUser(null);
      setHodLookupError(error.response?.data?.message || 'No HOD found for this department.');
    }
  };

  const handleSendToHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hodContent.trim() || !hodUser || !hodSelectedComplaint) return;
    setIsSending(true);
    setHodSendSuccess(null);
    try {
      await sendMessage({
        recipientType: 'hod',
        recipient: hodUser._id,
        complaintRef: hodSelectedComplaint._id,
        content: hodContent,
      });
      setHodContent('');
      setHodSendSuccess('Message sent to HOD successfully');
      setTimeout(() => setHodSendSuccess(null), 3000);
      setHodSelectedComplaint(null);
      setHodUser(null);
      setHodSearchQuery('');
    } catch (error) {
      console.error('Failed to send to HOD', error);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Inbox Handlers ───

  const handleToggleInboxMsg = async (threadId: string, messages: MessageData[]) => {
    const isExpanding = expandedMsg !== threadId;
    if (isExpanding) {
      setExpandedMsg(threadId);
      // Mark all unread messages in thread as read
      const unread = messages.filter(m => !m.isRead && m.recipientType === 'admin');
      for (const msg of unread) {
        try {
          await markAsRead(msg._id);
          // Update local state is done collectively if needed or just left as is for now
        } catch (error) {
          console.error('Failed to mark as read', error);
        }
      }
      if (unread.length > 0) {
        // Refresh to get read status if needed, but for simplicity we'll just show as read
        setInboxThreads(prev => {
          const next = { ...prev };
          next[threadId] = next[threadId].map(m => (!m.isRead && m.recipientType === 'admin') ? { ...m, isRead: true } : m);
          return next;
        });
      }
    } else {
      setExpandedMsg(null);
    }
  };

  const handleSendReply = async (threadId: string, lastMsg: MessageData) => {
    const content = replyContent[threadId];
    if (!content?.trim()) return;
    
    setIsSending(true);
    try {
      await sendMessage({
        recipientType: lastMsg.senderRole === 'admin' ? lastMsg.recipientType : lastMsg.senderRole,
        recipient: lastMsg.senderRole === 'admin' ? lastMsg.recipient?._id : lastMsg.sender._id,
        thread: threadId,
        complaintRef: lastMsg.complaintRef as string,
        content,
      });
      setReplyContent(prev => ({ ...prev, [threadId]: '' }));
      await loadMessages();
    } catch (error) {
      console.error('Failed to send reply', error);
    } finally {
      setIsSending(false);
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

  const audienceOptions: { value: 'citizens' | 'staff' | 'hod' | 'all', label: string }[] = [
    { value: 'citizens', label: 'Citizens Only' },
    { value: 'staff', label: 'Staff Only' },
    { value: 'hod', label: 'HODs Only' },
    { value: 'all', label: 'Everyone' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">Messages</h1>
        <p className="text-gray-500 mt-2">Manage communications across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'broadcast' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Announcements
          {activeTab === 'broadcast' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('hod')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'hod' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Message HOD
          {activeTab === 'hod' && (
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
      {activeTab === 'broadcast' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#000000] mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-gray-400" />
              New Broadcast Message
            </h2>

            {/* Target Audience Selector */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Target Audience</label>
              <div className="flex gap-2 flex-wrap">
                {audienceOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTargetAudience(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      targetAudience === opt.value
                        ? 'bg-[#000000] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <textarea
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all"
                required
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSending || !broadcastContent.trim()}
                  className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg"
                >
                  {isSending ? 'Sending...' : `Send to ${audienceOptions.find(o => o.value === targetAudience)?.label}`}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Past Broadcasts</h3>
            <div className="space-y-4">
              {sentBroadcasts.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No broadcasts sent yet.</p>
                </div>
              ) : (
                sentBroadcasts.map((msg) => (
                  <div key={msg._id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 transition-all hover:shadow-md">
                    <p className="text-[#000000] font-medium leading-relaxed">{msg.content}</p>
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>{format(new Date(msg.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 capitalize">
                          {(msg as any).targetAudience || 'all'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Read by {msg.isReadBy.length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Message HOD Tab ─── */}
      {activeTab === 'hod' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#000000] mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Message HOD by Complaint
            </h2>

            {/* Step 1: Search Complaint */}
            {!hodSelectedComplaint ? (
              <div className="space-y-4 max-w-xl">
                <label className="block text-sm font-bold text-gray-700">Search Complaint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hodSearchQuery}
                    onChange={(e) => setHodSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchHodComplaint()}
                    placeholder="e.g. CMP-1042"
                    className="flex-1 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm"
                  />
                  <Button
                    onClick={handleSearchHodComplaint}
                    disabled={isSearchingHodComplaint || !hodSearchQuery.trim()}
                    className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                  >
                    {isSearchingHodComplaint ? '...' : 'Search'}
                  </Button>
                </div>
                {hodSearchError && (
                  <p className="text-red-500 text-sm mt-2">{hodSearchError}</p>
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
                          {hodSelectedComplaint.complaintCode}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {hodSelectedComplaint.category || 'No Department'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                          {hodSelectedComplaint.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#000000] mt-1">{hodSelectedComplaint.title}</h4>
                    </div>
                    <button 
                      onClick={() => { setHodSelectedComplaint(null); setHodUser(null); setHodSearchError(null); setHodLookupError(null); }}
                      className="text-gray-400 hover:text-rose-500 transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>

                {/* HOD Info */}
                {hodLookupError ? (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-4 rounded-xl font-medium">
                    {hodLookupError}
                  </div>
                ) : hodUser ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">HOD Identified</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {hodUser.name?.charAt(0) || 'H'}
                      </div>
                      <div>
                        <p className="font-bold text-[#000000]">{hodUser.name}</p>
                        <p className="text-xs text-gray-500">{hodUser.department} Department</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Message Form */}
                {hodUser && (
                  <form onSubmit={handleSendToHod} className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message to {hodUser.name}</label>
                      <textarea
                        value={hodContent}
                        onChange={(e) => setHodContent(e.target.value)}
                        placeholder="Provide instructions, request updates, assign priorities..."
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {hodSendSuccess && (
                          <span className="text-green-600 text-sm font-medium animate-in fade-in flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {hodSendSuccess}
                          </span>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSending || !hodContent.trim()}
                        className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-8"
                      >
                        {isSending ? 'Sending...' : 'Send to HOD'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Inbox Tab ─── */}
      {activeTab === 'inbox' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.keys(inboxThreads).length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <InboxIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No messages from HODs yet.</p>
            </div>
          ) : (
            (Object.entries(inboxThreads) as [string, MessageData[]][])
              .sort(([, a], [, b]) => new Date(b[b.length - 1].createdAt).getTime() - new Date(a[a.length - 1].createdAt).getTime())
              .map(([threadId, messages]) => {
                const lastMsg = messages[messages.length - 1];
                const isUnread = messages.some(m => !m.isRead && m.recipientType === 'admin');
                const isExpanded = expandedMsg === threadId;

                return (
                  <div 
                    key={threadId} 
                    className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${isUnread ? 'border-l-4 border-l-[#000000]' : ''}`}
                  >
                    <div 
                      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleToggleInboxMsg(threadId, messages)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {(lastMsg.senderRole === 'admin' ? lastMsg.recipient?.name : lastMsg.sender?.name)?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-[#000000]">
                              {lastMsg.senderRole === 'admin' ? `To: ${lastMsg.recipient?.name}` : lastMsg.sender?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getRoleBadge(lastMsg.senderRole === 'admin' ? lastMsg.recipientType : lastMsg.senderRole)}
                              {lastMsg.complaintRef && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                  Complaint Linked
                                </span>
                              )}
                              <span className="text-[10px] font-bold uppercase text-gray-400">
                                {messages.length} message{messages.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-gray-400">
                            {format(new Date(lastMsg.createdAt), 'MMM dd, h:mm a')}
                          </span>
                          {isUnread && (
                            <span className="bg-[#000000] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!isExpanded && (
                        <div className="mt-3 pl-14">
                          <p className={`text-gray-700 ${isUnread ? 'font-medium' : ''} truncate leading-relaxed`}>
                            {lastMsg.content}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100 p-5 pl-14 space-y-6 animate-in slide-in-from-top-2 duration-300">
                        {messages.map((m, idx) => (
                          <div key={m._id} className={`flex flex-col ${m.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${
                              m.senderRole === 'admin' 
                                ? 'bg-[#000000] text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 px-1">
                              {idx === 0 && !m.thread ? 'Started ' : ''}
                              {format(new Date(m.createdAt), 'MMM dd, h:mm a')}
                              {m.senderRole === 'admin' ? ' • Sent' : ` • ${m.sender.name}`}
                            </span>
                          </div>
                        ))}
                        
                        {/* Reply Form */}
                        <div className="pt-6 border-t border-gray-200">
                          <textarea
                            value={replyContent[threadId] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [threadId]: e.target.value }))}
                            placeholder={`Type your reply...`}
                            className="w-full h-24 p-4 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
                          />
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => handleSendReply(threadId, lastMsg)}
                              disabled={isSending || !(replyContent[threadId] || '').trim()}
                              className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                              size="sm"
                            >
                              {isSending ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
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
