// src/contexts/NotificationsContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

export type NotiType = 'DUE' | 'VOTE' | 'LEDGER' | 'SETTLEMENT'; // 알림 유형 추가(예시: 정산 알림)

export type NotificationItem = {
  id: string;
  type: NotiType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  groupId?: string;
  groupName?: string;
  voteId?: string; // VOTE일 때
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;

  // ✅ 정석 확장용: 서버 연동 시 이 API들만 구현 교체하면 됨
  upsertMany: (items: NotificationItem[]) => void; // 서버에서 받은 목록 반영
  pushOne: (item: NotificationItem) => void;       // 실시간 알림 추가(웹소켓/FCM)
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

// ✅ 임시 seed (나중에 서버 데이터로 교체)
const seed: NotificationItem[] = [
  {
    id: 'n1',
    type: 'DUE',
    title: '미납 알림',
    body: '3월 회비가 아직 미납입니다. 납부를 진행해주세요.',
    createdAt: '2026-03-09 10:10',
    isRead: false,
    groupId: 'g1',
    groupName: '회식주의자',
  },
  {
    id: 'n2',
    type: 'VOTE',
    title: '투표 생성됨',
    body: '“보일링 씨푸드 결제 승인” 투표가 생성되었습니다.',
    createdAt: '2026-03-08 21:05',
    isRead: true,
    groupId: 'g1',
    groupName: '회식주의자',
    voteId: 'v1',
  },
  {
    id: 'n3',
    type: 'LEDGER',
    title: '장부 업데이트',
    body: '새 지출 내역이 등록되었습니다. 장부에서 확인하세요.',
    createdAt: '2026-03-08 09:12',
    isRead: false,
    groupId: 'g1',
    groupName: '회식주의자',
  },
  {
    id: 'mock-settlement-1',
    type: 'SETTLEMENT',
    title: '[ 감튀정모 ] 18,000원',
    body: '납부 요청이 왔습니다',
    createdAt: '방금 전',
    isRead: false,
    groupId: 'g1',
    groupName: '회식주의자',
  }
];

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(seed);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
    [notifications]
  );

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => setNotifications([]);

  // ✅ 정석 확장: 서버 목록 반영(동일 id는 update, 없으면 insert)
  const upsertMany = (items: NotificationItem[]) => {
    setNotifications(prev => {
      const map = new Map(prev.map(x => [x.id, x]));
      for (const it of items) map.set(it.id, { ...(map.get(it.id) ?? {}), ...it });
      // 최신순 정렬(임시: createdAt 문자열 기준)
      return Array.from(map.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    });
  };

  // ✅ 정석 확장: 새 알림을 앞에 추가
  const pushOne = (item: NotificationItem) => {
    setNotifications(prev => [item, ...prev]);
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, clearAll, upsertMany, pushOne }),
    [notifications, unreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};  