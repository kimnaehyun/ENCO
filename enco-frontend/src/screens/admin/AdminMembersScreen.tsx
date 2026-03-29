// src/screens/admin/AdminMembersScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View, Image, ActivityIndicator } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import Clipboard from '@react-native-clipboard/clipboard';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMember } from '../../types/admin';
import { getGroupMembers, updateGroupMemberRole, type GroupMember } from '../../services/groupService';
import { createInviteToken } from '../../services/inviteService';

// 딥링크 스킴
const DEEP_LINK_BASE = 'enco://app/invite';

export default function AdminMembersScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupId = params.groupId;
  const groupName = params.groupName ?? '모임명';

  // ── 멤버 목록 (API 연동) ──
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const data = await getGroupMembers(groupId!);
        setMembers(data.result);
      } catch (error: any) {
        console.error('멤버 목록 조회 실패:', error?.response?.data ?? error.message);
      } finally {
        setLoadingMembers(false);
      }
    };
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  const [kickMode, setKickMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // 역할 변경
  const [roleTarget, setRoleTarget] = useState<GroupMember | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const onPressMember = (member: GroupMember) => {
    if (kickMode) {
      onSelectMemberForKick(member.userId);
      return;
    }
    // 관리자(ADMIN/LEADER)는 역할 변경 불가
    if (member.role === 'ADMIN' || member.role === 'LEADER') return;
    setRoleTarget(member);
  };

  const onChangeRole = async (newRole: 'TREASURER' | 'USER') => {
    if (!roleTarget || !groupId) return;
    try {
      setRoleLoading(true);
      await updateGroupMemberRole(groupId, roleTarget.userId, { role: newRole });
      // 로컬 상태 업데이트
      setMembers(prev =>
        prev.map(m => m.userId === roleTarget.userId ? { ...m, role: newRole } : m),
      );
      setRoleTarget(null);
      Alert.alert('완료', `${roleTarget.name ?? '멤버'}님의 역할이 변경되었습니다.`);
    } catch (error: any) {
      console.error('역할 변경 실패:', error?.response?.data ?? error.message);
      Alert.alert('오류', error?.response?.data?.message ?? '역할 변경에 실패했습니다.');
    } finally {
      setRoleLoading(false);
    }
  };

  // ── 초대 링크 생성 (API 호출) ──
  const onPressInvite = async () => {
    if (!groupId) {
      Alert.alert('오류', 'groupId가 없습니다.');
      return;
    }

    try {
      setInviteLoading(true);

      // 1) API 호출 → 초대 토큰 발급
      const response = await createInviteToken(groupId!);
      const token = response.result.token;

      // 2) 딥링크 URL 생성 (커스텀 스킴)
      const encodedName = encodeURIComponent(groupName);
      const url = `${DEEP_LINK_BASE}?token=${token}&groupName=${encodedName}`;
      setInviteUrl(url);

      // 3) 클립보드에 복사
      Clipboard.setString(url);

      // 4) 모달 표시
      setInviteModalVisible(true);
    } catch (error: any) {
      console.error('초대 토큰 생성 실패:', error?.response?.data ?? error.message);

      const errorMessage =
        error?.response?.data?.message ?? '초대 링크 생성 중 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setInviteModalVisible(false);
  };

  const onPressKickMode = () => {
    setKickMode(prev => {
      const next = !prev;
      if (!next) setSelectedMemberId(null);
      return next;
    });
  };

  const onSelectMemberForKick = (id: number) => {
    if (!kickMode) return;
    setSelectedMemberId(prev => (prev === id ? null : id));
  };

  const onConfirmKick = () => {
    if (!selectedMemberId) return;

    const target = members.find(m => m.userId === selectedMemberId);

    Alert.alert(
      '추방 확인',
      `${target?.name ?? '선택한 멤버'} 님을 추방할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추방',
          style: 'destructive',
          onPress: () => {
            Alert.alert('완료', '추방 처리 완료');
            setSelectedMemberId(null);
            setKickMode(false);
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: kickMode ? 110 : 32 }}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text variant="bodyLg" weight="bold" color="dark">
              멤버 관리
            </Text>
            <Text variant="caption" color="muted" style={{ marginTop: 6 }}>
              {groupName} 멤버를 관리할 수 있어요
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onPressInvite}
              disabled={inviteLoading}
              className="rounded-2xl px-4 py-2"
              style={[
                { backgroundColor: '#1428A0' },
                inviteLoading && { opacity: 0.6 },
              ]}
            >
              {inviteLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text variant="bodySm" weight="bold" color="white">
                  초대
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={onPressKickMode}
              className="rounded-2xl px-4 py-2"
              style={{ backgroundColor: kickMode ? '#9CA3AF' : '#FF3B30' }}
            >
              <Text variant="bodySm" weight="bold" color="white">
                {kickMode ? '취소' : '방출'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 멤버 리스트 카드 */}
        <View
          className="bg-white rounded-3xl px-5 py-5"
          style={{
            shadowColor: '#1428A0',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text variant="bodyMd" weight="bold" color="dark" style={{ marginBottom: 16 }}>
            전체 멤버
          </Text>

          {loadingMembers ? (
            <ActivityIndicator size="large" color="#1428A0" style={{ paddingVertical: 40 }} />
          ) : members.length === 0 ? (
            <Text style={styles.emptyText}>모임원이 없습니다.</Text>
          ) : (
            members.map((member, index) => {
              const selected = selectedMemberId === member.userId;

              return (
                <Pressable
                  key={member.userId}
                  onPress={() => onPressMember(member)}
                  style={[
                    styles.memberCard,
                    index !== members.length - 1 && styles.memberCardSpacing,
                    kickMode && styles.memberCardKickMode,
                    selected && styles.memberCardSelected,
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    <Image
                      source={require('../../assets/icons/nomal_hamco.png')}
                      style={styles.avatarImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.name ?? `유저 ${member.userId}`}
                    </Text>
                    <Text style={styles.memberJoinedAt}>
                      {member.role === 'ADMIN' || member.role === 'LEADER'
                        ? '관리자'
                        : member.role === 'TREASURER'
                        ? '총무'
                        : '멤버'}
                      {member.joinedAt || member.joined_at
                        ? ` · 가입일 ${(member.joinedAt ?? member.joined_at ?? '').replace(/-/g, '.').slice(0, 10)}`
                        : ''}
                    </Text>
                  </View>

                  {kickMode && (
                    <View style={styles.selectionBadge}>
                      <Text style={styles.selectionBadgeText}>
                        {selected ? '선택됨' : '선택'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* 방출 모드 안내 */}
        {kickMode && (
          <View
            className="bg-white rounded-3xl px-5 py-4 mt-4"
            style={{
              shadowColor: '#1428A0',
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text variant="bodySm" color="muted">
              방출할 멤버를 선택한 뒤 아래 버튼을 눌러주세요.
            </Text>
          </View>
        )}

        {/* 초대 링크 복사 모달 */}
        <Modal
          visible={inviteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeInviteModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeInviteModal}>
            <Pressable
              style={styles.modalCard}
              onPress={e => e.stopPropagation()}
            >
              <Pressable
                onPress={closeInviteModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>

              <Image
                source={require('../../assets/icons/invite_hamco.png')}
                style={styles.modalImage}
                resizeMode="contain"
              />

              <Text style={styles.modalTitle}>초대링크가 복사되었습니다!</Text>
              <Text style={styles.modalDescription}>
                원하는 곳에 붙여넣어{'\n'}멤버를 초대해보세요.
              </Text>
              <Pressable
                onPress={() => {
                  Clipboard.setString(inviteUrl);
                  Alert.alert('복사됨', '링크가 다시 복사되었습니다.');
                }}
                style={styles.linkBox}
              >
                <Text style={styles.linkText} numberOfLines={2}>{inviteUrl}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>

      {/* 역할 변경 모달 */}
      {roleTarget && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setRoleTarget(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setRoleTarget(null)}>
            <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
              <Pressable onPress={() => setRoleTarget(null)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>

              <Text style={styles.modalTitle}>
                {roleTarget.name ?? `유저 ${roleTarget.userId}`}
              </Text>
              <Text style={[styles.modalDescription, { marginBottom: 20 }]}>
                현재 역할: {roleTarget.role === 'TREASURER' ? '총무' : '일반 회원'}
              </Text>

              <Pressable
                onPress={() => onChangeRole('TREASURER')}
                disabled={roleLoading || roleTarget.role === 'TREASURER'}
                style={[
                  styles.roleButton,
                  roleTarget.role === 'TREASURER' && styles.roleButtonActive,
                  roleLoading && { opacity: 0.5 },
                ]}
              >
                <Text style={[
                  styles.roleButtonText,
                  roleTarget.role === 'TREASURER' && styles.roleButtonTextActive,
                ]}>
                  총무
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onChangeRole('USER')}
                disabled={roleLoading || roleTarget.role === 'USER'}
                style={[
                  styles.roleButton,
                  { marginTop: 10 },
                  roleTarget.role === 'USER' && styles.roleButtonActive,
                  roleLoading && { opacity: 0.5 },
                ]}
              >
                <Text style={[
                  styles.roleButtonText,
                  roleTarget.role === 'USER' && styles.roleButtonTextActive,
                ]}>
                  일반 회원
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* 하단 방출 버튼 */}
      {kickMode && (
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onConfirmKick}
            disabled={!selectedMemberId}
            style={[
              styles.kickButton,
              !selectedMemberId && styles.kickButtonDisabled,
            ]}
          >
            <Text style={styles.kickButtonText}>방출하기</Text>
          </Pressable>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
    paddingVertical: 40,
  },
  memberCard: {
    minHeight: 84,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCardSpacing: {
    marginBottom: 12,
  },
  memberCardKickMode: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  memberCardSelected: {
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },

  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 17,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  memberJoinedAt: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  selectionBadge: {
    marginLeft: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectionBadgeText: {
    fontSize: 12,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#ECECEF',
  },
  kickButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickButtonDisabled: {
    opacity: 0.45,
  },
  kickButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1428A0',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.bold,
  },
  modalImage: {
    width: 120,
    height: 120,
    marginBottom: 14,
  },
  modalTitle: {
    marginTop: 6,
    fontSize: 19,
    color: COLORS.dark,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  linkBox: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  linkText: {
    fontSize: 12,
    color: '#1428A0',
    fontFamily: FONT_FAMILY.medium,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  roleButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1428A0',
  },
  roleButtonText: {
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
});