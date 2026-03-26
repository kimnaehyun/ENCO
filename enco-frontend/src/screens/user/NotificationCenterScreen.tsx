// src/screens/user/NotificationCenterScreen.tsx
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import {
  useNotifications,
  NotificationItem,
} from '../../contexts/NotificationsContext';

type Params = { groupId?: string; groupName?: string };

export default function NotificationCenterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  const { notifications, markRead, markAllRead, clearAll } = useNotifications();

  const groupName = params.groupName ?? '알림';

  const openTarget = (n: NotificationItem) => {
    markRead(n.id);

    if (n.type === 'DUE') {
      navigation.navigate('GroupPay', {
        groupId: n.groupId,
        groupName: n.groupName,
        presetAmount: n.amount,
        presetMemo: n.memo,
        presetUnpaidId: n.unpaidItemId,
        paySource: 'due' as const,
      });
      return;
    }

    if (n.type === 'SETTLEMENT') {
      navigation.navigate('GroupPay', {
        groupId: n.groupId,
        groupName: n.groupName,
        presetAmount: 18000,
        presetMemo: '감튀정모 후불 정산',
        paySource: 'settlement' as const,
      });
      return;
    }

    if (n.type === 'LEDGER') {
      navigation.navigate('GroupLedger', {
        groupId: n.groupId,
        groupName: n.groupName,
      });
      return;
    }

    navigation.navigate('GroupVoteDetail', {
      voteId: n.voteId ?? 'v1',
      groupId: n.groupId,
      groupName: n.groupName,
    });
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>알림</Text>

          <View style={styles.headerActions}>
            <Pressable onPress={markAllRead} hitSlop={12}>
              <Text style={styles.headerActionText}>모두 읽음</Text>
            </Pressable>

            <Pressable onPress={clearAll} hitSlop={12}>
              <Text style={styles.headerActionText}>알림 비우기</Text>
            </Pressable>
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptyDesc}>
              새로운 알림이 오면 이곳에 표시됩니다.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={it => it.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => {
              const isUnread = !item.isRead;

              return (
                <Pressable
                  onPress={() => openTarget(item)}
                  style={styles.card}
                  hitSlop={10}
                >
                  <View style={styles.cardRow}>
                    <View
                      style={[
                        styles.dot,
                        isUnread ? styles.dotUnread : styles.dotRead,
                      ]}
                    />

                    <Text
                      style={[
                        styles.cardTitle,
                        isUnread && styles.cardTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>

                  <Text style={styles.cardBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },

  headerBox: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActionText: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyBox: {
    marginTop: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  dotUnread: {
    backgroundColor: '#FF1A0F',
  },
  dotRead: {
    backgroundColor: '#1428A0',
  },

  cardTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.medium,
  },
  cardTitleUnread: {
    fontFamily: FONT_FAMILY.bold,
  },

  cardBody: {
    marginTop: 10,
    marginLeft: 20,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 20,
  },
});