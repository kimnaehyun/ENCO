// votes: 투표 목록 데이터

// vote(voteId, choice): 내 선택을 저장하는 함수

// getVoteById(voteId): 상세 화면에서 한 개 찾기

import React, { createContext, useContext, useMemo, useState } from 'react';

export type VoteChoice = 'agree' | 'disagree';

export type Vote = {
  id: string;
  title: string;
  subTitle: string;
  amount: number;
  description: string;
  currentParticipants: number;
  totalParticipants: number;
  createdAt: string; // ISO
  endsAt?: string;   // ISO (옵션)
  myChoice: VoteChoice | null; // ✅ 내 투표(찬/반)
};

type VotesContextValue = {
  votes: Vote[];
  vote: (voteId: string, choice: VoteChoice) => void;
  getVoteById: (voteId: string) => Vote | undefined;
};

const VotesContext = createContext<VotesContextValue | null>(null);

export const useVotes = () => {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used within VotesProvider');
  return ctx;
};

const seedVotes: Vote[] = [
  {
    id: 'v1',
    title: '보일링 씨푸드',
    subTitle: '보일링 씨푸드 결제 승인',
    amount: 39000,
    description: '회식 비용 결제건으로 투표를 받습니다.',
    currentParticipants: 2,
    totalParticipants: 4,
    createdAt: '2026-03-06T01:10:00.000Z',
    myChoice: null,
  },
  {
    id: 'v2',
    title: '다낭 여행 숙소',
    subTitle: '다낭 힐튼 호텔 스위트룸',
    amount: 789000,
    description: '여름방학 베트남 여행 숙소 예약건으로 투표 받습니다.',
    currentParticipants: 2,
    totalParticipants: 4,
    createdAt: '2026-03-05T09:10:00.000Z',
    myChoice: 'agree',
  },
];

export const VotesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [votes, setVotes] = useState<Vote[]>(seedVotes);

  const vote = (voteId: string, choice: VoteChoice) => {
    setVotes(prev =>
      prev.map(v => {
        if (v.id !== voteId) return v;

        const wasUnvoted = v.myChoice === null;
        const nextParticipants = wasUnvoted
          ? Math.min(v.currentParticipants + 1, v.totalParticipants)
          : v.currentParticipants;

        return { ...v, myChoice: choice, currentParticipants: nextParticipants };
      })
    );
  };

  const getVoteById = (voteId: string) => votes.find(v => v.id === voteId);

  const value = useMemo(() => ({ votes, vote, getVoteById }), [votes]);

  return <VotesContext.Provider value={value}>{children}</VotesContext.Provider>;
};