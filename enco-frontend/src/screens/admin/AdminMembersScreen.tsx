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
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMember } from '../../types/admin';

export default function AdminMembersScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const members: AdminMember[] = useMemo(
    () => [
      { id: 'm1', name: '고싸피', joinedAt: '2026-02-17', memo: '총무(임시)' },
      { id: 'm2', name: '김싸피', joinedAt: '2026-02-18', memo: '회계 담당(임시)' },
      { id: 'm3', name: '정싸피', joinedAt: '2026-02-19', memo: '지출 잦음(임시)' },
      { id: 'm4', name: '장싸피', joinedAt: '2026-02-20', memo: '신규(임시)' },
    ],
    []
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [kickMode, setKickMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

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
      if (!next) {
        setSelectedMemberId(null);
      }
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
      <View style={styles.container}>
        <View style={styles.headerPill}>
          <Text style={styles.headerText}>멤버 관리</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={onPressInvite}
            style={[styles.topButton, styles.inviteButton]}
          >
            <Text style={styles.topButtonText}>초대</Text>
          </Pressable>

          <Pressable
            onPress={onPressKickMode}
            style={[styles.topButton, styles.kickModeButton]}
          >
            <Text style={styles.topButtonText}>{kickMode ? '취소' : '방출'}</Text>
          </Pressable>
        </View>

        <View style={styles.listWrapper}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {members.map(member => {
              const expanded = expandedId === member.id;
              const selected = selectedMemberId === member.id;

              return (
                <View key={member.id} style={styles.memberBlock}>
                  <Pressable
                    onPress={() => onSelectMemberForKick(member.id)}
                    style={[
                      styles.memberCard,
                      expanded && styles.memberCardExpanded,
                      kickMode && styles.memberCardKickMode,
                      selected && styles.memberCardSelected,
                    ]}
                  >
                    <View style={styles.memberTopRow}>
                      <View style={styles.avatarWrap}>
                        <Text style={styles.avatarEmoji}>🐹</Text>
                      </View>

                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>

                        {!kickMode && expanded && (
                          <Text style={styles.joinedAtText}>
                            가입일 {member.joinedAt.replace(/-/g, '.')}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {kickMode && (
          <View style={styles.bottomBar}>
            <Pressable
              onPress={onConfirmKick}
              disabled={!selectedMemberId}
              style={[
                styles.confirmKickButton,
                !selectedMemberId && styles.confirmKickButtonDisabled,
              ]}
            >
              <Text style={styles.confirmKickButtonText}>추방하기</Text>
            </Pressable>
          </View>
        )}

        <Modal
          visible={inviteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeInviteModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeInviteModal}>
            <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
              <Pressable style={styles.modalCloseButton} onPress={closeInviteModal}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>

              <Text style={styles.modalText}>초대링크가 복사되었습니다!</Text>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4fe',
  },

  headerPill: {
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    marginTop: 6,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111111',
  },

  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 4,
  },
  topButton: {
    minWidth: 94,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  inviteButton: {
    backgroundColor: '#1428A0',
  },
  kickModeButton: {
    backgroundColor: '#FF1A0F',
  },
  topButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'GmarketSansTTFBold',
  },

  listWrapper: {
    flex: 1,
    marginTop: 16,
    borderRadius: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  memberBlock: {
    marginBottom: 16,
  },
  memberCard: {
    minHeight: 82,
    backgroundColor: '#F3F3F3',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  memberCardExpanded: {
    minHeight: 154,
    justifyContent: 'flex-start',
    paddingTop: 14,
  },
  memberCardKickMode: {
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
  },
  memberCardSelected: {
    borderWidth: 2,
    borderColor: '#FF1A0F',
    backgroundColor: '#FFF4F3',
  },

  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8782A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 31,
  },

  memberInfo: {
    marginLeft: 14,
    paddingTop: 4,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 22,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111111',
  },
  joinedAtText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'GmarketSansTTFMedium',
    color: '#111111',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#ECECEF',
  },
  confirmKickButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FF1A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmKickButtonDisabled: {
    opacity: 0.45,
  },
  confirmKickButtonText: {
    fontSize: 18,
    fontFamily: 'GmarketSansTTFBold',
    color: '#FFFFFF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 328,
    minHeight: 292,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    fontSize: 18,
    color: '#666666',
    fontFamily: 'GmarketSansTTFBold',
  },
  modalText: {
    fontSize: 20,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111111',
    textAlign: 'center',
  },
});