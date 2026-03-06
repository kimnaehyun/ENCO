// src/screens/group/GroupVoteCreateScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { useVotes } from '../../contexts/VotesContext';

type Params = { groupId?: string; groupName?: string };

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

export default function GroupVoteCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  const { createVote } = useVotes(); // ✅ 아래 주의 참고
  const groupName = params.groupName ?? '모임명';

  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [endsAtText, setEndsAtText] = useState('');

  const onPressDone = () => {
    const amount = parseInt(digitsOnly(amountText), 10);

    if (!title.trim()) return Alert.alert('확인', '의제를 입력해주세요.');
    if (!amount || amount <= 0) return Alert.alert('확인', '금액을 입력해주세요.');
    if (!description.trim()) return Alert.alert('확인', '설명을 입력해주세요.');

    // ✅ 임시 생성: VotesContext에 createVote만 있으면 바로 삽입됨
    createVote({
      title: title.trim(),
      subTitle: `${title.trim()} 결제 승인`,
      amount,
      description: description.trim(),
      endsAt: endsAtText.trim() || undefined,
      totalParticipants: 4, // 임시
    });

    Alert.alert('완료', '투표가 생성되었습니다(임시).', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenLayout>
        <View style={styles.headerPill}>
          <Text style={styles.headerText}>투표 제의</Text>
        </View>

        <View style={{ marginTop: 14, gap: 14 }}>
          <View style={styles.box}>
            <Text style={styles.label}>의제</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예) 보일링 씨푸드 결제 승인"
              placeholderTextColor="#6B7280"
              style={styles.input}
            />
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>금액</Text>
            <TextInput
              value={amountText}
              onChangeText={t => setAmountText(digitsOnly(t))}
              keyboardType="number-pad"
              placeholder="숫자만 입력"
              placeholderTextColor="#6B7280"
              style={styles.input}
            />
          </View>

          <View style={[styles.box, { minHeight: 170 }]}>
            <Text style={styles.label}>설명</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="예) 회식 비용 결제건으로 투표를 받습니다."
              placeholderTextColor="#6B7280"
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              multiline
            />
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>마감 시간</Text>
            <TextInput
              value={endsAtText}
              onChangeText={setEndsAtText}
              placeholder="예) 2026-03-10 18:00 (임시)"
              placeholderTextColor="#6B7280"
              style={styles.input}
            />
          </View>

          <Pressable onPress={onPressDone} style={styles.doneBtn} hitSlop={10}>
            <Text style={styles.doneText}>완료</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={{ textAlign: 'center', fontWeight: '800' }}>닫기</Text>
          </Pressable>

          <Text style={{ textAlign: 'center', color: '#6B7280' }}>
            {groupName} / {params.groupId ?? 'groupId 없음'}
          </Text>
        </View>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerPill: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerText: { fontSize: 18, fontWeight: '800' },

  box: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: { fontSize: 14, fontWeight: '900', marginBottom: 10 },
  input: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
  },

  doneBtn: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { fontSize: 16, fontWeight: '900' },
});