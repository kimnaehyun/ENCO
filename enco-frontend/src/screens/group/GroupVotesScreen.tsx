import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useVotes, Vote, VoteChoice } from '../../contexts/VotesContext';
import { ROUTES } from '../../constants/routes';
import { GroupProps } from '../../types/group';

const formatKRW = (n: number) => n.toLocaleString();

const isOngoing = (vote: Vote) => {
  if (!vote.endsAt) return vote.myChoice === null; // endsAt 없으면 미투표 = 진행중
  return new Date(vote.endsAt) > new Date();
};

export default function GroupVotesScreen({ navigation, route }: GroupProps<'GroupVotes'>) {
  const { votes, vote } = useVotes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const sortedVotes = useMemo(() => {
    return [...votes].sort((a, b) => {
      const aOngoing = isOngoing(a);
      const bOngoing = isOngoing(b);
      if (aOngoing !== bOngoing) return aOngoing ? -1 : 1; // 진행중이 위
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

  const renderItem = ({ item }: { item: Vote }) => {
    const ongoing = isOngoing(item);
    const isExpanded = expandedId === item.id;

    return (
      <View>
        <Pressable
          onPress={() => toggleExpand(item.id)}
          className="bg-white rounded-2xl px-5 py-4 flex-row items-center justify-between"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
        >
          {/* 상태 점 */}
          <View
            className="w-2.5 h-2.5 rounded-full mr-3"
            style={{ backgroundColor: ongoing ? '#EF4444' : '#818CF8' }}
          />

          {/* 제목 */}
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}
          >
            {item.title}
          </Text>

          {/* 참여 인원 */}
          <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginLeft: 8 }}>
            {item.currentParticipants} / {item.totalParticipants}
          </Text>
        </Pressable>

        {/* 확장 영역 */}
        {isExpanded && (
          <View
            className="bg-white rounded-2xl px-5 py-4 mt-1"
            style={{ shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
          >
            {/* 부제목 */}
            <Text style={{ fontSize: 14, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 4 }}>
              {item.subTitle}
            </Text>

            {/* 구분선 */}
            <View className="h-px bg-gray-100 my-2" />

            {/* 금액 / 마감 */}
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
              {formatKRW(item.amount)}원
            </Text>
            {item.endsAt && (
              <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginTop: 2 }}>
                마감 기간 {item.endsAt.replace('T', ' ').slice(0, 16)}
              </Text>
            )}

            {/* 진행 중 → 찬성/반대 버튼 */}
            {ongoing ? (
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  onPress={() => handleVote(item.id, 'agree')}
                  className="flex-1 rounded-2xl py-3 items-center justify-center"
                  style={{ backgroundColor: '#1428A0' }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#fff' }}>찬성</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleVote(item.id, 'disagree')}
                  className="flex-1 rounded-2xl py-3 items-center justify-center"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#fff' }}>반대</Text>
                </Pressable>
              </View>
            ) : (
              /* 종료된 투표 → 상세보기 */
              <View className="mt-4">
                <View className="flex-row gap-2 mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1428A0' }} />
                    <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
                      내 선택: {item.myChoice === 'agree' ? '찬성' : item.myChoice === 'disagree' ? '반대' : '미투표'}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    navigation.navigate(ROUTES.GROUP_VOTE_DETAIL as any, {
                      voteId: item.id,
                      groupId,
                      groupName,
                    })
                  }
                  className="self-end rounded-xl px-4 py-2"
                  style={{ backgroundColor: '#F3F4F6' }}
                >
                  <Text style={{ fontSize: 13, fontFamily: 'GmarketSansTTFBold', color: '#374151' }}>
                    상세보기
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <FlatList
        data={sortedVotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between mb-5">
            <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              투표 목록
            </Text>
            <Pressable
              onPress={() => navigation.navigate('GroupVoteCreate', { groupId, groupName })}
            >
              <Text style={{ fontSize: 14, color: '#1428A0', fontFamily: 'GmarketSansTTFMedium' }}>
                생성
              </Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}