import { API_CONFIG } from '../constants/api';

const API_BASE_URL = API_CONFIG.BACKEND_URL;

// ============================================
// HEALTH CHECK
// ============================================

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Backend nicht erreichbar:', error);
    return false;
  }
};

// ============================================
// COPILOT / CHAT API
// ============================================

interface CopilotResponse {
  response?: string;
  message?: string;
  content?: string;
  answer?: string;
  reply?: string;
  suggestions?: string[];
  analysis?: {
    sentiment?: string;
    disg_type?: string;
    reasoning?: string;
  };
  options?: Array<{
    id: string;
    label: string;
    tone: string;
    content: string;
  }> | {
    soft?: string;
    direct?: string;
    question?: string;
  };
  error?: string;
}

interface CopilotContext {
  leadName?: string;
  company?: string;
  situation?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  vertical?: string;
}

export const generateCopilotResponse = async (
  message: string, 
  context?: CopilotContext
): Promise<CopilotResponse> => {
  // Versuche mehrere Endpoints in Reihenfolge
  const endpoints = [
    { url: '/api/chat/completion', format: 'completion' },
    { url: '/api/ai/chat', format: 'simple' },
    { url: '/api/intelligent-chat/message', format: 'intelligent' },
  ];

  for (const endpoint of endpoints) {
    try {
      let body: any;
      
      switch (endpoint.format) {
        case 'completion':
          body = {
            message: message,
            history: context?.previousMessages || [],
          };
          break;
        case 'simple':
          body = {
            message: message,
            context: context?.vertical || 'mlm_sales',
          };
          break;
        case 'intelligent':
          body = {
            message: message,
            lead_id: null,
            context: context?.situation || '',
          };
          break;
        default:
          body = { message };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize response format
        return {
          response: data.response || data.reply || data.message || data.content || data.answer || '',
          message: data.message || data.response,
          options: data.options,
          analysis: data.analysis,
        };
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint.url} failed:`, error);
      continue;
    }
  }

  // Alle Endpoints fehlgeschlagen
  throw new Error('Alle API Endpoints nicht erreichbar');
};

// ============================================
// SIMPLE CHAT API (Standalone)
// ============================================

interface ChatResponse {
  response: string;
  message?: string;
  reply?: string;
}

interface ChatMessage {
  role: string;
  content: string;
}

export const sendChatMessage = async (
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> => {
  try {
    // Versuche /api/chat/completion
    const response = await fetch(`${API_BASE_URL}/api/chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history || [],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        response: data.reply || data.response || data.message || '',
        message: data.message,
        reply: data.reply,
      };
    }

    // Fallback: /api/ai/chat
    const fallbackResponse = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: 'mlm_sales',
      }),
    });

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      return {
        response: data.response || data.reply || data.message || '',
        message: data.message,
      };
    }

    throw new Error(`Chat API Error: ${response.status}`);
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};

export const sendChatCompletion = async (
  messages: ChatMessage[],
  temperature: number = 0.7
): Promise<ChatResponse> => {
  try {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, -1);

    const response = await fetch(`${API_BASE_URL}/api/chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: lastMessage,
        history: history,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        response: data.reply || data.response || data.message || '',
        message: data.message,
        reply: data.reply,
      };
    }

    throw new Error(`Chat Completion API Error: ${response.status}`);
  } catch (error) {
    console.error('Chat Completion API Error:', error);
    throw error;
  }
};

// ============================================
// OBJECTION HANDLING API
// ============================================

interface ObjectionResponse {
  objection: string;
  responses: Array<{
    type: string;
    text: string;
    tone: string;
  }>;
}

export const getObjectionResponse = async (
  objection: string,
  context?: { company?: string; situation?: string }
): Promise<ObjectionResponse | null> => {
  try {
    // Versuche Knowledge API für Einwand-Antworten
    const response = await fetch(`${API_BASE_URL}/api/knowledge/objection-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        objection,
        ...context,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Objection API Error:', error);
    return null;
  }
};

// ============================================
// SCRIPTS API
// ============================================

interface Script {
  id: string;
  title: string;
  content: string;
  category: string;
  company: string;
  tone: string;
  tags: string[];
}

export const getScriptsFromAPI = async (
  category?: string,
  company?: string
): Promise<Script[]> => {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (company) params.append('company', company);

    const url = `${API_BASE_URL}/api/scripts${params.toString() ? `?${params}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.scripts || data || [];
    }
    return [];
  } catch (error) {
    console.error('Scripts API Error:', error);
    return [];
  }
};

// ============================================
// GENERIC API REQUEST
// ============================================

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// LEAD MANAGEMENT API
// ============================================

export const syncLeadToBackend = async (lead: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });
    return response.ok;
  } catch (error) {
    console.error('Lead Sync Error:', error);
    return false;
  }
};

// ============================================
// EXPORT DEFAULT CONFIG
// ============================================

export default {
  baseUrl: API_BASE_URL,
  testConnection: testBackendConnection,
  copilot: generateCopilotResponse,
  chat: sendChatMessage,
  chatCompletion: sendChatCompletion,
  objections: getObjectionResponse,
  scripts: getScriptsFromAPI,
};
