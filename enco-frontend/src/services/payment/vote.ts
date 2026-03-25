import { paymentApi } from '@/services/paymentService';

export const voteApi = {
  create: (payload: any) =>
    paymentApi.post('/votes', payload, {
      headers: {
        'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    }),
  list: (groupId: number) => paymentApi.get(`/votes/groups/${groupId}`),
  detail: (voteId: number, groupId: number) =>
    paymentApi.get(`/votes/${voteId}/groups/${groupId}`),
  vote: (voteId: number, choice: 'APPROVE' | 'REJECT') =>
    paymentApi.post(`/votes/${voteId}/choice`, { choice }),
};
