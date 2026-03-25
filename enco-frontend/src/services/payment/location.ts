import { paymentApi } from '@/services/paymentService';

export const locationApi = {
  check: (
    groupId: number,
    latitude: number,
    longitude: number,
    isLeader: boolean,
  ) =>
    paymentApi.post(`/payments/${groupId}/location`, {
      latitude,
      longitude,
      isLeader,
    }),
};
