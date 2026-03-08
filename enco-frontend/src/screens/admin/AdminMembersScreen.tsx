// src/screens/admin/AdminMembersScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMember } from '../../types/admin';

export default function AdminMembersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';

  // ✅ 임시 멤버 데이터
  const members: AdminMember[] = useMemo(
    () => [
      { id: 'm1', name: '김싸피', joinedAt: '2026-03-01', memo: '총무(임시)' },
      { id: 'm2', name: '이싸피', joinedAt: '2026-03-02', memo: '회계 담당(임시)' },
      { id: 'm3', name: '박싸피', joinedAt: '2026-03-03', memo: '지출 잦음(임시)' },
      { id: 'm4', name: '홍싸피', joinedAt: '2026-03-04', memo: '늦게 납부(임시)' },
      { id: 'm5', name: '남궁싸피', joinedAt: '2026-03-05', memo: '신규(임시)' },
    ],
    []
  );

  // 펼침
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 추방 모드
  const [kickMode, setKickMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const onPressInvite = () => {
    // ✅ 임시 초대 URL (딥링크/웹링크는 나중에 실제 스킴으로 교체)
    // 예: https://en.co/i?code=XXXX 또는 enco://i?code=XXXX
    const inviteUrl = `https://en.co/i?code=TEMP-${params.groupId ?? 'G1'}`;

    // Clipboard 복사
    Clipboard.setString(inviteUrl);
    Alert.alert('초대 링크 복사', `클립보드에 복사됨:\n${inviteUrl}`);
  };

  const onPressKickMode = () => {
    setKickMode(prev => {
      const next = !prev;
      if (!next) setSelectedMemberId(null);
      return next;
    });
  };

  const onSelectMemberForKick = (id: string) => {
    if (!kickMode) {
      toggleExpand(id);
      return;
    }
    setSelectedMemberId(prev => (prev === id ? null : id));
  };

  const onConfirmKick = () => {
    if (!selectedMemberId) return;

    const target = members.find(m => m.id === selectedMemberId);
    Alert.alert(
      '추방 확인',
      `${target?.name ?? '선택한 멤버'} 님을 추방할까요? (임시)`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추방',
          style: 'destructive',
          onPress: () => {
            // TODO: 실제 API 연동
            Alert.alert('완료', '추방 처리(임시 완료)');
            setSelectedMemberId(null);
            setKickMode(false);
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>멤버관리 - 추방, 초대</Text>
      </View>

      {/* Top action buttons */}
      <View style={styles.topActionsRow}>
        <Pressable onPress={onPressInvite} style={styles.actionBtn} hitSlop={10}>
          <Text style={styles.actionBtnText}>초대하기</Text>
        </Pressable>

        <Pressable
          onPress={onPressKickMode}
          style={[styles.actionBtn, kickMode && styles.actionBtnActive]}
          hitSlop={10}
        >
          <Text style={styles.actionBtnText}>{kickMode ? '추방 취소' : '추방하기'}</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Member list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {members.map(m => {
          const expanded = expandedId === m.id;
          const selected = selectedMemberId === m.id;

          return (
            <View key={m.id} style={{ marginTop: 14 }}>
              <Pressable
                onPress={() => onSelectMemberForKick(m.id)}
                style={[
                  styles.memberRow,
                  kickMode && styles.memberRowKickMode,
                  selected && styles.memberRowSelected,
                ]}
                hitSlop={10}
              >
                {/* avatar placeholder */}
                <View style={styles.avatar} />

                <Text style={styles.memberName}>{m.name}</Text>

                {/* 우측 상태 */}
                <View style={{ marginLeft: 'auto' }}>
                  {kickMode ? (
                    <Text style={styles.badgeText}>{selected ? '선택됨' : '선택'}</Text>
                  ) : (
                    <Text style={styles.badgeText}>{expanded ? '접기' : '보기'}</Text>
                  )}
                </View>
              </Pressable>

              {/* Expanded info */}
              {!kickMode && expanded && (
                <View style={styles.expandBox}>
                  <Text style={styles.expandLine}>가입일: {m.joinedAt}</Text>
                  <Text style={styles.expandLine}>메모: {m.memo ?? '(없음)'}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom kick bar */}
      {kickMode && (
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onConfirmKick}
            disabled={!selectedMemberId}
            style={[
              styles.kickBtn,
              !selectedMemberId && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.kickBtnText}>추방하기</Text>
          </Pressable>
        </View>
      )}

      {/* Close */}
      {!kickMode && (
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 10 }} hitSlop={12}>
          <Text style={{ textAlign: 'center', fontWeight: '800' }}>닫기</Text>
        </Pressable>
      )}
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

  topActionsRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionBtnActive: { backgroundColor: '#BDBDBD' },
  actionBtnText: { fontWeight: '900' },

  divider: { height: 1, backgroundColor: '#111827', marginTop: 12, opacity: 0.6 },

  memberRow: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberRowKickMode: { backgroundColor: '#E5E7EB' },
  memberRowSelected: { borderWidth: 2, borderColor: '#111827' },

  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#BDBDBD' },
  memberName: { fontSize: 18, fontWeight: '900' },
  badgeText: { fontSize: 12, fontWeight: '900', color: '#374151' },

  expandBox: {
    marginTop: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  expandLine: { fontWeight: '700', color: '#111827' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  kickBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickBtnText: { fontSize: 16, fontWeight: '900', color: '#111827' },
});