import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { images } from '../../types/images';

export default function MyPageScreen({ navigation }: any) {
  const user = {
    name: '나기',
    nameEn: 'Nagi',
    phone: '010-1234-5678',
    email: 'nagi@example.com',
    address: '',
  };

  const handleLogout = () => {
    // TODO: 로그아웃 처리
  };

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
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            마이페이지
          </Text>
          <Pressable>
            <Text style={{ fontSize: 15, color: '#1428A0', fontFamily: 'GmarketSansTTFMedium' }}>
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
        </View>

        {/* 기본 정보 섹션 */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <InfoCard title="기본정보">
            <InfoRow label="이름" value={user.name} />
            <Divider />
            <InfoRow label="영문이름" value={user.nameEn} />
            <Divider />
            <InfoRow label="휴대폰번호" value={user.phone} />
            <Divider />
            <InfoRow label="이메일" value={user.email} />
          </InfoCard>

          {/* 집 주소 섹션 */}
          <InfoCard title="집 주소">
            {user.address ? (
              <InfoRow label="주소" value={user.address} />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: '#9CA3AF',
                  fontFamily: 'GmarketSansTTFMedium',
                  textAlign: 'center',
                  paddingVertical: 4,
                }}
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
            <Text style={{ fontSize: 16, color: '#D44', fontFamily: 'GmarketSansTTFBold' }}>
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
      <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 2 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />;
}