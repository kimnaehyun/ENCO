import React, { useState } from 'react';
import { Alert, ActivityIndicator, Pressable, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Text from '@/components/typography';;
import { useAuthStore } from '../../store/useAuthStore';
import { updateAddress } from '../../services/userService';

export default function EditAddressScreen({ navigation }: any) {
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);

  const [address, setAddress] = useState(profile?.address ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = address.trim();
    if (!trimmed) {
      Alert.alert('알림', '주소를 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await updateAddress({ address: trimmed });

      // store 갱신
      if (profile) {
        setProfile({ ...profile, address: trimmed });
      }

      Alert.alert('완료', '주소가 수정되었어요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || '주소 수정에 실패했습니다.';
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
              주소 수정
            </Text>
            <View style={{ width: 30 }} />
          </View>

          {/* 입력 영역 */}
          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
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
              <Text variant="bodyMd" color="dark"Input
                value={address}
                onChangeText={setAddress}
                placeholder="예) 서울시 강남구 테헤란로 212"
                placeholderTextColor="#C7D2FE"
                
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