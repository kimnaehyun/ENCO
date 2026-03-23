import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native'
import Text from '@/components/typography';;
import { images } from '../../types/images';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchMyPage } from '../../services/userService';
import { clearTokens, clearDeviceToken } from '../../utils/tokenStorage';

export default function MyPageScreen({ navigation }: any) {
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);
  const logout = useAuthStore(s => s.logout);

  const [loading, setLoading] = useState(false);

  // 프로필이 store에 없으면 API 호출
  useEffect(() => {
    if (!profile) {
      setLoading(true);
      fetchMyPage()
        .then(data => setProfile(data))
        .catch(err => console.warn('마이페이지 조회 실패:', err))
        .finally(() => setLoading(false));
    }
  }, []);

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
      <View style={{ flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1428A0" />
        <Text variant="bodySm" color="muted"  style={{ marginTop: 12 }}>
          프로필 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 56,
            paddingBottom: 12,
          }}
        >
          <Text variant="bodyLg" weight="bold" color="dark" >
            마이페이지
          </Text>
          <Pressable onPress={() => navigation.navigate('EditAddress')}>
            <Text variant="bodyMd" color="brand" >
              수정
            </Text>
          </Pressable>
        </View>

        {/* 프로필 이미지 */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 36 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: '#C7D2FE',
              backgroundColor: '#EEF2FF',
            }}
          >
            <Image
              source={images.user}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          {/* 이름 표시 */}
          <Text variant="bodyLg" weight="bold" color="dark"
            
           style={{ marginTop: 16 }}>
            {profile?.name ?? '사용자'}
          </Text>
          {profile?.gender && (
            <Text variant="caption" color="placeholder"
              
             style={{ marginTop: 4 }}>
              {profile.gender === 'M' ? '남성' : '여성'} · {profile.birthDay ?? ''}
            </Text>
          )}
        </View>

        {/* 기본 정보 섹션 */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <InfoCard title="기본정보">
            <InfoRow label="이름" value={profile?.name ?? '-'} />
            <Divider />
            <InfoRow label="이메일" value={profile?.email ?? '-'} />
            <Divider />
            <InfoRow label="휴대폰번호" value={profile?.phoneNumber ?? '-'} />
            <Divider />
            <InfoRow label="생년월일" value={profile?.birthDay ?? '-'} />
          </InfoCard>

          {/* 집 주소 섹션 */}
          <InfoCard title="집 주소">
            {profile?.address ? (
              <InfoRow label="주소" value={profile.address} />
            ) : (
              <Text variant="bodySm" color="placeholder" align="center"
                
              >
                등록된 주소가 없어요{'\n'}
                <Text style={{ fontSize: 12, color: '#C7D2FE' }}>수정을 눌러 추가할 수 있어요</Text>
              </Text>
            )}
          </InfoCard>
        </View>

        {/* 로그아웃 버튼 */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: '#FFD6D6',
              borderRadius: 28,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text weight="bold" color='#D44' >
              로그아웃
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
        shadowColor: '#1428A0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text variant="caption" color="placeholder"  style={{ marginBottom: 2 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="bodySm" color="muted" >
        {label}
      </Text>
      <Text variant="bodySm" weight="bold" color="dark" >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />;
}