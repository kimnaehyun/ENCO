import { paymentApi } from '@/services/paymentService';

export const voteApi = {
  create: (payload: {
    groupId: number;
    cardId: number;
    password: string;
    counterpartyBankName: string;
    counterpartyName: string;
    counterpartyBankAccountNumber: string;
    title: string;
    description: string;
    amount: number;
    usePoint: boolean;
  }) =>
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
  request: (groupId: number) => paymentApi.post(`/payments/${groupId}/start`),
};
