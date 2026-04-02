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

export type VoteDetail = {
  voteId: number;
  transactionId: number;
  title: string;
  description: string;
  amount: number;
  status: 'VOTING' | 'CLOSED';
  expiredAt: string;
  totalMembers: number;
  votedCount: number;
  approveCount: number;
  rejectCount: number;
  histories: { userId: number; choice: string }[];
};
