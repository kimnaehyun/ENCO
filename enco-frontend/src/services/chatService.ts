import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';

export const chatService = axios.create({
  baseURL: 'https://api.ssafywte.site/chat-service/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatService.interceptors.request.use(
  async config => {
    const token = await getCachedAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ── 햄코 PICK 챗봇 질문 (POST /api/v1/chatbot/ask) ──
export type AskChatbotRequest = {
  roomId: string;
  senderId: number;
  message: string;
};

export type AskChatbotResponse = {
  message: string;
  result?: unknown;
};

export async function askChatbot(
  payload: AskChatbotRequest,
): Promise<AskChatbotResponse> {
  const response = await chatService.post<AskChatbotResponse>(
    'api/v1/chatbot/ask',
    payload,
  );
  return response.data;
}
