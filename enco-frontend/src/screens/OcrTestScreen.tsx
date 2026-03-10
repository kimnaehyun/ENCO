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

const {OcrModule} = NativeModules;

export default function OcrTestScreen() {
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
});