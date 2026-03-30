import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Bell, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/UI';
import { 
  getInbox, 
  sendMessage, 
  markAsRead, 
  getThread, 
  MessageData 
} from '../services/messagesApi';
import { complaintApi } from '../services/complaintApi';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../services/ticketsApi';

export function CitizenMessagesPage() {
  const { user } = useAuth();
  
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

  const [activeTab, setActiveTab] = useState<'announcements' | 'tickets'>('announcements');
  const [broadcasts, setBroadcasts] = useState<MessageData[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newTicketReply, setNewTicketReply] = useState('');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  useEffect(() => {
    if (activeTab === 'tickets' && !activeTicket) {
      loadMyTickets();
    }
  }, [activeTab, activeTicket]);

  const loadMyTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const res = await ticketsApi.getMyTickets();
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to load my tickets', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleOpenTicketConversation = async (ticketId: string) => {
    try {
      const ticket = tickets.find(t => t._id === ticketId);
      if (ticket) {
        setActiveTicket(ticket);
        const res = await ticketsApi.getTicketConversation(ticketId);
        setTicketMessages(res.data);
      }
    } catch (error) {
      console.error('Failed to open ticket conversation', error);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    try {
      await ticketsApi.closeTicket(activeTicket._id);
      setActiveTicket((prev: any) => prev ? { ...prev, status: 'CLOSED' } : prev);
      await loadMyTickets();
    } catch (error) {
      console.error('Failed to close ticket', error);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketReply.trim() || !activeTicket) return;
    setIsSending(true);
    try {
      await ticketsApi.sendTicketMessage(activeTicket._id, newTicketReply, 'staff');
      setNewTicketReply('');
      const res = await ticketsApi.getTicketConversation(activeTicket._id);
      setTicketMessages(res.data);
    } catch (error) {
      console.error('Failed to send ticket reply', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'announcements') {
      loadMessages();
    }
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      const inbox = await getInbox();
      if (!Array.isArray(inbox)) return;
      
      const broadcastMsgs = inbox.filter(m => m.recipientType === 'broadcast')
                                 .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBroadcasts(broadcastMsgs);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const handleReadBroadcast = async (msg: MessageData) => {
    if (!user?._id) return;
    if (!(msg.isReadBy || []).map(id => id.toString()).includes(user._id.toString())) {
      try {
        await markAsRead(msg._id);
        setBroadcasts(prev => prev.map(m => m._id === msg._id ? { ...m, isReadBy: [...(m.isReadBy || []), user._id] } : m));
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">Message Center</h1>
        <p className="text-gray-500 mt-2">View announcements and communicate with city staff regarding your tickets.</p>
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
          My Tickets
          {activeTab === 'tickets' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-t" />
          )}
        </button>
      </div>

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
                      {safeFormat(msg.createdAt, 'MMM dd, yyyy h:mm a')}
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

      {activeTab === 'tickets' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!activeTicket ? (
            // View A: Ticket List
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#000000] mb-6 flex items-center gap-2">
                My Filed Tickets
              </h2>
              {isLoadingTickets ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">You have not raised any tickets yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(
                    tickets.reduce((acc: any, ticket) => {
                      const compId = ticket.complaintId?._id || 'unknown';
                      if (!acc[compId]) acc[compId] = [];
                      acc[compId].push(ticket);
                      return acc;
                    }, {})
                  ).map(([compId, groupTickets]: [string, any]) => {
                    const firstTicket = groupTickets[0];
                    const compTitle = firstTicket.complaintId?.title || 'Unknown Title';
                    const compCode = firstTicket.complaintId?.complaintCode || firstTicket.complaintId?._id || 'Unknown Code';

                    return (
                      <div key={compId} className="bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="mb-4 pb-3 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-[#000000] break-words">{compTitle}</h3>
                          <div className="text-xs font-mono font-medium text-gray-500 mt-1 uppercase tracking-wider">Complaint ID: {compCode}</div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {groupTickets.map((ticket: any) => (
                            <div key={ticket._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <div className="flex gap-2 items-center mb-2">
                                  <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-mono font-bold">
                                    {ticket.ticketCode}
                                  </span>
                                  {ticket.status === 'OPEN' ? (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full">OPEN</span>
                                  ) : ticket.status === 'ACCEPTED' ? (
                                    <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full">ACCEPTED</span>
                                  ) : (
                                    <span className="bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full">CLOSED</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                  Raised {safeFormat(ticket.createdAt, 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center">
                                {ticket.status === 'ACCEPTED' ? (
                                  <Button 
                                    onClick={() => handleOpenTicketConversation(ticket._id)}
                                    className="bg-[#000000] text-white rounded-lg hover:bg-gray-800 text-sm px-4 py-2"
                                  >
                                    Open Conversation
                                  </Button>
                                ) : ticket.status === 'OPEN' ? (
                                  <span className="text-gray-400 font-medium text-sm">Awaiting Staff</span>
                                ) : (
                                  <span className="text-gray-400 font-medium text-sm">Closed</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded">
                        {activeTicket.status === 'OPEN' ? 'OPEN' : 'IN PROGRESS'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#000000]">{activeTicket.complaintId?.title || 'Unknown Title'}</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  {activeTicket.status !== 'CLOSED' && (
                    <Button 
                      variant="outline" 
                      onClick={handleCloseTicket}
                      className="text-sm border-rose-200 text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      Close Ticket
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => { setActiveTicket(null); loadMyTickets(); }}
                    className="text-sm border-gray-300 hover:bg-gray-100 text-black font-medium"
                  >
                    Back to My Tickets
                  </Button>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {ticketMessages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm font-medium">
                    No messages from staff yet.
                  </div>
                ) : (
                  ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === 'citizen' ? 'items-end' : 'items-start'}`}>
                      {msg.senderRole !== 'citizen' && (
                        <span className="text-xs text-gray-400 font-bold ml-1 mb-1">Support Staff</span>
                      )}
                      <div className={`max-w-[75%] rounded-xl p-3 text-sm font-medium ${msg.senderRole === 'citizen' ? 'bg-[#000000] text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">
                        {safeFormat(msg.createdAt, 'MMM dd, h:mm a')}
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
                  <form onSubmit={handleSendTicketReply} className="flex gap-2 items-end">
                    <textarea
                      value={newTicketReply}
                      onChange={(e) => setNewTicketReply(e.target.value)}
                      placeholder="Type your reply to staff..."
                      className="flex-1 max-h-32 min-h-[48px] p-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black resize-y font-medium text-gray-800"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isSending || !newTicketReply.trim()}
                      className="bg-[#000000] text-white hover:bg-gray-800 rounded-lg h-[48px] px-6"
                    >
                      Send Reply
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
