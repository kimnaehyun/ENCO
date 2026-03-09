// src/screens/user/NotificationCenterScreen.tsx
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { useNotifications, NotificationItem } from '../../contexts/NotificationsContext';

type Params = { groupId?: string; groupName?: string };

export default function NotificationCenterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  // ✅ 전역 알림 상태
  const { notifications, markRead, markAllRead, clearAll } = useNotifications();

  // 라우트 파라미터가 있으면 우선 사용(없으면 알림 payload의 groupName이 쓰일 수 있음)
  const groupName = params.groupName ?? '알림';

  const openTarget = (n: NotificationItem) => {
    // 클릭 시 읽음 처리
    markRead(n.id);

    // 타입별 이동
    if (n.type === 'DUE') {
      navigation.navigate('GroupPay', { groupId: n.groupId, groupName: n.groupName });
      return;
    }

    if (n.type === 'LEDGER') {
      navigation.navigate('GroupLedger', { groupId: n.groupId, groupName: n.groupName });
      return;
    }

    // VOTE
    navigation.navigate('GroupVoteDetail', {
      voteId: n.voteId ?? 'v1',
      groupId: n.groupId,
      groupName: n.groupName,
    });
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          알림 센터 - {groupName}
        </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerBtn}>닫기</Text>
        </Pressable>
      </View>

      {/* Top actions */}
      <View style={styles.topActions}>
        <Pressable onPress={markAllRead} style={styles.actionBtn} hitSlop={10}>
          <Text style={styles.actionText}>전체 읽음</Text>
        </Pressable>

        <Pressable onPress={clearAll} style={styles.actionBtn} hitSlop={10}>
          <Text style={styles.actionText}>비우기</Text>
        </Pressable>
      </View>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>알림이 없습니다</Text>
          <Text style={styles.emptyDesc}>새 알림이 오면 이곳에 표시됩니다.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={it => it.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openTarget(item)}
              style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
              hitSlop={10}
            >
              <View style={styles.row}>
                <View style={[styles.dot, item.isRead ? styles.dotRead : styles.dotUnread]} />
                <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{item.createdAt}</Text>
              </View>

              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>

              <Text style={styles.hint}>
                {item.type === 'DUE'
                  ? '눌러서 납부 화면으로'
                  : item.type === 'LEDGER'
                  ? '눌러서 장부로'
                  : '눌러서 투표 상세로'}
              </Text>
            </Pressable>
          )}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', flex: 1, paddingRight: 12 },
  headerBtn: { fontSize: 16, fontWeight: '900' },

  topActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionText: { fontWeight: '900' },

  emptyBox: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '900' },
  emptyDesc: { color: '#6B7280', textAlign: 'center' },

  card: {
    backgroundColor: '#D9D9D9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardUnread: { opacity: 1 },
  cardRead: { opacity: 0.6 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotUnread: { backgroundColor: '#FF6B6B' },
  dotRead: { backgroundColor: '#6B7280' },

  title: { flex: 1, fontSize: 15, fontWeight: '800' },
  titleUnread: { fontWeight: '900' },
  time: { fontSize: 12, color: '#374151', fontWeight: '800' },

  body: { marginTop: 10, color: '#111827', lineHeight: 18 },
  hint: { marginTop: 10, color: '#6B7280', fontSize: 12, fontWeight: '800' },
});