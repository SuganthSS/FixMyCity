import api from './api';

export interface MessageData {
  _id: string;
  sender: { _id: string; name: string; email: string; role: string };
  senderRole: string;
  recipientType: string;
  recipient?: { _id: string; name: string; email: string } | null;
  complaintRef?: string | null;
  content: string;
  isRead: boolean;
  isReadBy: string[];
  thread?: string | null;
  targetAudience?: string | null;
  createdAt: string;
}

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/messages/unread-count');
  return response.data.count;
};

export const getInbox = async (): Promise<MessageData[]> => {
  const response = await api.get('/messages/inbox');
  return response.data;
};

export const getSentMessages = async (): Promise<MessageData[]> => {
  const response = await api.get('/messages/sent');
  return response.data;
};

export const sendMessage = async (payload: {
  recipientType: string;
  recipient?: string;
  complaintRef?: string;
  content: string;
  thread?: string;
  targetAudience?: string;
}): Promise<MessageData> => {
  const response = await api.post('/messages', payload);
  return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/messages/${id}/read`);
};

export const getThread = async (threadId: string): Promise<MessageData[]> => {
  const response = await api.get(`/messages/thread/${threadId}`);
  return response.data;
};
