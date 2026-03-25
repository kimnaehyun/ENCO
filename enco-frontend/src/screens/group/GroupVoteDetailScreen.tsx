import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VoteDetail } from '../../types/vote';
import { GroupStackParamList } from '../../types/navigation';
import { voteApi } from '@/services/payment/vote';
import { castVote } from '@/services/payment/voteHelpers';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupVoteDetail'>;

const formatKRW = (n: number) => n.toLocaleString();

export default function GroupVoteDetailScreen({ route, navigation }: Props) {
  const { voteId, groupId } = route.params;

  const [data, setData] = useState<VoteDetail | null>(null);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      try {
        const response = await voteApi.detail(Number(voteId), Number(groupId));
        setData(response.data.result);
      } catch (e) {
        console.log(e);
      }
    };
    fetchVoteDetail();
  }, [voteId, groupId]);

  const remainText = useMemo(() => {
    if (!data?.expiredAt) return '표시 예정';
    const diff = new Date(data.expiredAt).getTime() - Date.now();
    if (diff <= 0) return '마감';
    const mins = Math.floor(diff / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}시간 ${m}분`;
  }, [data?.expiredAt]);

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>투표 상세</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  const isOngoing = data.status === 'VOTING';

  const handleVote = async (choice: 'APPROVE' | 'REJECT') => {
    castVote(choice, Number(voteId));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>투표 상세</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
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

        {isOngoing && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 20,
    paddingTop: 56,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.medium,
  },

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
  subTitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
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

  myChoiceBox: {
    marginTop: 18,
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
  agreeButton: {
    backgroundColor: '#1428A0',
  },
  disagreeButton: {
    backgroundColor: '#EF4444',
  },
  selectedButton: {
    opacity: 0.88,
    transform: [{ scale: 1.02 }],
  },
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
  backButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 13,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.bold,
  },
});
