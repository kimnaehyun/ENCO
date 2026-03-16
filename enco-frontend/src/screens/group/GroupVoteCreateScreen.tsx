// src/screens/group/GroupVoteCreateScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { useVotes } from '../../contexts/VotesContext';
import { CommonParams } from '../../types/common';

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

export default function GroupVoteCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const { createVote } = useVotes();

  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');

  // 날짜/시간 피커 상태
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Android는 date → time 순서로 두 번 띄워야 함
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const onPressDateInput = () => {
    setShowDatePicker(true);
  };

  const onChangeDatePicker = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (!selected) return;
      // Android: 날짜 선택 후 시간 피커 이어서 띄움
      setPendingDate(selected);
      setShowTimePicker(true);
    } else {
      // iOS: 인라인으로 실시간 반영
      if (selected) setEndsAt(selected);
    }
  };

  const onChangeTimePicker = (_: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (!selected || !pendingDate) return;
    // 날짜 + 시간 합치기
    const combined = new Date(pendingDate);
    combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setEndsAt(combined);
    setPendingDate(null);
  };

  const onPressDone = () => {
    const amount = parseInt(digitsOnly(amountText), 10);
    if (!title.trim()) return Alert.alert('확인', '투표 제목을 입력해주세요.');
    if (!amount || amount <= 0) return Alert.alert('확인', '금액을 입력해주세요.');
    if (!description.trim()) return Alert.alert('확인', '설명을 입력해주세요.');

    createVote({
      title: title.trim(),
      subTitle: `${title.trim()} 결제 승인`,
      amount,
      description: description.trim(),
      endsAt: endsAt ? endsAt.toISOString() : undefined,
      totalParticipants: 4,
    });

    Alert.alert('완료', '투표가 생성되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenLayout>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* 헤더 */}
          <View className="flex-row items-center gap-3 mb-6">
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
            </Pressable>
            <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              투표 생성
            </Text>
          </View>

          {/* 입력 폼 */}
          <View className="gap-3">

            {/* 투표 제목 */}
            <View
              className="bg-white rounded-3xl px-5 py-4"
              style={{ shadowColor: '#1428A0', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="투표 제목"
                placeholderTextColor="#9CA3AF"
                style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}
              />
            </View>

            {/* 금액 */}
            <View
              className="bg-white rounded-3xl px-5 py-4"
              style={{ shadowColor: '#1428A0', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
            >
              <TextInput
                value={amountText}
                onChangeText={t => setAmountText(digitsOnly(t))}
                keyboardType="number-pad"
                placeholder="금액"
                placeholderTextColor="#9CA3AF"
                style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}
              />
            </View>

            {/* 설명 */}
            <View
              className="bg-white rounded-3xl px-5 py-4"
              style={{ minHeight: 160, shadowColor: '#1428A0', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="설명"
                placeholderTextColor="#9CA3AF"
                style={{
                  fontSize: 15,
                  color: '#111827',
                  fontFamily: 'GmarketSansTTFMedium',
                  height: 120,
                  textAlignVertical: 'top',
                }}
                multiline
              />
            </View>

            {/* 마감 날짜 */}
            <Pressable
              onPress={onPressDateInput}
              className="bg-white rounded-3xl px-5 py-4 flex-row items-center justify-between"
              style={{ shadowColor: '#1428A0', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
            >
              <Text style={{
                fontSize: 15,
                fontFamily: 'GmarketSansTTFMedium',
                color: endsAt ? '#111827' : '#9CA3AF',
              }}>
                {endsAt ? formatDate(endsAt) : '마감 날짜 선택'}
              </Text>
              <Text style={{ fontSize: 18 }}>📅</Text>
            </Pressable>

            {/* iOS 인라인 DateTimePicker */}
            {Platform.OS === 'ios' && showDatePicker && (
              <View
                className="bg-white rounded-3xl overflow-hidden"
                style={{ shadowColor: '#1428A0', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
              >
                <DateTimePicker
                  value={endsAt ?? new Date()}
                  mode="datetime"
                  display="inline"
                  onChange={onChangeDatePicker}
                  minimumDate={new Date()}
                  locale="ko-KR"
                />
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="items-center py-3 border-t border-gray-100"
                >
                  <Text style={{ fontSize: 15, color: '#1428A0', fontFamily: 'GmarketSansTTFBold' }}>
                    확인
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Android 날짜 피커 */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={endsAt ?? new Date()}
                mode="date"
                display="default"
                onChange={onChangeDatePicker}
                minimumDate={new Date()}
              />
            )}

            {/* Android 시간 피커 */}
            {Platform.OS === 'android' && showTimePicker && pendingDate && (
              <DateTimePicker
                value={pendingDate}
                mode="time"
                display="default"
                onChange={onChangeTimePicker}
              />
            )}
          </View>

          {/* 투표 시작 버튼 */}
          <Pressable
            onPress={onPressDone}
            className="rounded-3xl items-center justify-center mt-6"
            style={{ height: 56, backgroundColor: '#1428A0' }}
          >
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#fff' }}>
              투표 시작
            </Text>
          </Pressable>

          {/* 안내 문구 */}
          <Text
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: 13,
              color: '#9CA3AF',
              fontFamily: 'GmarketSansTTFMedium',
              lineHeight: 20,
            }}
          >
            한번 생성한 투표는{'\n'}삭제가 불가능합니다
          </Text>

        </ScrollView>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}