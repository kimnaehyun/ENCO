import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { VoteDetail } from '../../types/vote';
import { voteApi } from '@/services/payment/vote';
import { castVote } from '@/services/payment/voteHelpers';
import { GroupVoteDetailType } from '@/types/group';
import { useAuthStore } from '@/store/useAuthStore';

const formatKRW = (n: number) => n.toLocaleString();

export default function GroupVoteDetail({
  voteId,
  groupId,
  onVoteDone,
}: GroupVoteDetailType) {
  const [data, setData] = useState<VoteDetail | null>(null);
  const userId = useAuthStore(state => state.userId);

  useEffect(() => {
    setData(null);
    voteApi
      .detail(Number(voteId), Number(groupId))
      .then(res => {
        setData(res.data.result);
        console.log(res.data.result);
      })
      .catch(console.log);
  }, [voteId, groupId]);

  const remainText = useMemo(() => {
    if (!data?.expiredAt) return '표시 예정';
    const diff = new Date(data.expiredAt).getTime() - Date.now();
    if (diff <= 0) return '마감';
    const mins = Math.floor(diff / 60000);
    return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
  }, [data?.expiredAt]);

  if (!data) {
    return (
      <View style={[styles.card, { marginTop: 4 }]}>
        <Text style={styles.emptyText}>로딩 중...</Text>
      </View>
    );
  }

  const myHistory = data?.histories?.find(h => h.userId === userId);
  const myChoice = myHistory?.choice ?? null;

  const hasVoted = myChoice !== null;

  const isOngoing = data?.status === 'VOTING';

  const handleVote = async (choice: 'APPROVE' | 'REJECT') => {
    await castVote(choice, Number(voteId));
    onVoteDone();
  };

  return (
    <View style={[styles.card, { marginTop: 4 }]}>
      <Text style={styles.title}>{data.title}</Text>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>금액</Text>
        <Text style={styles.infoValue}>{formatKRW(data.amount)}원</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>남은 시간</Text>
        <Text style={styles.infoValue}>{remainText}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>참여 인원</Text>
        <Text style={styles.infoValue}>
          {data.votedCount} / {data.totalMembers}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>찬성 / 반대</Text>
        <Text style={styles.infoValue}>
          {data.approveCount} / {data.rejectCount}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>설명</Text>
      <Text style={styles.description}>{data.description}</Text>

      {/* 내 선택 표시 */}
      {hasVoted && (
        <View style={styles.myChoiceBox}>
          <Text style={styles.myChoiceText}>
            내 선택: {myChoice === 'APPROVE' ? '찬성' : '반대'}
          </Text>
        </View>
      )}

      {isOngoing && !hasVoted && (
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => handleVote('APPROVE')}
            style={[styles.voteButton, styles.agreeButton]}
          >
            <Text style={styles.voteButtonText}>찬성</Text>
          </Pressable>
          <Pressable
            onPress={() => handleVote('REJECT')}
            style={[styles.voteButton, styles.disagreeButton]}
          >
            <Text style={styles.voteButtonText}>반대</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  voteButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButton: { backgroundColor: '#1428A0' },
  disagreeButton: { backgroundColor: '#EF4444' },
  voteButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  myChoiceBox: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myChoiceText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
});
