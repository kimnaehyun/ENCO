import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Pressable,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Text from '@/components/typography';
import { useAuthStore } from '../../store/useAuthStore';
import { EditMyPage } from '../../services/userService';
import { getProfileImage } from '../../types/images';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type EditMyPageNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type EditMyPagePayload = {
  profileUrl: number;
  phoneNumber?: string;
  address?: string;
};

const PROFILE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

export default function EditMyPageScreen() {
  const navigation = useNavigation<EditMyPageNavigationProp>();
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);

  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [profileUrl, setProfileUrl] = useState(
    Number(profile?.profileUrl) || 1,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedAddress = address.trim();

    // phoneNumber, address가 비어있으면 payload에서 제외
    const payload: EditMyPagePayload = { profileUrl };
    if (trimmedPhoneNumber) payload.phoneNumber = trimmedPhoneNumber;
    if (trimmedAddress) payload.address = trimmedAddress;

    setSaving(true);
    try {
      const { result } = await EditMyPage(payload);
      setProfile(result);

      Alert.alert('완료', '내 정보가 수정되었어요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || '내 정보 수정에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
            <Pressable onPress={() => navigation.goBack()}>
              <Text variant="bodyMd" color="muted">
                취소
              </Text>
            </Pressable>
            <Text weight="bold" color="dark" className="text-lg">
              내 정보 수정
            </Text>
            <View className="w-[30px]" />
          </View>

          {/* 입력 영역 */}
          <View className="px-5 mt-8">
            <Text variant="caption" color="placeholder" className="mb-2.5">
              프로필 이미지
            </Text>

            <View
              className="bg-white rounded-[20px] px-4 py-4.5 mb-6"
              style={{
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="items-center mb-4">
                <Image
                  source={getProfileImage(profileUrl)}
                  className="w-[88px] h-[88px] rounden-[44px] "
                  resizeMode="cover"
                />
              </View>

              <View className="flex-row flex-wrap justify-center gap-3">
                {PROFILE_OPTIONS.map(option => {
                  const selected = profileUrl === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setProfileUrl(option)}
                      style={{
                        borderWidth: selected ? 3 : 2,
                        borderColor: selected ? '#1428A0' : '#D1D5DB',
                        backgroundColor: selected ? '#EEF2FF' : '#FFFFFF',
                      }}
                      className="w-14 h-14 rounded-[28px] overflow-hidden "
                    >
                      <Image
                        source={getProfileImage(option)}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text variant="caption" color="placeholder" className="mb-2.5">
              휴대폰번호
            </Text>

            <View
              style={{
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
              className="bg-white rounded-2xl px-4 py-1 mb-6"
            >
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="예) 01012345678"
                placeholderTextColor="#C7D2FE"
                keyboardType="phone-pad"
                className="text-[#111827] text-sm py-3"
              />
            </View>

            <Text variant="caption" color="placeholder" className="mb-2.5">
              집 주소
            </Text>

            <View
              style={{
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
              className="bg-white rounded-2xl px-4 py-1"
            >
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="예) 서울시 강남구 테헤란로 212"
                placeholderTextColor="#C7D2FE"
                className="text-[#111827] text-sm py-3"
                autoFocus
              />
            </View>
          </View>

          {/* 저장 버튼 */}
          <View className="px-5 mt-auto pt-8">
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#A5B4FC' : '#1428A0',
              }}
              className="rounded-[28px] h-14 justify-center items-center"
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text weight="bold" color="white">
                  저장하기
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
