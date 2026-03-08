import React, { useEffect, useMemo, useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVotes, Vote } from '../../contexts/VotesContext';
import { GroupStackParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupVotes'>;

const formatKRW = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const choiceColor = (choice: Vote['myChoice']) => {
  if (choice === 'agree') return '#6C84FF';
  if (choice === 'disagree') return '#FF6B6B';
  return '#B0B0B0';
};

export default function GroupVotesScreen({ navigation, route }: Props) {
  const { votes } = useVotes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const sortedVotes = useMemo(() => {
    const allVoted = votes.length > 0 && votes.every(v => v.myChoice !== null);
    const byCreatedAtDesc = (a: Vote, b: Vote) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    if (allVoted) return [...votes].sort(byCreatedAtDesc);

    return [...votes].sort((a, b) => {
      const aVoted = a.myChoice !== null;
      const bVoted = b.myChoice !== null;
      if (aVoted !== bVoted) return aVoted ? 1 : -1; // 미참여가 위
      return byCreatedAtDesc(a, b);
    });
  }, [votes]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: Vote }) => {
    const isExpanded = expandedId === item.id;
    const dimmed = item.myChoice !== null;

    return (
      <View style={[styles.card, dimmed && styles.cardDimmed]}>
        <Pressable onPress={() => toggleExpand(item.id)} style={styles.rowBetween}>
          <Text numberOfLines={1} style={styles.titleLine}>
            {item.title} {formatKRW(item.amount)} {item.currentParticipants}/{item.totalParticipants}
          </Text>

          {/* ✅ 내가 투표했다면 파란/빨간 점으로 표시 */}
          <View style={styles.rightArea}>
            <View style={[styles.choiceDot, { backgroundColor: choiceColor(item.myChoice) }]} />
            <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </Pressable>

        {isExpanded && (
          <View style={styles.expandedArea}>
            <Text style={styles.subTitle} numberOfLines={2}>{item.subTitle}</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.metaLabel}>투표인원</Text>
              <Text style={styles.metaValue}>
                {item.currentParticipants}/{item.totalParticipants}
              </Text>
            </View>

            <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>

            {/* ✅ 상세보기 버튼 */}
            <Pressable
              onPress={() =>
                navigation.navigate(ROUTES.GROUP_VOTE_DETAIL as any, {
                  voteId: item.id,
                  groupId,
                  groupName,
                })
              }
              style={styles.detailBtn}
            >
              <Text style={styles.detailBtnText}>상세보기</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>투표 목록</Text>
      </View>

      <FlatList
        data={sortedVotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 18, paddingTop: 18 },
  headerPill: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  headerText: { fontSize: 18, fontWeight: '700' },

  card: { backgroundColor: '#D9D9D9', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14 },
  cardDimmed: { opacity: 0.45 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleLine: { fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 8 },

  rightArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  choiceDot: { width: 10, height: 10, borderRadius: 5 },
  chevron: { fontSize: 12, fontWeight: '800' },

  expandedArea: { marginTop: 10, gap: 10 },
  subTitle: { fontSize: 14, fontWeight: '600' },

  metaLabel: { fontSize: 14, fontWeight: '700' },
  metaValue: { fontSize: 14, fontWeight: '700' },

  desc: { fontSize: 13, lineHeight: 18 },

  detailBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
});