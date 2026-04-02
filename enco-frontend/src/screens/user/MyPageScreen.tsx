import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Text from '@/components/typography';
import { getProfileImage } from '../../types/images';
import { useAuthStore } from '../../store/useAuthStore';
import { GetMyPage } from '../../services/userService';
import { clearTokens, clearDeviceToken } from '../../utils/tokenStorage';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MyPageNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyPageScreen() {
  const navigation = useNavigation<MyPageNavigationProp>();
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);
  const logout = useAuthStore(s => s.logout);

  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      GetMyPage()
        .then(({ result }) => setProfile(result))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [setProfile]),
  );

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          await clearDeviceToken();
          logout();
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-[#F0F4FF] justify-center">
        <ActivityIndicator size="large" color="#1428A0" />
        <Text variant="bodySm" color="muted" className="mt-3">
          프로필 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="px-5 pt-14 pb-3 flex-row items-center justify-between">
          <Text variant="bodyLg" weight="bold" color="dark">
            마이페이지
          </Text>
          <Pressable onPress={() => navigation.navigate('EditMyPage')}>
            <Text variant="bodyMd" color="brand">
              수정
            </Text>
          </Pressable>
        </View>

        {/* 프로필 이미지 */}
        <View className="items-center mt-6 mb-9">
          <View className="h-[120px] w-[120px] rounded-[60px] overflow-hidden border-[3px] border-[#C7D2FE] bg-[#EEF2FF]">
            <Image
              source={getProfileImage(profile?.profileUrl)}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {/* 이름 표시 */}
          <Text variant="bodyLg" weight="bold" color="dark" className="mt-4">
            {profile?.name ?? '사용자'}
          </Text>
        </View>

        {/* 기본 정보 섹션 */}
        <View className="px-5 gap-3">
          <InfoCard title="기본정보">
            <InfoRow label="이메일" value={profile?.email ?? '-'} />
            <Divider />
            <InfoRow label="휴대폰번호" value={profile?.phoneNumber ?? '-'} />
            <Divider />
            <InfoRow label="생년월일" value={profile?.birthDay ?? '-'} />
            <Divider />
            <InfoRow
              label="성별"
              value={profile?.gender === 'M' ? '남성' : '여성'}
            />
          </InfoCard>

          {/* 집 주소 섹션 */}
          <InfoCard title="집 주소">
            {profile?.address ? (
              <InfoRow label="주소" value={profile.address} />
            ) : (
              <Text variant="bodySm" color="placeholder" align="center">
                등록된 주소가 없어요{'\n'}
                <Text variant="tiny" color="#C7D2FE">
                  수정을 눌러 추가할 수 있어요
                </Text>
              </Text>
            )}
          </InfoCard>
        </View>

        {/* 로그아웃 버튼 */}
        <View className="mt-8 px-5">
          <Pressable
            onPress={handleLogout}
            className="bg-[#FFD6D6] rounded-[28px] h-14 justify-center items-center"
          >
            <Text weight="bold" color="#D44">
              로그아웃
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white rounded-[20px] px-5 py-4 gap-2.5 "
      style={{
        shadowColor: '#1428A0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text variant="caption" color="placeholder" className="mb-0.5">
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text variant="bodySm" color="muted">
        {label}
      </Text>
      <Text variant="bodySm" weight="bold" color="dark">
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-[#F3F4F6]" />;
}
