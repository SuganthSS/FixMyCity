import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Bell, MessageSquare, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/UI';
import { 
  getInbox, 
  getSentMessages, 
  sendMessage, 
  markAsRead, 
  getThread, 
  MessageData 
} from '../services/messagesApi';
import { complaintApi } from '../services/complaintApi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../services/ticketsApi';

export function StaffMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'announcements' | 'tickets' | 'citizen' | 'hod'>('announcements');
  const [broadcasts, setBroadcasts] = useState<MessageData[]>([]);
  const [hodMessages, setHodMessages] = useState<MessageData[]>([]);
  
  // Citizen conversation state
  const [citizenConversations, setCitizenConversations] = useState<Record<string, { citizen: any, lastMsg: MessageData, unread: boolean, threadId: string }>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadMessages, setActiveThreadMessages] = useState<MessageData[]>([]);
  
  const [isSending, setIsSending] = useState(false);

  // Citizen Form State
  const [citizenContent, setCitizenContent] = useState('');
  const [citizenSearchQuery, setCitizenSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [isSearchingComplaints, setIsSearchingComplaints] = useState(false);
  
  // Inline replies
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [citizenSendError, setCitizenSendError] = useState<string | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // HOD Form State
  const [hodSearchQuery, setHodSearchQuery] = useState('');
  const [hodSelectedComplaint, setHodSelectedComplaint] = useState<any | null>(null);
  const [hodSearchError, setHodSearchError] = useState<string | null>(null);
  const [isSearchingHodComplaint, setIsSearchingHodComplaint] = useState(false);
  const [hodUser, setHodUser] = useState<any | null>(null);
  const [hodLookupError, setHodLookupError] = useState<string | null>(null);
  const [hodContent, setHodContent] = useState('');
  const [hodSendSuccess, setHodSendSuccess] = useState<string | null>(null);
  const [sentHodMessages, setSentHodMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    if (activeTab === 'tickets' && !activeTicket) {
      loadDepartmentTickets();
    }
  }, [activeTab, activeTicket]);

  const loadDepartmentTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const res = await ticketsApi.getDepartmentTickets();
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to load department tickets', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleAcceptTicket = async (ticketId: string) => {
    try {
      await ticketsApi.acceptTicket(ticketId);
      const ticket = tickets.find(t => t._id === ticketId);
      if (ticket) {
        setActiveTicket(ticket);
        await loadTicketConversation(ticketId);
      }
    } catch (error) {
      console.error('Failed to accept ticket', error);
    }
  };

  const loadTicketConversation = async (ticketId: string) => {
    try {
      const res = await ticketsApi.getTicketConversation(ticketId);
      setTicketMessages(res.data);
    } catch (error) {
      console.error('Failed to load ticket conversation', error);
    }
  };

  const handleSendTicketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketMessage.trim() || !activeTicket) return;
    setIsSending(true);
    try {
      await ticketsApi.sendTicketMessage(activeTicket._id, newTicketMessage);
      setNewTicketMessage('');
      await loadTicketConversation(activeTicket._id);
    } catch (error) {
      console.error('Failed to send ticket message', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      const [inbox, sent] = await Promise.all([getInbox(), getSentMessages()]);

      // Citizen conversations
      const citizenMsgs = [
        ...sent.filter(m => m.recipientType === 'citizen'),
        ...inbox.filter(m => m.senderRole === 'citizen')
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const conversations: Record<string, any> = {};
      for (const msg of citizenMsgs) {
        const citizenId = msg.senderRole === 'citizen' ? msg.sender?._id : msg.recipient?._id;
        const citizenData = msg.senderRole === 'citizen' ? msg.sender : msg.recipient;
        if (!citizenId) continue;

        if (!conversations[citizenId]) {
          conversations[citizenId] = {
            citizen: citizenData,
            lastMsg: msg,
            unread: msg.senderRole === 'citizen' && !msg.isRead,
            threadId: msg.thread || msg._id
          };
        } else {
          if (msg.senderRole === 'citizen' && !msg.isRead) {
            conversations[citizenId].unread = true;
          }
        }
      }
      setCitizenConversations(conversations);

      // Sent HOD messages
      const toHod = sent.filter(m => m.recipientType === 'hod');
      setSentHodMessages(toHod);

      // Extract broadcasts for the dedicated tab
      const bcs = inbox.filter(m => m.recipientType === 'broadcast')
                       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBroadcasts(bcs);

      // Extract HOD messages
      const hMsgs = inbox.filter(m => m.senderRole === 'hod')
                         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHodMessages(hMsgs);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  // ─── Citizen Tab Handlers ───

  const handleSearchComplaints = async () => {
    if (!citizenSearchQuery.trim()) return;
    setIsSearchingComplaints(true);
    try {
      const data = await complaintApi.getComplaints(citizenSearchQuery);
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearchingComplaints(false);
    }
  };

  const handleSendCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenContent.trim() || !selectedComplaint) return;
    
    setCitizenSendError(null);
    setIsSending(true);
    try {
      const citizenId = selectedComplaint.citizenId?._id || selectedComplaint.citizenId;
      if (!citizenId) throw new Error("Could not identify citizen from complaint.");

      await sendMessage({
        recipientType: 'citizen',
        recipient: citizenId,
        complaintRef: selectedComplaint._id,
        content: citizenContent,
      });
      setCitizenContent('');
      setSelectedComplaint(null);
      setCitizenSearchQuery('');
      setSearchResults([]);
      await loadMessages();
    } catch (error: any) {
      console.error('Failed to send to citizen', error);
      setCitizenSendError(error.response?.data?.message || error.message || 'Failed to deliver message to citizen.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleReplyCitizen = async (threadId: string, citizenId: string) => {
    const content = replyContent[threadId];
    if (!content?.trim()) return;
    
    setIsSending(true);
    try {
      await sendMessage({
        recipientType: 'citizen',
        recipient: citizenId,
        thread: threadId,
        content
      });
      setReplyContent(prev => ({ ...prev, [threadId]: '' }));
      
      const thread = await getThread(threadId);
      setActiveThreadMessages(thread);
      await loadMessages();
    } catch (error) {
      console.error('Failed to reply to citizen thread', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenConversation = async (citizenId: string, threadId: string) => {
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      return;
    }
    setActiveThreadId(threadId);
    try {
      const thread = await getThread(threadId);
      setActiveThreadMessages(thread);
      
      const unreadMsgs = thread.filter(m => !m.isRead && m.senderRole === 'citizen');
      if (unreadMsgs.length > 0) {
        await Promise.all(unreadMsgs.map(m => markAsRead(m._id)));
        setCitizenConversations(prev => ({
          ...prev,
          [citizenId]: { ...prev[citizenId], unread: false }
        }));
      }
    } catch (error) {
      console.error('Failed to load thread', error);
    }
  };

  const handleReadMessage = async (msg: MessageData) => {
    if (!user?._id) return;
    const isBroadcast = msg.recipientType === 'broadcast';
    
    if (isBroadcast) {
      if (!(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString())) {
        try {
          await markAsRead(msg._id);
          setBroadcasts(prev => prev.map(m => m._id === msg._id ? { ...m, isReadBy: [...(m.isReadBy || []), user!._id] } : m));
        } catch (error) {
          console.error('Failed to mark broadcast read', error);
        }
      }
    } else {
      if (!msg.isRead) {
        try {
          await markAsRead(msg._id);
          setHodMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
        } catch (error) {
          console.error('Failed to mark message read', error);
        }
      }
    }
  };

  const safeFormat = (dateStr: any, formatStr: string) => {
    try {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch (error) {
      return 'N/A';
    }
  };

  // ─── HOD Tab Handlers ───

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
        // Auto-find the HOD for this complaint's department
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
      await loadMessages();
    } catch (error) {
      console.error('Failed to send to HOD', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">Messages</h1>
        <p className="text-gray-500 mt-2">Manage tickets, communicate with citizens and escalate to your HOD.</p>
      </div>

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
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'tickets' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Tickets
          {activeTab === 'tickets' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('citizen')}
          className={`pb-4 font-bold text-sm transition-colors relative ${
            activeTab === 'citizen' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Message Citizen
          {activeTab === 'citizen' && (
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
      </div>

      {/* ─── Announcements Tab ─── */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {broadcasts.length === 0 && hodMessages.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No announcements or messages yet.</p>
            </div>
          ) : (
            [...broadcasts, ...hodMessages]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((msg) => {
                const isBroadcast = msg.recipientType === 'broadcast';
                const isUnread = isBroadcast
                  ? user?._id && !(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString())
                  : !msg.isRead;

                return (
                  <div 
                    key={msg._id} 
                    onClick={() => handleReadMessage(msg)}
                    className={`bg-white border rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 ${isUnread ? 'border-l-4 border-l-[#000000] border-slate-200' : 'border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">
                          {safeFormat(msg.createdAt, 'MMM dd, yyyy h:mm a')}
                        </span>
                        {!isBroadcast && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-100">
                            Direct from HOD
                          </span>
                        )}
                        {isBroadcast && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-100">
                            Broadcast
                          </span>
                        )}
                      </div>
                      {isUnread && (
                        <span className="bg-[#000000] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <div>
                      {isBroadcast ? (
                        <p className={`text-gray-800 leading-relaxed ${isUnread ? 'font-medium' : ''}`}>
                          {msg.content}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-gray-500">From: {msg.sender?.name || 'HOD'}</p>
                          <p className={`text-gray-800 leading-relaxed ${isUnread ? 'font-medium' : ''}`}>
                            {msg.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ─── Tickets Tab ─── */}
      {activeTab === 'tickets' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!activeTicket ? (
            // View A: Ticket List
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#000000] mb-6 flex items-center gap-2">
                Open Department Tickets
              </h2>
              {isLoadingTickets ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No open tickets for your department</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket._id} 
                      onClick={() => {
                        if (ticket.status === 'OPEN') {
                          handleAcceptTicket(ticket._id);
                        } else {
                          setActiveTicket(ticket);
                          loadTicketConversation(ticket._id);
                        }
                      }}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-mono">
                            {ticket.ticketCode}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-mono">
                            {ticket.complaintId?.complaintCode || ticket.complaintId?._id}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#000000] mb-1">{ticket.complaintId?.title || 'Unknown Title'}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {ticket.department} • Raised {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {ticket.status === 'OPEN' ? (
                        <Button 
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAcceptTicket(ticket._id); }}
                          className="bg-[#000000] text-white rounded-lg hover:bg-gray-800 shrink-0"
                        >
                          Accept & Start Conversation
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setActiveTicket(ticket);
                            loadTicketConversation(ticket._id);
                          }}
                          className={`${ticket.status === 'CLOSED' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-[#000000] text-white hover:bg-gray-800'} rounded-lg shrink-0 font-medium`}
                        >
                          Open Conversation
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // View B: Conversation View
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-mono">
                      {activeTicket.ticketCode}
                    </span>
                    {activeTicket.status === 'CLOSED' ? (
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded">CLOSED</span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded">In Progress</span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#000000]">{activeTicket.complaintId?.title || 'Unknown Title'}</h3>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => { setActiveTicket(null); loadDepartmentTickets(); }}
                  className="text-sm shrink-0 border-gray-300 hover:bg-gray-100 text-black font-medium"
                >
                  Back to Tickets
                </Button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {ticketMessages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm font-medium">
                    No messages in this ticket yet. Start the conversation!
                  </div>
                ) : (
                  ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === 'staff' ? 'items-end' : 'items-start'}`}>
                      {msg.senderRole !== 'staff' && (
                        <span className="text-xs text-gray-400 font-bold ml-1 mb-1">Citizen</span>
                      )}
                      <div className={`max-w-[75%] rounded-xl p-3 text-sm font-medium ${msg.senderRole === 'staff' ? 'bg-[#000000] text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">
                        {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
                {activeTicket.status === 'CLOSED' ? (
                  <div className="text-center p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-500 border border-gray-200">
                    This ticket has been closed.
                  </div>
                ) : (
                  <form onSubmit={handleSendTicketMessage} className="flex gap-2 items-end">
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="Type your message to the citizen..."
                      className="flex-1 max-h-32 min-h-[48px] p-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black resize-y font-medium text-gray-800"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isSending || !newTicketMessage.trim()}
                      className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg h-[48px] px-6"
                    >
                      Send
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Message Citizen Tab ─── */}
      {activeTab === 'citizen' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#000000] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Message Citizen
            </h2>
            <div className="space-y-4">
              {!selectedComplaint ? (
                <>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={citizenSearchQuery}
                      onChange={(e) => setCitizenSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchComplaints()}
                      placeholder="Search complaint by title..."
                      className="flex-1 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                    <Button 
                      onClick={handleSearchComplaints}
                      disabled={isSearchingComplaints || !citizenSearchQuery.trim()}
                      className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-6"
                    >
                      {isSearchingComplaints ? '...' : 'Search'}
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-2 overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map(c => (
                        <div 
                          key={c._id}
                          onClick={() => setSelectedComplaint(c)}
                          className="hover:bg-gray-50 cursor-pointer p-4 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-gray-900">{c.title}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Reported by: {c.citizenName || 'Citizen'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Complaint</p>
                      <h4 className="font-bold text-[#000000]">{selectedComplaint.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Reported by: {selectedComplaint.citizenName || 'Citizen'}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                        Status: {selectedComplaint.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedComplaint(null)}
                      className="text-gray-400 hover:text-rose-500 transition-colors text-xs font-bold flex items-center gap-1"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}

              {selectedComplaint && (
                <form onSubmit={handleSendCitizen} className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea
                      value={citizenContent}
                      onChange={(e) => setCitizenContent(e.target.value)}
                      placeholder="Request more details, confirm resolution..."
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black resize-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    {citizenSendError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-3 rounded-lg font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        {citizenSendError}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isSending || !citizenContent.trim()}
                        className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg px-8"
                      >
                        {isSending ? 'Sending...' : 'Send to Citizen'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Citizen Conversations</h3>
            <div className="space-y-4">
              {Object.keys(citizenConversations).length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No open citizen conversations found.</p>
                </div>
              ) : (
                Object.entries(citizenConversations).map(([citizenId, convo]: [string, any]) => (
                  <div 
                    key={citizenId} 
                    className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${convo.unread ? 'border-l-4 border-l-[#000000]' : ''}`}
                  >
                    <div 
                      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleOpenConversation(citizenId, convo.threadId)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {convo.citizen?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-[#000000]">{convo.citizen?.name}</p>
                            <p className="text-xs text-gray-500">Citizen</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                          {format(new Date(convo.lastMsg.createdAt), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      
                      <div className="mt-3 pl-14">
                        <p className={`text-gray-700 truncate ${convo.unread ? 'font-bold text-black' : ''}`}>
                          {convo.lastMsg.senderRole === 'staff' ? 'You: ' : ''}{convo.lastMsg.content}
                        </p>
                      </div>
                      
                      <div className="mt-3 flex justify-end text-gray-400">
                         {activeThreadId === convo.threadId ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                      </div>
                    </div>

                    {activeThreadId === convo.threadId && (
                      <div className="bg-slate-50 border-t border-slate-100 p-5 pl-14 animate-in slide-in-from-top-2 duration-300 pointer-events-auto">
                        <div className="space-y-4 mb-5 max-h-80 overflow-y-auto pr-2">
                          {activeThreadMessages.map(tMsg => (
                            <div key={tMsg._id} className={`flex flex-col ${tMsg.senderRole === 'staff' ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${tMsg.senderRole === 'staff' ? 'bg-[#000000] text-white' : 'bg-white border border-slate-200 text-gray-800'}`}>
                                {tMsg.content}
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">
                                {format(new Date(tMsg.createdAt), 'h:mm a')}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 items-end">
                           <textarea
                            value={replyContent[convo.threadId] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [convo.threadId]: e.target.value }))}
                            placeholder={`Reply to ${convo.citizen?.name}...`}
                            className="flex-1 max-h-32 min-h-12 p-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black resize-y"
                          />
                          <Button
                            onClick={() => handleReplyCitizen(convo.threadId, citizenId)}
                            disabled={isSending || !(replyContent[convo.threadId] || '').trim()}
                            className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg h-12 px-5"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
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
              <Send className="w-5 h-5 text-gray-400" />
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
                        placeholder="Escalate the issue, provide updates, ask for guidance..."
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

          {/* Sent HOD Message History */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sent to HOD</h3>
            <div className="space-y-4">
              {sentHodMessages.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No messages sent to HOD yet.</p>
                </div>
              ) : (
                sentHodMessages.map((msg) => (
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
    </div>
  );
}
