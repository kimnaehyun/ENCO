// src/screens/admin/AdminMembersScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMember } from '../../types/admin';

export default function AdminMembersScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';

  const members: AdminMember[] = useMemo(
    () => [
      { id: 'm1', name: '고싸피', joinedAt: '2026-02-17', memo: '총무(임시)' },
      { id: 'm2', name: '김싸피', joinedAt: '2026-02-18', memo: '회계 담당(임시)' },
      { id: 'm3', name: '정싸피', joinedAt: '2026-02-19', memo: '지출 잦음(임시)' },
      { id: 'm4', name: '장싸피', joinedAt: '2026-02-20', memo: '신규(임시)' },
    ],
    []
  );

  const [kickMode, setKickMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const onPressInvite = () => {
    const inviteUrl = `https://en.co/i?code=TEMP-${params.groupId ?? 'G1'}`;
    Clipboard.setString(inviteUrl);
    setInviteModalVisible(true);
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

  const onSelectMemberForKick = (id: string) => {
    if (!kickMode) return;
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: kickMode ? 110 : 32 }}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'GmarketSansTTFBold',
                color: '#111827',
              }}
            >
              멤버 관리
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#6B7280',
                fontFamily: 'GmarketSansTTFMedium',
              }}
            >
              {groupName} 멤버를 관리할 수 있어요
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onPressInvite}
              className="rounded-2xl px-4 py-2"
              style={{ backgroundColor: '#1428A0' }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontFamily: 'GmarketSansTTFBold',
                }}
              >
                초대
              </Text>
            </Pressable>

            <Pressable
              onPress={onPressKickMode}
              className="rounded-2xl px-4 py-2"
              style={{ backgroundColor: kickMode ? '#9CA3AF' : '#FF3B30' }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontFamily: 'GmarketSansTTFBold',
                }}
              >
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
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'GmarketSansTTFBold',
              color: '#111827',
              marginBottom: 16,
            }}
          >
            전체 멤버
          </Text>

          {members.map((member, index) => {
            const selected = selectedMemberId === member.id;

            return (
              <Pressable
                key={member.id}
                onPress={() => onSelectMemberForKick(member.id)}
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
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberJoinedAt}>
                    가입일 {member.joinedAt.replace(/-/g, '.')}
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
          })}
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
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                fontFamily: 'GmarketSansTTFMedium',
                lineHeight: 22,
              }}
            >
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

              <Text style={styles.modalTitle}>초대링크가 복사되었습니다!</Text>
              <Text style={styles.modalDescription}>
                원하는 곳에 붙여넣어 멤버를 초대해보세요.
              </Text>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>

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
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  memberJoinedAt: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFBold',
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
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
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
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFBold',
  },
  modalTitle: {
    marginTop: 6,
    fontSize: 19,
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'GmarketSansTTFBold',
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'GmarketSansTTFMedium',
  },
});