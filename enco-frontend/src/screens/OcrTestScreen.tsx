import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  NativeModules,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation, useRoute} from '@react-navigation/native';

const {OcrModule} = NativeModules;

type RouteParams = {
  groupName?: string;
  groupId?: string;
};

export default function OcrTestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel) return;

    if (result.errorCode) {
      Alert.alert('이미지 선택 실패', result.errorMessage || result.errorCode);
      return;
    }

    const asset = result.assets?.[0];
    const uri = asset?.uri;

    if (!uri) {
      Alert.alert('오류', '이미지 URI를 찾을 수 없습니다.');
      return;
    }

    setImageUri(uri);
    setOcrResult('');
  };

  const handleRunOcr = async () => {
    if (!imageUri) {
      Alert.alert('안내', '먼저 이미지를 선택하세요.');
      return;
    }

    try {
      setLoading(true);
      const text = await OcrModule.recognizeTextFromUri(imageUri);
      setOcrResult(text || '텍스트를 찾지 못했습니다.');
    } catch (error: any) {
      Alert.alert('OCR 실패', error?.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  // 정산 인원 선택으로 이동하는 공통 함수
  const goToSettleMemberSelect = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    navigation.navigate('SettleMemberSelect', {
      amount: 10000,
      storeName: '맥도날드',
      date: dateStr,
      memo: ocrResult,
      receiptUri: imageUri,
      groupName: params.groupName ?? '모임명',
      groupId: params.groupId,
      isNewSettle: true,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>영수증 OCR 테스트</Text>

      <Pressable style={styles.button} onPress={handlePickImage}>
        <Text style={styles.buttonText}>이미지 선택</Text>
      </Pressable>

      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>선택된 이미지 없음</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRunOcr}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'OCR 실행 중...' : 'OCR 실행'}
        </Text>
      </Pressable>

      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>OCR 결과</Text>
        <Text style={styles.resultText}>
          {ocrResult || '아직 결과 없음'}
        </Text>
      </View>

      {/* OCR 완료 후 정산 인원 선택으로 이동 */}
      <Pressable
        style={[styles.completeButton, !ocrResult && styles.buttonDisabled]}
        disabled={!ocrResult}
        onPress={goToSettleMemberSelect}
      >
        <Text style={styles.buttonText}>완료</Text>
      </Pressable>

      {/* 임시 건너뛰기 버튼 */}
      <Pressable
        style={styles.skipButton}
        onPress={goToSettleMemberSelect}
      >
        <Text style={styles.skipButtonText}>임시) OCR 없이 넘어가기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1428A0',
  },
  button: {
    backgroundColor: '#1428A0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  placeholder: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#777',
  },
  resultBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    minHeight: 180,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#222',
  },
  completeButton: {
    backgroundColor: '#1428A0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});