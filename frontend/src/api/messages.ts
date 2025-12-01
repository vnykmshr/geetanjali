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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const messagesApi = {
  /**
   * Get all messages for a case (conversation thread)
   */
  async list(caseId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/api/v1/cases/${caseId}/messages`);
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new user message (follow-up question)
   */
  async create(caseId: string, data: MessageCreate): Promise<Message> {
    const response = await fetch(`${API_BASE}/api/v1/cases/${caseId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`);
    }

    return response.json();
  },
};
