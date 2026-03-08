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
import { useVotes, Vote } from '../../contexts/VotesContext';
import { ROUTES } from '../../constants/routes';
import { GroupProps } from '../../types/group';

const formatKRW = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const choiceColor = (choice: Vote['myChoice']) => {
  if (choice === 'agree') return '#6C84FF';
  if (choice === 'disagree') return '#FF6B6B';
  return '#B0B0B0';
};

export default function GroupVotesScreen({ navigation, route }: GroupProps<'GroupVotes'>) {
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
    <ScreenLayout>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          투표 목록 {params.groupName ? `- ${params.groupName}` : ''}
        </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>닫기</Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 16,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ fontWeight: '800' }}>임시 투표 리스트</Text>
        <Text>- 1위: 오늘 회식 장소 정하기</Text>
        <Text>- 2위: 다음 모임 날짜 투표</Text>
        <Text>- 3위: 회비 인상 여부</Text>
      </View>
    </ScreenLayout>
  );
}