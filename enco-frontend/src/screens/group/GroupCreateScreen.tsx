import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { ROUTES } from '../../constants/routes';

const TAG_OPTIONS = ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'];

export default function GroupCreateScreen() {
  const navigation = useNavigation<any>();

  // TODO: 나중에 로그인 유저 정보로 교체
  const manager = useMemo(
    () => ({
      name: '나기',
      email: 'test@test.com',
      phone: '010-1234-5678',
    }),
    []
  );

  const [captainConfirmed, setCaptainConfirmed] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupNameConfirmed, setGroupNameConfirmed] = useState(false);

  const [address, setAddress] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canConfirmGroupName = groupName.trim().length > 0;
  const canConfirmAddress = address.trim().length > 0;
  const canGoNext = selectedTags.length > 0;

  const handleConfirmCaptain = () => {
    setCaptainConfirmed(true);
  };

  const handleConfirmGroupName = () => {
    if (!canConfirmGroupName) {
      Alert.alert('안내', '모임명을 입력해주세요.');
      return;
    }
    setGroupNameConfirmed(true);
  };

  const handleConfirmAddress = () => {
    if (!canConfirmAddress) {
      Alert.alert('안내', '집 주소를 입력해주세요.');
      return;
    }
    setAddressConfirmed(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => {
  if (!canGoNext) {
    Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
    return;
  }
  console.log('GROUP_CARD_RECOMMEND =', ROUTES.GROUP_CARD_RECOMMEND);
  navigation.navigate(ROUTES.GROUP_CARD_RECOMMEND as any, {
    groupName,
    address,
    tags: selectedTags,
  });
};
  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>모임통장 개설하기</Text>

        {/* 총무 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>총무 정보(자동 입력)</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>이름: {manager.name}</Text>
            <Text style={styles.infoText}>이메일: {manager.email}</Text>
            <Text style={styles.infoText}>전화번호: {manager.phone}</Text>
          </View>

          {!captainConfirmed ? (
            <Pressable style={styles.primaryButton} onPress={handleConfirmCaptain}>
              <Text style={styles.primaryButtonText}>확인</Text>
            </Pressable>
          ) : (
            <View style={styles.confirmedBox}>
              <Text style={styles.confirmedText}>확인 완료</Text>
            </View>
          )}
        </View>

        {/* 모임명 */}
        {captainConfirmed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>모임명</Text>

            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="모임명을 입력해주세요"
              placeholderTextColor="#9CA3AF"
              editable={!groupNameConfirmed}
              style={[
                styles.input,
                groupNameConfirmed && styles.inputDisabled,
              ]}
            />

            {!groupNameConfirmed ? (
              <Pressable
                style={[
                  styles.primaryButton,
                  !canConfirmGroupName && styles.primaryButtonDisabled,
                ]}
                onPress={handleConfirmGroupName}
              >
                <Text style={styles.primaryButtonText}>확인</Text>
              </Pressable>
            ) : (
              <View style={styles.confirmedBox}>
                <Text style={styles.confirmedText}>확인 완료</Text>
              </View>
            )}
          </View>
        )}

        {/* 주소 */}
        {groupNameConfirmed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>집 주소</Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="집 주소를 입력해주세요"
              placeholderTextColor="#9CA3AF"
              editable={!addressConfirmed}
              style={[
                styles.input,
                addressConfirmed && styles.inputDisabled,
              ]}
            />

            {!addressConfirmed ? (
              <Pressable
                style={[
                  styles.primaryButton,
                  !canConfirmAddress && styles.primaryButtonDisabled,
                ]}
                onPress={handleConfirmAddress}
              >
                <Text style={styles.primaryButtonText}>확인</Text>
              </Pressable>
            ) : (
              <View style={styles.confirmedBox}>
                <Text style={styles.confirmedText}>확인 완료</Text>
              </View>
            )}
          </View>
        )}

        {/* 태그 */}
        {addressConfirmed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>모임 성향(옵션 태그)</Text>

            <View style={styles.tagContainer}>
              {TAG_OPTIONS.map((tag) => {
                const selected = selectedTags.includes(tag);

                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      styles.tagButton,
                      selected && styles.tagButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagButtonText,
                        selected && styles.tagButtonTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.helperText}>중복 선택 가능</Text>

            <Pressable
              style={[
                styles.primaryButton,
                !canGoNext && styles.primaryButtonDisabled,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>카드 추천받기</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  inputDisabled: {
    color: '#6B7280',
  },
  primaryButton: {
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  confirmedBox: {
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    minWidth: '30%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagButtonSelected: {
    backgroundColor: '#D1D5DB',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tagButtonTextSelected: {
    color: '#111827',
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});