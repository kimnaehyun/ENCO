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
import { GroupScreenProps } from '../../types/group';
import { voteApi } from '@/services/payment/vote';
import GroupVoteDetail from '@/components/vote/GroupVoteDetail';


export default function GroupVotesScreen({
  route,
}: GroupScreenProps<'GroupVotes'>) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const groupId = route.params?.groupId;


  useEffect(() => {
    const fetchVote = async () => {
      try {
        const response = await voteApi.list(Number(groupId));
        const sorted = [...response.data.result].sort(
          (a, b) => b.voteId - a.voteId,
        );
        console.log(response.data);
        
        setVotes(sorted);
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

      {isExpanded && (
        <GroupVoteDetail
          voteId={item.voteId}
          groupId={Number(groupId)}
          onVoteDone={async () => {
            const response = await voteApi.list(Number(groupId));
            setVotes([...response.data.result].sort((a, b) => b.voteId - a.voteId));
            setExpandedId(null);
          }}
        />
      )}
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
