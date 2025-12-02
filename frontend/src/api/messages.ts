import { api } from '../lib/api';

// Define types inline to avoid module caching issues
interface Message {
  id: string;
  case_id: string;
  role: 'user' | 'assistant';
  content: string;
  output_id?: string;
  created_at: string;
}

interface MessageCreate {
  content: string;
}

export const messagesApi = {
  /**
   * Get all messages for a case (conversation thread)
   */
  async list(caseId: string): Promise<Message[]> {
    const response = await api.get(`/cases/${caseId}/messages`);
    return response.data;
  },

  /**
   * Create a new user message (follow-up question)
   */
  async create(caseId: string, data: MessageCreate): Promise<Message> {
    const response = await api.post(`/cases/${caseId}/messages`, data);
    return response.data;
  },
};
