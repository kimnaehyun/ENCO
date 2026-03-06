import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GroupStackParamList } from '../../navigation/GroupStackNavigator';
import { useVotes, VoteChoice } from '../../contexts/VotesContext';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupVoteDetail'>;

const formatKRW = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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
        <Text style={{ fontSize: 16, fontWeight: '700' }}>투표 정보를 찾을 수 없습니다.</Text>
        <Pressable onPress={() => navigation.goBack()} style={[styles.smallBtn, { marginTop: 12 }]}>
          <Text style={styles.smallBtnText}>뒤로가기</Text>
        </Pressable>
      </View>
    );
  }

  const onVote = (choice: VoteChoice) => {
    vote(voteId, choice);
    navigation.goBack(); // ✅ 투표 후 목록으로 복귀(목록 자동 반영)
  };

  const isAgree = data.myChoice === 'agree';
  const isDisagree = data.myChoice === 'disagree';

  return (
    <View style={styles.container}>
      <View style={styles.pill}><Text style={styles.pillText}>{data.title}</Text></View>
      <View style={styles.pill}><Text style={styles.pillText}>{data.subTitle}</Text></View>
      <View style={styles.pill}><Text style={styles.pillText}>금액 {formatKRW(data.amount)}</Text></View>

      <View style={[styles.pill, styles.descBox]}>
        <Text style={styles.descText}>{data.description}</Text>
      </View>

      <View style={styles.pill}><Text style={styles.pillText}>남은 마감 시간</Text></View>
      <View style={styles.pill}><Text style={styles.pillText}>{remainText}</Text></View>

      <View style={styles.pill}>
        <Text style={styles.pillText}>
          투표 인원 {data.currentParticipants}/{data.totalParticipants}
        </Text>
      </View>

      <View style={styles.btnRow}>
        <Pressable
          onPress={() => onVote('agree')}
          style={[styles.voteBtn, styles.agreeBtn, isAgree && styles.selected]}
        >
          <Text style={styles.voteBtnText}>찬성</Text>
        </Pressable>

        <Pressable
          onPress={() => onVote('disagree')}
          style={[styles.voteBtn, styles.disagreeBtn, isDisagree && styles.selected]}
        >
          <Text style={styles.voteBtnText}>반대</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 18, paddingTop: 18, gap: 12 },

  pill: { backgroundColor: '#D9D9D9', borderRadius: 26, paddingVertical: 12, paddingHorizontal: 16 },
  pillText: { fontSize: 16, fontWeight: '700' },

  descBox: { borderRadius: 18, paddingVertical: 14 },
  descText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginTop: 8 },
  voteBtn: { flex: 1, borderRadius: 22, paddingVertical: 14, alignItems: 'center' },
  agreeBtn: { backgroundColor: '#B9C4FF' },
  disagreeBtn: { backgroundColor: '#FFB3B3' },
  selected: { transform: [{ scale: 1.02 }] },

  voteBtnText: { fontSize: 16, fontWeight: '900' },

  smallBtn: { backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16 },
  smallBtnText: { fontWeight: '800' },
});