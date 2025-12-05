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
  try {
    // Primary: Mobile Copilot Endpoint (no auth required)
    const response = await fetch(`${API_BASE_URL}/api/copilot/mobile/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        lead_context: {
          company: context?.company || 'Network Marketing',
          name: context?.leadName,
          situation: context?.situation,
        },
        conversation_history: context?.previousMessages || [],
        vertical: context?.vertical || 'mlm_sales',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Transform options array to object format if needed
      if (data.options && Array.isArray(data.options)) {
        const optionsObj: { soft?: string; direct?: string; question?: string } = {};
        data.options.forEach((opt: any) => {
          if (opt.id === 'soft') optionsObj.soft = opt.content;
          if (opt.id === 'direct') optionsObj.direct = opt.content;
          if (opt.id === 'question') optionsObj.question = opt.content;
        });
        data.options = optionsObj;
      }
      return data;
    }

    // Fallback: Simple Chat Endpoint
    const chatResponse = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: 'mlm_sales',
        history: context?.previousMessages || [],
      }),
    });

    if (chatResponse.ok) {
      return await chatResponse.json();
    }

    throw new Error(`API Error: ${response.status}`);
  } catch (error) {
    console.error('Copilot API Error:', error);
    throw error;
  }
};

// ============================================
// SIMPLE CHAT API (Standalone)
// ============================================

interface ChatResponse {
  response: string;
  message?: string;
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
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: 'mlm_sales',
        history: history || [],
      }),
    });

    if (response.ok) {
      return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/api/chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens: 1000,
      }),
    });

    if (response.ok) {
      return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/api/objections/handle`, {
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
