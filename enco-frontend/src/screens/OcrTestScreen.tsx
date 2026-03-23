import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {requestReceiptOcr} from '../services/receiptService';
import {
  createEmptyReceiptDraft,
  type ReceiptDraft,
  type ReceiptItemDraft,
  type ReceiptOptionDraft,
} from '../types/receipt';

const {DocumentScanner} = NativeModules;

type DocumentScanResult = {
  status?: string;
  imageUris?: string[];
  firstImageUri?: string | null;
  pdfUri?: string | null;
};

type RouteParams = {
  imageUri?: string;
  groupName?: string;
  groupId?: string;
};

export default function OcrTestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const [imageUri, setImageUri] = useState<string | null>(params.imageUri ?? null);
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraft | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [rawResponseText, setRawResponseText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
    }
  }, [params.imageUri]);

  const hasVerifiedDraft = receiptDraft !== null;

  const lineItemSummary = useMemo(() => {
    if (!receiptDraft?.items.length) {
      return '';
    }

    return receiptDraft.items
      .map(item => {
        const quantity = item.quantity ?? 1;
        const amount = item.amount ?? item.unitPrice ?? 0;
        return `${item.name || '이름 없는 항목'} x${quantity} ${amount.toLocaleString()}원`;
      })
      .join(', ');
  }, [receiptDraft]);

  const createClientId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const parseNumberInput = (value: string): number | null => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return null;
    }

    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const updateDraftField = <K extends keyof ReceiptDraft>(
    field: K,
    value: ReceiptDraft[K],
  ) => {
    setReceiptDraft(prev => {
      const base = prev ?? createEmptyReceiptDraft();
      return {
        ...base,
        [field]: value,
      };
    });
  };

  const updateItemField = <K extends keyof ReceiptItemDraft>(
    itemId: string,
    field: K,
    value: ReceiptItemDraft[K],
  ) => {
    setReceiptDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? {
                ...item,
                [field]: value,
              }
            : item,
        ),
      };
    });
  };

  const updateOptionField = <K extends keyof ReceiptOptionDraft>(
    itemId: string,
    optionId: string,
    field: K,
    value: ReceiptOptionDraft[K],
  ) => {
    setReceiptDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.id !== itemId
            ? item
            : {
                ...item,
                options: item.options.map(option =>
                  option.id === optionId
                    ? {
                        ...option,
                        [field]: value,
                      }
                    : option,
                ),
              },
        ),
      };
    });
  };

  const addItem = () => {
    setReceiptDraft(prev => {
      const base = prev ?? createEmptyReceiptDraft();
      return {
        ...base,
        items: [
          ...base.items,
          {
            id: createClientId('item'),
            name: '',
            unitPrice: null,
            quantity: 1,
            amount: null,
            options: [],
          },
        ],
      };
    });
  };

  const removeItem = (itemId: string) => {
    setReceiptDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
      };
    });
  };

  const addOption = (itemId: string) => {
    setReceiptDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.id !== itemId
            ? item
            : {
                ...item,
                options: [
                  ...item.options,
                  {
                    id: createClientId('option'),
                    name: '',
                    unitPrice: null,
                    quantity: 1,
                    amount: null,
                  },
                ],
              },
        ),
      };
    });
  };

  const removeOption = (itemId: string, optionId: string) => {
    setReceiptDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.id !== itemId
            ? item
            : {
                ...item,
                options: item.options.filter(option => option.id !== optionId),
              },
        ),
      };
    });
  };

  const formatSettlementDate = (paidAt: string) => {
    if (!paidAt) {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    const isoPrefix = paidAt.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(isoPrefix)
      ? isoPrefix
      : isoPrefix.replace(/\./g, '-');
  };

  const resetReceiptAnalysis = (uri: string | null) => {
    setImageUri(uri);
    setReceiptDraft(null);
    setStatusMessage('');
    setRawResponseText('');
  };

  const handleStartDocumentScan = async () => {
    if (!DocumentScanner?.startDocumentScan) {
      Alert.alert('문서 스캔 사용 불가', 'Document Scanner 네이티브 모듈을 찾을 수 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const result = (await DocumentScanner.startDocumentScan()) as DocumentScanResult;
      const uri = result?.firstImageUri ?? result?.imageUris?.[0] ?? null;

      if (!uri) {
        Alert.alert('안내', '스캔 결과 이미지를 찾을 수 없습니다.');
        return;
      }

      resetReceiptAnalysis(uri);
      setStatusMessage('스캔이 완료되었습니다. OCR을 실행해 주세요.');
    } catch (error: any) {
      if (error?.code === 'DOCUMENT_SCAN_CANCELLED') {
        return;
      }

      Alert.alert(
        '문서 스캔 실패',
        error?.message || '문서 스캔을 시작하지 못했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePickImageFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('이미지 선택 실패', result.errorMessage || result.errorCode);
        return;
      }

      const uri = result.assets?.[0]?.uri ?? null;
      if (!uri) {
        Alert.alert('안내', '선택한 이미지 URI를 찾을 수 없습니다.');
        return;
      }

      resetReceiptAnalysis(uri);
      setStatusMessage('갤러리에서 이미지를 선택했습니다. OCR을 실행해 주세요.');
    } catch (error: any) {
      Alert.alert(
        '갤러리 선택 실패',
        error?.message || '이미지를 불러오지 못했습니다.',
      );
    }
  };

  const handleRunOcr = async () => {
    if (!imageUri) {
      Alert.alert('안내', '먼저 스캔본을 선택하세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await requestReceiptOcr({
        imageUri,
        groupId: params.groupId,
      });
      setReceiptDraft(response.receipt);
      setStatusMessage(response.message);
      setRawResponseText(JSON.stringify(response.rawResponse, null, 2));
    } catch (error: any) {
      Alert.alert(
        'OCR 실패',
        error?.response?.data?.message || error?.message || '알 수 없는 오류',
      );
    } finally {
      setLoading(false);
    }
  };

  const goToSettleMemberSelect = () => {
    if (!receiptDraft) {
      Alert.alert('안내', '먼저 영수증을 분석하고 내용을 검증하세요.');
      return;
    }

    if (!receiptDraft.merchantName.trim()) {
      Alert.alert('안내', '가맹점명을 확인해 주세요.');
      return;
    }

    if (!receiptDraft.totalAmount || receiptDraft.totalAmount <= 0) {
      Alert.alert('안내', '총 결제 금액을 확인해 주세요.');
      return;
    }

    navigation.navigate('SettleMemberSelect', {
      amount: receiptDraft.totalAmount,
      storeName: receiptDraft.merchantName,
      date: formatSettlementDate(receiptDraft.paidAt),
      memo: lineItemSummary || statusMessage || '영수증 검증 완료',
      receiptUri: imageUri,
      receiptDraft,
      groupName: params.groupName ?? '모임명',
      groupId: params.groupId,
      isNewSettle: true,
    });
  };

  const handleSkipNext = () => {
    const fallbackDate = formatSettlementDate(receiptDraft?.paidAt ?? '');

    navigation.navigate('SettleMemberSelect', {
      amount: receiptDraft?.totalAmount ?? 0,
      storeName: receiptDraft?.merchantName || '영수증 확인 필요',
      date: fallbackDate,
      memo: lineItemSummary || statusMessage || '영수증 검증 전 임시 이동',
      receiptUri: imageUri,
      receiptDraft,
      groupName: params.groupName ?? '모임명',
      groupId: params.groupId,
      isNewSettle: true,
    });
  };

  const renderOptionEditor = (itemId: string, option: ReceiptOptionDraft) => (
    <View key={option.id} style={styles.optionCard}>
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>옵션</Text>
        <Pressable onPress={() => removeOption(itemId, option.id)}>
          <Text style={styles.deleteText}>삭제</Text>
        </Pressable>
      </View>

      <TextInput
        value={option.name}
        onChangeText={value => updateOptionField(itemId, option.id, 'name', value)}
        placeholder="옵션명"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <View style={styles.inlineRow}>
        <TextInput
          value={option.unitPrice?.toString() ?? ''}
          onChangeText={value =>
            updateOptionField(itemId, option.id, 'unitPrice', parseNumberInput(value))
          }
          placeholder="단가"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
        <TextInput
          value={option.quantity?.toString() ?? ''}
          onChangeText={value =>
            updateOptionField(itemId, option.id, 'quantity', parseNumberInput(value))
          }
          placeholder="수량"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
        <TextInput
          value={option.amount?.toString() ?? ''}
          onChangeText={value =>
            updateOptionField(itemId, option.id, 'amount', parseNumberInput(value))
          }
          placeholder="금액"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
      </View>
    </View>
  );

  const renderItemEditor = (item: ReceiptItemDraft) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>품목</Text>
        <Pressable onPress={() => removeItem(item.id)}>
          <Text style={styles.deleteText}>삭제</Text>
        </Pressable>
      </View>

      <TextInput
        value={item.name}
        onChangeText={value => updateItemField(item.id, 'name', value)}
        placeholder="품목명"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <View style={styles.inlineRow}>
        <TextInput
          value={item.unitPrice?.toString() ?? ''}
          onChangeText={value =>
            updateItemField(item.id, 'unitPrice', parseNumberInput(value))
          }
          placeholder="단가"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
        <TextInput
          value={item.quantity?.toString() ?? ''}
          onChangeText={value =>
            updateItemField(item.id, 'quantity', parseNumberInput(value))
          }
          placeholder="수량"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
        <TextInput
          value={item.amount?.toString() ?? ''}
          onChangeText={value =>
            updateItemField(item.id, 'amount', parseNumberInput(value))
          }
          placeholder="금액"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={[styles.input, styles.inlineInput]}
        />
      </View>

      {item.options.map(option => renderOptionEditor(item.id, option))}

      <Pressable style={styles.subtleButton} onPress={() => addOption(item.id)}>
        <Text style={styles.subtleButtonText}>옵션 추가</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>영수증 OCR 검증</Text>
      <Text style={styles.description}>
        ML Kit 스캔 결과 이미지를 백엔드로 올리고, Clova 영수증 OCR 결과를 우리
        정산 JSON으로 검증하는 단계입니다.
      </Text>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleStartDocumentScan}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading && !imageUri ? '문서 스캔 준비 중...' : '문서 스캔 시작'}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={handlePickImageFromGallery}
        disabled={loading}>
        <Text style={styles.secondaryButtonText}>갤러리에서 영수증 선택</Text>
      </Pressable>

      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>스캔된 영수증 없음</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRunOcr}
        disabled={loading || !imageUri}>
        <Text style={styles.buttonText}>
          {loading ? '백엔드 OCR 요청 중...' : '백엔드 OCR 실행'}
        </Text>
      </Pressable>

      {loading ? <ActivityIndicator color="#1428A0" style={styles.loader} /> : null}

      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>상태</Text>
        <Text style={styles.resultText}>{statusMessage || '아직 분석 결과 없음'}</Text>
      </View>

      {receiptDraft ? (
        <View style={styles.editorSection}>
          <Text style={styles.sectionTitle}>검증할 영수증 데이터</Text>

          <TextInput
            value={receiptDraft.merchantName}
            onChangeText={value => updateDraftField('merchantName', value)}
            placeholder="가맹점명"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TextInput
            value={receiptDraft.address}
            onChangeText={value => updateDraftField('address', value)}
            placeholder="주소"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TextInput
            value={receiptDraft.paidAt}
            onChangeText={value => updateDraftField('paidAt', value)}
            placeholder="결제 시각 ISO 문자열"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <View style={styles.inlineRow}>
            <TextInput
              value={receiptDraft.totalAmount?.toString() ?? ''}
              onChangeText={value =>
                updateDraftField('totalAmount', parseNumberInput(value))
              }
              placeholder="총 결제 금액"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={[styles.input, styles.inlineInput]}
            />
            <TextInput
              value={receiptDraft.businessNumber}
              onChangeText={value => updateDraftField('businessNumber', value)}
              placeholder="사업자번호"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.inlineInput]}
            />
          </View>

          <View style={styles.itemSectionHeader}>
            <Text style={styles.sectionTitle}>품목 목록</Text>
            <Pressable style={styles.subtleButton} onPress={addItem}>
              <Text style={styles.subtleButtonText}>품목 추가</Text>
            </Pressable>
          </View>

          {receiptDraft.items.length > 0 ? (
            receiptDraft.items.map(renderItemEditor)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                인식된 품목이 없습니다. 직접 추가할 수 있습니다.
              </Text>
            </View>
          )}

          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>제출 예정 JSON 미리보기</Text>
            <Text style={styles.resultJson}>{JSON.stringify(receiptDraft, null, 2)}</Text>
          </View>

          {rawResponseText ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Clova 원본 응답</Text>
              <Text style={styles.resultJson}>{rawResponseText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        style={[styles.completeButton, !hasVerifiedDraft && styles.buttonDisabled]}
        disabled={!hasVerifiedDraft}
        onPress={goToSettleMemberSelect}>
        <Text style={styles.buttonText}>검증 완료 후 정산 인원 선택</Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={handleSkipNext}>
        <Text style={styles.skipButtonText}>임시) 검증 없이 다음 단계</Text>
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
    marginBottom: 8,
    color: '#1428A0',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1428A0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
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
  loader: {
    marginTop: 4,
    marginBottom: 4,
  },
  resultBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  resultJson: {
    fontSize: 12,
    lineHeight: 18,
    color: '#1F2937',
  },
  editorSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineInput: {
    flex: 1,
  },
  itemSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  subtleButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EEF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  subtleButtonText: {
    color: '#1428A0',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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