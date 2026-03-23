import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useVotes, Vote, VoteChoice } from '../../contexts/VotesContext';
import { ROUTES } from '../../constants/routes';
import { GroupScreenProps } from '../../types/group';

const formatKRW = (n: number) => n.toLocaleString();

const isOngoing = (vote: Vote) => {
  if (!vote.endsAt) return vote.myChoice === null;
  return new Date(vote.endsAt) > new Date();
};

const getMyChoiceLabel = (choice: VoteChoice | null) => {
  if (choice === 'agree') return '찬성';
  if (choice === 'disagree') return '반대';
  return '미투표';
};

const getEndTimeText = (endsAt?: string | null) => {
  if (!endsAt) return '마감 시간 미정';
  return `마감 시간 ${endsAt.replace('T', ' ').slice(0, 16)}`;
};

export default function GroupVotesScreen({
  navigation,
  route,
}: GroupScreenProps<'GroupVotes'>) {
  const { votes, vote } = useVotes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName;

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const sortedVotes = useMemo(() => {
    return [...votes].sort((a, b) => {
      const aOngoing = isOngoing(a);
      const bOngoing = isOngoing(b);
      if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [votes]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleVote = (voteId: string, choice: VoteChoice) => {
    vote(voteId, choice);
    setExpandedId(null);
  };

  const renderExpandedContent = (item: Vote, ongoing: boolean) => {
    return (
      <View
        className="bg-white rounded-2xl px-5 py-4 mt-1"
        style={styles.expandedCard}
      >
        <Text style={styles.expandedSubTitle}>{item.subTitle}</Text>

        <View className="h-px bg-gray-100 my-2" />

        <Text style={styles.expandedMeta}>{formatKRW(item.amount)}원</Text>

        <Text style={styles.expandedMetaTop}>{getEndTimeText(item.endsAt)}</Text>

        <View className="flex-row gap-2 mt-3 mb-3">
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#1428A0' }}
            />
            <Text style={styles.expandedMeta}>
              내 선택: {getMyChoiceLabel(item.myChoice)}
            </Text>
          </View>
        </View>

        {ongoing && (
          <View className="flex-row gap-3 mt-1 mb-3">
            <Pressable
              onPress={() => handleVote(item.id, 'agree')}
              className="flex-1 rounded-2xl py-3 items-center justify-center"
              style={styles.agreeButton}
            >
              <Text style={styles.voteButtonText}>찬성</Text>
            </Pressable>

            <Pressable
              onPress={() => handleVote(item.id, 'disagree')}
              className="flex-1 rounded-2xl py-3 items-center justify-center"
              style={styles.disagreeButton}
            >
              <Text style={styles.voteButtonText}>반대</Text>
            </Pressable>
          </View>
        )}

        <View className={ongoing ? 'mt-1' : 'mt-2'}>
          <Pressable
            onPress={() =>
              navigation.navigate(ROUTES.GROUP_VOTE_DETAIL as any, {
                voteId: item.id,
                groupId,
                groupName,
              })
            }
            className="self-end rounded-xl px-4 py-2"
            style={styles.detailButton}
          >
            <Text style={styles.detailButtonText}>상세보기</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Vote }) => {
    const ongoing = isOngoing(item);
    const isExpanded = expandedId === item.id;

    return (
      <View>
        <Pressable
          onPress={() => toggleExpand(item.id)}
          className="bg-white rounded-2xl px-5 py-4 flex-row items-center justify-between"
          style={styles.cardShadow}
        >
          <View
            className="w-2.5 h-2.5 rounded-full mr-3"
            style={{ backgroundColor: ongoing ? '#EF4444' : '#818CF8' }}
          />

          <Text numberOfLines={1} style={styles.itemTitle}>
            {item.title}
          </Text>

          <Text style={styles.itemCount}>
            {item.currentParticipants} / {item.totalParticipants}
          </Text>
        </Pressable>

        {isExpanded && renderExpandedContent(item, ongoing)}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <FlatList
        data={sortedVotes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between mb-5">
            <Text style={styles.headerTitle}>투표 목록</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ── 리스트 ──────────────────────────────────
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  separator: {
    height: 10,
  },

  // ── 헤더 ──────────────────────────────────
  headerTitle: {
    fontSize: 20,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },

  // ── 투표 카드 (접힘) ──────────────────────
  cardShadow: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginLeft: 8,
  },

  // ── 투표 카드 (펼침) ──────────────────────
  expandedCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  expandedSubTitle: {
    fontSize: 14,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
    marginBottom: 4,
  },
  expandedMeta: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
  expandedMetaTop: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginTop: 2,
  },

  // ── 투표 버튼 ─────────────────────────────
  agreeButton: {
    backgroundColor: '#1428A0',
  },
  disagreeButton: {
    backgroundColor: '#EF4444',
  },
  voteButtonText: {
    fontSize: 16,
    fontFamily: 'GmarketSansTTFBold',
    color: '#fff',
  },

  // ── 상세보기 버튼 ─────────────────────────
  detailButton: {
    backgroundColor: '#F3F4F6',
  },
  detailButtonText: {
    fontSize: 13,
    fontFamily: 'GmarketSansTTFBold',
    color: '#374151',
  },
});
