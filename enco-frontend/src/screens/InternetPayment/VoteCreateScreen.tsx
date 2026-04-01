// src/screens/group/GroupVoteCreateScreen.tsx
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import Header from '../../components/internet/Header';
import KeyValueRow from '../../components/common/KeyValueRow';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type VoteCreateNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VoteCreateScreen'
>;
type VoteCreateRouteProp = RouteProp<RootStackParamList, 'VoteCreateScreen'>;

export default function VoteCreateScreen() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const navigation = useNavigation<VoteCreateNavigationProp>();
  const route = useRoute<VoteCreateRouteProp>();
  const params = route.params ?? {};
  const onPressDone = () => {
    if (!title) return Alert.alert('확인', '제목을 입력해주세요');

    return navigation.navigate('PaymentPinScreen', {
      groupId: params.groupId,
      cardId: params.cardId,
      title,
      description,
      amount: params.amount,
      storeName: params.storeName,
    });
  };

  return (
    <ScreenLayout className="gap-4">
      {/* 헤더 */}
      <Header title="투표 생성" />

      {/* 입력 폼 */}
      <View className="gap-3">
        {/* 투표 제목 */}
        <View className="bg-white rounded-[20px] px-5 py-4">
          <KeyValueRow title="투표 제목">
            <TextInput
              placeholder="제목을 입력해주세요"
              value={title}
              onChangeText={setTitle}
              className="flex-1 text-right text-xl ml-10 p-0 "
              maxLength={20}
            />
          </KeyValueRow>
        </View>

        {/* 금액 */}
        <View className="bg-white rounded-3xl px-5 py-4">
          <KeyValueRow title="금액">
            <Text className="font-bold text-[20px]">{params.amount}원</Text>
          </KeyValueRow>
        </View>

        {/* 가맹점명 */}
        <View className="bg-white rounded-3xl px-5 py-4">
          <KeyValueRow title="가맹점명">
            <Text className="font-bold text-[20px]">{params.storeName}</Text>
          </KeyValueRow>
        </View>

        {/* 설명 */}
        <View className="bg-white rounded-3xl px-5 py-4">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="설명"
            placeholderTextColor="#9CA3AF"
            className="text-[#111827] h-[120px] align-top"
            multiline
          />
        </View>
      </View>

      {/* 투표 시작 버튼 */}
      <Pressable
        onPress={onPressDone}
        className="rounded-3xl items-center justify-center mt-6 bg-[#1428A0] h-14"
      >
        <Text className="text-white">투표 생성</Text>
      </Pressable>

      {/* 안내 문구 */}
      <Text className="text-center mt-4 text-sm text-[#9CA3AF] font-medium leading-5">
        한번 생성한 투표는{'\n'}삭제가 불가능합니다
      </Text>
    </ScreenLayout>
  );
}
