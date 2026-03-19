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
