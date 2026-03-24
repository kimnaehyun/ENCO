import { paymentApi } from '@/services/paymentService';

export const voteApi = {
  create: (payload: any) =>
    paymentApi.post('/votes', payload, {
      headers: {
        'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    }),
  list: () => paymentApi.get('/votes'),
};
