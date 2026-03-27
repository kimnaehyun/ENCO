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
  voteId?: string;       // VOTE일 때
  amount?: number;       // DUE/SETTLEMENT 금액
  memo?: string;         // DUE/SETTLEMENT 메모
  unpaidItemId?: string; // DUE 미납 항목 ID
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

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
    setNotifications(prev => {
      const existingIndex = prev.findIndex(n => n.id === item.id);

      if (existingIndex === -1) {
        return [item, ...prev];
      }

      const merged: NotificationItem = {
        ...prev[existingIndex],
        ...item,
      };

      // 동일 id 알림은 최신 내용으로 갱신하고 맨 앞으로 이동
      return [merged, ...prev.filter((_, index) => index !== existingIndex)];
    });
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, clearAll, upsertMany, pushOne }),
    [notifications, unreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};  