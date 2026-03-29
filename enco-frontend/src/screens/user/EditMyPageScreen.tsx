import React, { useState } from 'react';
import { Alert, ActivityIndicator, Image, Pressable, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Text from '@/components/typography';;
import { useAuthStore } from '../../store/useAuthStore';
import { EditMyPage } from '../../services/userService';
import { getProfileImage } from '../../types/images';

const PROFILE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

export default function EditMyPageScreen({ navigation }: any) {
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);

  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [profileUrl, setProfileUrl] = useState(Number(profile?.profileUrl) || 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedAddress = address.trim();

    // phoneNumber, address가 비어있으면 payload에서 제외
    const payload: any = { profileUrl };
    if (trimmedPhoneNumber) payload.phoneNumber = trimmedPhoneNumber;
    if (trimmedAddress) payload.address = trimmedAddress;

    setSaving(true);
    try {
      const { result } = await EditMyPage(payload);
      setProfile(result);

      Alert.alert('완료', '내 정보가 수정되었어요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || '내 정보 수정에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
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
            <Pressable onPress={() => navigation.goBack()}>
              <Text variant="bodyMd" color="muted" >
                취소
              </Text>
            </Pressable>
            <Text weight="bold" color="dark"  style={{ fontSize: 18 }}>
              내 정보 수정
            </Text>
            <View style={{ width: 30 }} />
          </View>

          {/* 입력 영역 */}
          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <Text variant="caption" color="placeholder" style={{ marginBottom: 10 }}>
              프로필 이미지
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 18,
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
                marginBottom: 24,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Image
                  source={getProfileImage(profileUrl)}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {PROFILE_OPTIONS.map(option => {
                  const selected = profileUrl === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setProfileUrl(option)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        overflow: 'hidden',
                        borderWidth: selected ? 3 : 2,
                        borderColor: selected ? '#1428A0' : '#D1D5DB',
                        backgroundColor: selected ? '#EEF2FF' : '#FFFFFF',
                      }}
                    >
                      <Image
                        source={getProfileImage(option)}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text variant="caption" color="placeholder" style={{ marginBottom: 10 }}>
              휴대폰번호
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 4,
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
                marginBottom: 24,
              }}
            >
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="예) 01012345678"
                placeholderTextColor="#C7D2FE"
                keyboardType="phone-pad"
                style={{ color: '#111827', fontSize: 15, paddingVertical: 12 }}
              />
            </View>

            <Text variant="caption" color="placeholder"
             style={{ marginBottom: 10 }}>
              집 주소
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 4,
                shadowColor: '#1428A0',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="예) 서울시 강남구 테헤란로 212"
                placeholderTextColor="#C7D2FE"
                style={{ color: '#111827', fontSize: 15, paddingVertical: 12 }}
                autoFocus
              />
            </View>
          </View>

          {/* 저장 버튼 */}
          <View style={{ paddingHorizontal: 20, marginTop: 'auto', paddingTop: 32 }}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#A5B4FC' : '#1428A0',
                borderRadius: 28,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text weight="bold" color="white" >
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