import { voteApi } from '@/services/payment/vote';

export const castVote = async (
  choice: 'APPROVE' | 'REJECT',
  voteId: number,
) => {
  try {
    const response = await voteApi.vote(voteId, choice);
    console.log(response);
  } catch (e) {
    console.log(e);
  }
};
