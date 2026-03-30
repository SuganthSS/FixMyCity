import api from './api';

export const ticketsApi = {
  getMyTickets: async () => {
    return await api.get('/tickets/my');
  },
  raiseTicket: async (complaintId: string) => {
    return await api.post('/tickets', { complaintId });
  },
  getDepartmentTickets: async () => {
    return await api.get('/tickets/department');
  },
  acceptTicket: async (ticketId: string) => {
    return await api.patch(`/tickets/${ticketId}/accept`);
  },
  getTicketConversation: async (ticketId: string) => {
    return await api.get(`/tickets/conversation/${ticketId}`);
  },
  closeTicket: async (ticketId: string) => {
    return await api.patch(`/tickets/${ticketId}/close`);
  },
  sendTicketMessage: async (ticketId: string, content: string, recipientRole: string = 'citizen') => {
    return await api.post('/messages', { recipientType: recipientRole, content, thread: ticketId });
  }
};
