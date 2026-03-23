import { paymentApi } from '@/services/paymentService';

export const voteApi = {
  create: (payload: any) => paymentApi.post('/votes', payload),
  list: () => paymentApi.get('/votes'),
};
