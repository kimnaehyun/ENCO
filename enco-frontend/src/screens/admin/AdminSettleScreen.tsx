// src/screens/admin/AdminSettleScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMemberPay } from '../../types/admin';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import Text from '@/components/typography/Text';

type AdminSettleRouteProp = RouteProp<GroupStackParamList, 'AdminSettle'>;
type AdminSettleNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminSettle'
>;

const formatKRW = (n: number) =>
  `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function AdminSettleScreen() {
  const navigation = useNavigation<AdminSettleNavigationProp>();
  const route = useRoute<AdminSettleRouteProp>();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';

  // 펼침 상태
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Android expand 애니메이션
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // ✅ 임시 데이터(나중에 API로 교체)
  const members: AdminMemberPay[] = useMemo(
    () => [
      {
        id: 'm1',
        name: '김싸피',
        joinedAt: '2026-03-01',
        memo: '총무(임시)',
        isPaid: true,
        dueAmount: 10000,
      },
      {
        id: 'm2',
        name: '이싸피',
        joinedAt: '2026-03-02',
        memo: '회계 담당(임시)',
        isPaid: false,
        dueAmount: 10000,
      },
      {
        id: 'm3',
        name: '박싸피',
        joinedAt: '2026-03-03',
        memo: '지출 잦음(임시)',
        isPaid: false,
        dueAmount: 10000,
      },
      {
        id: 'm4',
        name: '홍싸피',
        joinedAt: '2026-03-04',
        memo: '늦게 납부(임시)',
        isPaid: true,
        dueAmount: 10000,
      },
    ],
    [],
  );

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const sendRequest = (m: AdminMemberPay) => {
    // TODO: 실제 알림/푸시/챗봇 연동
    Alert.alert(
      '입금요청 알림(임시)',
      `${m.name}에게 ${formatKRW(m.dueAmount)} 입금 요청 알림을 보냅니다.`,
    );
  };

  const sendRequestAllUnpaid = () => {
    const unpaid = members.filter(x => !x.isPaid);
    if (unpaid.length === 0) {
      Alert.alert('안내', '미납자가 없습니다.');
      return;
    }
    Alert.alert(
      '일괄 요청(임시)',
      `미납자 ${unpaid.length}명에게 입금요청 알림을 보냅니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보내기',
          onPress: () => {
            Alert.alert('완료', '입금요청 알림 발송(임시 완료)');
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>정산하기 - 미납자 관리</Text>
      </View>

      {/* top right actions */}
      <View style={styles.topActionsRow}>
        <Pressable
          onPress={sendRequestAllUnpaid}
          style={styles.actionBtn}
          hitSlop={10}
        >
          <Text style={styles.actionBtnText}>미납자 일괄요청</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.actionBtn}
          hitSlop={10}
        >
          <Text style={styles.actionBtnText}>닫기</Text>
        </Pressable>
      </View>

      <Text className="mt-4.5" weight="bold">
        {groupName}
      </Text>

      <View style={styles.divider} />

      {/* list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {members.map(m => {
          const expanded = expandedId === m.id;

          return (
            <View key={m.id} className="mt-3.5">
              <Pressable
                onPress={() => toggleExpand(m.id)}
                style={styles.row}
                hitSlop={10}
              >
                <View style={styles.avatar} />
                <Text style={styles.name}>{m.name}</Text>

                <View className="ml-auto items-end ">
                  <View
                    style={[
                      styles.badge,
                      m.isPaid ? styles.badgePaid : styles.badgeUnpaid,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {m.isPaid ? '납부' : '미납'}
                    </Text>
                  </View>
                  <Text style={styles.smallText}>
                    {expanded ? '접기' : '펼치기'}
                  </Text>
                </View>
              </Pressable>

              {expanded && (
                <View style={styles.expandBox}>
                  <Text style={styles.expandLine}>가입일: {m.joinedAt}</Text>
                  <Text style={styles.expandLine}>
                    메모: {m.memo ?? '(없음)'}
                  </Text>
                  <Text style={styles.expandLine}>
                    회비: {formatKRW(m.dueAmount)}
                  </Text>

                  {!m.isPaid ? (
                    <Pressable
                      onPress={() => sendRequest(m)}
                      style={styles.requestBtn}
                      hitSlop={10}
                    >
                      <Text style={styles.requestBtnText}>
                        입금요청 알림 보내기
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={[styles.requestBtn, { opacity: 0.4 }]}>
                      <Text style={styles.requestBtnText}>이미 납부 완료</Text>
                    </View>
                  )}

                  {/* (선택) 장부로 이동 버튼을 여기에 추가하고 싶으면:
                      navigation.navigate('GroupLedger', { groupId: params.groupId, groupName: params.groupName })
                  */}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPill: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerText: { fontSize: 18, fontWeight: '800' },

  topActionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionBtnText: { fontWeight: '900' },

  divider: {
    height: 1,
    backgroundColor: '#111827',
    marginTop: 12,
    opacity: 0.6,
  },

  row: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BDBDBD',
  },
  name: { fontSize: 18, fontWeight: '900' },

  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  badgePaid: { backgroundColor: '#C7F9CC' },
  badgeUnpaid: { backgroundColor: '#FFD6A5' },
  badgeText: { fontSize: 12, fontWeight: '900' },
  smallText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },

  expandBox: {
    marginTop: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  expandLine: { fontWeight: '700', color: '#111827' },

  requestBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnText: { fontWeight: '900' },
});
