import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVotes, VoteChoice } from '../../contexts/VotesContext';
import { GroupStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupVoteDetail'>;

const formatKRW = (n: number) => n.toLocaleString();

export default function GroupVoteDetailScreen({ route, navigation }: Props) {
  const { voteId } = route.params;
  const { getVoteById, vote } = useVotes();

  const data = getVoteById(voteId);

  const remainText = useMemo(() => {
    if (!data?.endsAt) return '표시 예정';
    const diff = new Date(data.endsAt).getTime() - Date.now();
    if (diff <= 0) return '마감';
    const mins = Math.floor(diff / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}시간 ${m}분`;
  }, [data?.endsAt]);

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>투표 상세</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.emptyText}>투표 정보를 찾을 수 없습니다.</Text>

          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>뒤로가기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const onVote = (choice: VoteChoice) => {
    vote(voteId, choice);
    navigation.goBack();
  };

  const isAgree = data.myChoice === 'agree';
  const isDisagree = data.myChoice === 'disagree';
  const isOngoing = !data.endsAt || new Date(data.endsAt) > new Date();

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
        <Text style={styles.subTitle}>{data.subTitle}</Text>

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
            {data.currentParticipants} / {data.totalParticipants}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>설명</Text>
        <Text style={styles.description}>{data.description}</Text>

        <View style={styles.myChoiceBox}>
          <Text style={styles.myChoiceText}>
            내 선택: {isAgree ? '찬성' : isDisagree ? '반대' : '미투표'}
          </Text>
        </View>

        {isOngoing && (
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => onVote('agree')}
              style={[
                styles.voteButton,
                styles.agreeButton,
                isAgree && styles.selectedButton,
              ]}
            >
              <Text style={styles.voteButtonText}>찬성</Text>
            </Pressable>

            <Pressable
              onPress={() => onVote('disagree')}
              style={[
                styles.voteButton,
                styles.disagreeButton,
                isDisagree && styles.selectedButton,
              ]}
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
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  closeText: {
    fontSize: 14,
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  subTitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },

  sectionTitle: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
  },

  emptyText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
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
    color: '#374151',
    fontFamily: 'GmarketSansTTFBold',
  },
});