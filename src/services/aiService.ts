/**
 * AI Service - Serviço universal unificado de IA para o Real Life Track
 * 
 * Suporta 10 provedores de IA de forma transparente no lado do cliente:
 * Gemini, OpenAI, Claude, DeepSeek, Kimi, Qwen, Groq, OpenRouter.
 */

import { GoogleGenAI } from '@google/genai';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Configurações padrão por provedor
const PROVIDERS_CONFIG: Record<string, { url: string; model: string; headers?: Record<string, string> }> = {
  gemini: {
    url: '',
    model: 'gemini-1.5-flash',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  kimi: {
    url: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-turbo',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-2.0-flash-exp:free',
    headers: {
      'HTTP-Referer': 'https://reallifetrack.com',
      'X-Title': 'Real Life Track',
    }
  }
};

/**
 * Função principal para gerar conteúdo de IA baseado no provedor selecionado pelo usuário
 */
export async function generateAIContent(params: {
  prompt: string;
  systemInstruction?: string;
  isJson?: boolean;
  image?: { base64: string; mimeType: string };
  chatHistory?: AIChatMessage[];
}): Promise<string> {
  const provider = localStorage.getItem('rlt_ai_provider') || 'gemini';
  const apiKey = localStorage.getItem('rlt_gemini_api_key') || process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error('Chave de API de IA não configurada. Vá em Perfil > Configurações de IA para cadastrar.');
  }

  // 1. Caso do Google Gemini (usando o SDK oficial)
  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    let contents: any = params.prompt;
    if (params.image) {
      contents = {
        parts: [
          { text: params.prompt },
          { inlineData: { mimeType: params.image.mimeType, data: params.image.base64 } }
        ]
      };
    } else if (params.chatHistory) {
      contents = params.chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : 'user',
        parts: [{ text: msg.content }]
      }));
      // Adiciona o prompt atual no final se não estiver no histórico
      contents.push({ role: 'user', parts: [{ text: params.prompt }] });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: params.systemInstruction,
        responseMimeType: params.isJson ? 'application/json' : undefined,
      }
    });

    return response.text || '';
  }

  // 2. Caso de Provedores compatíveis com a API da OpenAI ou Anthropic (via HTTP fetch)
  const config = PROVIDERS_CONFIG[provider];
  if (!config) {
    throw new Error(`Provedor de IA desconhecido: ${provider}`);
  }

  // Anthropic Claude
  if (provider === 'claude') {
    const messages = (params.chatHistory || []).map(m => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content
    }));
    messages.push({ role: 'user', content: params.prompt });

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-html-user-aspect-ratio': 'true'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1024,
        system: params.systemInstruction,
        messages,
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude API Error (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  // Provedores padrão OpenAI-compatible (OpenAI, DeepSeek, Kimi, Qwen, Groq, OpenRouter)
  const messages: any[] = [];
  if (params.systemInstruction) {
    messages.push({ role: 'system', content: params.systemInstruction });
  }
  if (params.chatHistory) {
    params.chatHistory.forEach(m => {
      if (m.role !== 'system') {
        messages.push({ role: m.role, content: m.content });
      }
    });
  }
  messages.push({ role: 'user', content: params.prompt });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    ...(config.headers || {})
  };

  const body: any = {
    model: config.model,
    messages,
    temperature: 0.3,
  };

  if (params.isJson && provider !== 'openrouter') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `${provider.toUpperCase()} API Error (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
