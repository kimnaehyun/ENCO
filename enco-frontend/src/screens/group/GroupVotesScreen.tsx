import { useEffect, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { Vote } from '../../types/vote';
import { ROUTES } from '../../constants/routes';
import { GroupScreenProps } from '../../types/group';
import { voteApi } from '@/services/payment/vote';
import { castVote } from '@/services/payment/voteHelpers';

const formatKRW = (n: number) => n.toLocaleString();

export default function GroupVotesScreen({
  navigation,
  route,
}: GroupScreenProps<'GroupVotes'>) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName;

  useEffect(() => {
    const fetchVote = async () => {
      try {
        const response = await voteApi.list(Number(groupId));
        setVotes(response.data.result);
        console.log(response.data.result);
      } catch (e) {
        console.log(e);
      }
    };
    fetchVote();
  }, [groupId]);

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderExpandedContent = (item: Vote) => {
    const ongoing = item.status === 'VOTING';
    const handleVote = async (choice: 'APPROVE' | 'REJECT') => {
      try {
        await castVote(choice, item.voteId);
        const response = await voteApi.list(Number(groupId));
        setVotes(response.data.result);
        setExpandedId(null);
      } catch (e) {
        console.log(e);
      }
    };
    return (
      <View
        className="bg-white rounded-2xl px-5 py-4 mt-1"
        style={styles.expandedCard}
      >
        {item.amount != null && (
          <Text style={styles.expandedMeta}>{formatKRW(item.amount)}원</Text>
        )}

        <Text style={styles.expandedMetaTop}>
          마감 시간 {item.expiredAt.replace('T', ' ').slice(0, 16)}
        </Text>

        <Text style={styles.expandedMeta}>
          참여 현황: {item.votedCount} / {item.totalMembers ?? '?'}명
        </Text>

        {ongoing && (
          <View className="flex-row gap-3 mt-3 mb-3">
            <Pressable
              onPress={() => handleVote('APPROVE')}
              className="flex-1 rounded-2xl py-3 items-center justify-center"
              style={styles.agreeButton}
            >
              <Text style={styles.voteButtonText}>찬성</Text>
            </Pressable>

            <Pressable
              onPress={() => handleVote('REJECT')}
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
                voteId: item.voteId,
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
    const ongoing = item.status === 'VOTING';
    const isExpanded = expandedId === item.voteId;

    return (
      <View>
        <Pressable
          onPress={() => toggleExpand(item.voteId)}
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
            {item.votedCount} / {item.totalMembers ?? '?'}
          </Text>
        </Pressable>

        {isExpanded && renderExpandedContent(item)}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <FlatList
        data={votes}
        keyExtractor={item => String(item.voteId)}
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 4,
  },
  expandedMeta: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  expandedMetaTop: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
  },

  // ── 상세보기 버튼 ─────────────────────────
  detailButton: {
    backgroundColor: '#F3F4F6',
  },
  detailButtonText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.subtle,
  },
});
