export type VoteChoice = 'agree' | 'disagree';

export type Vote = {
  voteId: number;
  title: string;
  amount?: number; // 없을 수도 있음
  status: 'VOTING' | 'CLOSED';
  expiredAt: string;
  totalMembers: number | null;
  votedCount: number;
};
