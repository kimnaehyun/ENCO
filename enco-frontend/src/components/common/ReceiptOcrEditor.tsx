import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  requestReceiptOcr,
  submitTransactionReceipt,
} from '../../services/receiptService';
import ScreenLayout from '../ScreenLayout';
import {FONT_FAMILY, COLORS} from '../typography';
import {
  createEmptyReceiptDraft,
  resolveReceiptTotalAmount,
  sumReceiptItemAmounts,
  type ReceiptDraft,
  type ReceiptItemDraft,
  type ReceiptOptionDraft,
} from '../../types/receipt';

const {DocumentScanner} = NativeModules;

type DocumentScanResult = {
  status?: string;
  imageUris?: string[];
  firstImageUri?: string | null;
  pdfUri?: string | null;
};

export type ReceiptOcrEditorParams = {
  imageUri?: string;
  groupName?: string;
  groupId?: string;
  transactionId?: number;
};

type ReceiptOcrEditorProps = {
  mode: 'settlement' | 'transaction';
  navigation: any;
  params: ReceiptOcrEditorParams;
};

export default function ReceiptOcrEditor({
  mode,
  navigation,
  params,
}: ReceiptOcrEditorProps) {
  const numericTransactionId =
    typeof params.transactionId === 'number' ? params.transactionId : NaN;
  const [imageUri, setImageUri] = useState<string | null>(params.imageUri ?? null);
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraft | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
    }
  }, [params.imageUri]);

  const isTransactionMode = mode === 'transaction';
  const usesUnifiedScannerEntry = Platform.OS === 'android';
  const hasVerifiedDraft = receiptDraft !== null;
  const editorStatusText = loading
    ? 'OCR 분석 중'
    : receiptDraft
    ? '검수 준비 완료'
    : '영수증 준비 필요';

  const screenTitle = isTransactionMode ? '거래 영수증 증빙' : '정산 영수증 검수';
  const screenDescription = isTransactionMode
    ? '영수증 이미지를 압축 후 백엔드 OCR로 분석하고, 거래 증빙용 내용으로 검수한 뒤 제출합니다.'
    : '영수증 이미지를 압축 후 백엔드 OCR로 분석하고, 사후 정산용 내용으로 검수한 뒤 다음 단계로 진행합니다.';
  const completeButtonText = isTransactionMode
    ? '검증 완료 후 영수증 증빙 등록'
    : '검증 완료 후 정산 정보 입력';

  const validateVerifiedDraft = () => {
    if (!receiptDraft) {
      Alert.alert('안내', '먼저 영수증을 분석하고 내용을 검증하세요.');
      return false;
    }

    if (!receiptDraft.merchantName.trim()) {
      Alert.alert('안내', '가맹점명을 확인해 주세요.');
      return false;
    }

    if (!receiptDraft.totalAmount || receiptDraft.totalAmount <= 0) {
      Alert.alert('안내', '총 결제 금액을 확인해 주세요.');
      return false;
    }

    return true;
  };

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

  const recognizedItemAmountSum = useMemo(
    () => sumReceiptItemAmounts(receiptDraft?.items ?? []),
    [receiptDraft],
  );

  const resolvedTotalAmount = useMemo(
    () =>
      receiptDraft
        ? resolveReceiptTotalAmount(receiptDraft.totalAmount, receiptDraft.items)
        : null,
    [receiptDraft],
  );

  const totalAmountNeedsReview =
    !!receiptDraft &&
    (!receiptDraft.totalAmount || receiptDraft.totalAmount <= 0) &&
    recognizedItemAmountSum > 0;

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
  };

  const runReceiptOcr = async (uri: string, pendingMessage?: string) => {
    try {
      setLoading(true);
      resetReceiptAnalysis(uri);
      setStatusMessage(pendingMessage ?? '영수증 이미지를 분석 중입니다.');

      const response = await requestReceiptOcr({
        imageUri: uri,
        groupId: params.groupId,
      });

      setReceiptDraft(response.receipt);
      setStatusMessage(response.message);
    } catch (error: any) {
      Alert.alert(
        'OCR 실패',
        error?.response?.data?.message || error?.message || '알 수 없는 오류',
      );
    } finally {
      setLoading(false);
    }
  };

  const startDocumentScan = async (successMessage: string) => {
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

      await runReceiptOcr(uri, successMessage);
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

  const handleStartDocumentScan = async () => {
    await startDocumentScan('스캔이 완료되었습니다. OCR을 실행해 주세요.');
  };

  const handlePickImageFromGallery = async () => {
    if (Platform.OS === 'android') {
      await startDocumentScan(
        '문서 스캐너에서 이미지를 불러왔습니다. 자동 영역 보정 후 OCR을 실행해 주세요.',
      );
      return;
    }

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

      await runReceiptOcr(uri, '갤러리에서 이미지를 선택했습니다. OCR을 실행 중입니다.');
    } catch (error: any) {
      Alert.alert(
        '갤러리 선택 실패',
        error?.message || '이미지를 불러오지 못했습니다.',
      );
    }
  };

  const goToSettleMemberSelect = () => {
    if (!validateVerifiedDraft()) {
      return;
    }

    navigation.navigate('SettleMemberSelect', {
      amount: receiptDraft!.totalAmount,
      storeName: receiptDraft!.merchantName,
      date: formatSettlementDate(receiptDraft!.paidAt),
      memo: '',
      receiptUri: imageUri,
      receiptDraft,
      groupName: params.groupName ?? '모임명',
      groupId: params.groupId,
      isNewSettle: true,
    });
  };

  const handleSubmitTransactionReceipt = async () => {
    if (!validateVerifiedDraft()) {
      return;
    }

    if (!imageUri) {
      Alert.alert('안내', '영수증 이미지를 먼저 선택하세요.');
      return;
    }

    const numericGroupId = params.groupId ? Number(params.groupId) : NaN;
    if (!Number.isFinite(numericGroupId) || !Number.isFinite(numericTransactionId)) {
      Alert.alert('안내', '거래 증빙에 필요한 모임 또는 거래 ID가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const response = await submitTransactionReceipt({
        groupId: numericGroupId,
        transactionId: numericTransactionId,
        imageUri,
        receipt: receiptDraft as ReceiptDraft,
      });

      Alert.alert('완료', response.message, [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        '등록 실패',
        error?.response?.data?.message ||
          error?.message ||
          '영수증 증빙 등록 중 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
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
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageScrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerEyebrow}>
              {isTransactionMode ? '거래 증빙' : '사후 정산'}
            </Text>
            <Text style={styles.title}>{screenTitle}</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{editorStatusText}</Text>
          </View>
          <Text style={styles.heroTitle}>
            {hasVerifiedDraft
              ? '인식된 내용을 빠르게 훑고 필요한 값만 수정하세요.'
              : '영수증을 스캔하거나 선택하면 자동으로 OCR 분석이 시작됩니다.'}
          </Text>
          <Text style={styles.description}>{screenDescription}</Text>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>영수증 이미지</Text>
            {imageUri ? (
              <View style={styles.imageReadyBadge}>
                <Text style={styles.imageReadyBadgeText}>
                  {receiptDraft ? '분석 완료' : '이미지 준비됨'}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.cardHelper}>
            {usesUnifiedScannerEntry
              ? '문서 스캐너 안에서 촬영 또는 갤러리 선택을 진행할 수 있습니다.'
              : '촬영 또는 갤러리에서 영수증 이미지를 선택한 뒤 자동 분석됩니다.'}
          </Text>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleStartDocumentScan}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading && !imageUri
                ? '문서 스캔 준비 중...'
                : usesUnifiedScannerEntry
                ? '영수증 스캔 / 선택'
                : '문서 스캔 시작'}
            </Text>
          </Pressable>

          {!usesUnifiedScannerEntry ? (
            <Pressable
              style={[styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={handlePickImageFromGallery}
              disabled={loading}>
              <Text style={styles.secondaryButtonText}>갤러리에서 영수증 선택</Text>
            </Pressable>
          ) : null}

          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🧾</Text>
              <Text style={styles.placeholderTitle}>선택된 영수증 없음</Text>
              <Text style={styles.placeholderText}>
                스캔 또는 이미지 선택 후 자동으로 OCR 분석이 시작됩니다.
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.brand} />
            <Text style={styles.loadingText}>Clova OCR 분석 중입니다...</Text>
          </View>
        ) : null}

        {receiptDraft ? (
          <View style={styles.editorSection}>
          <Text style={styles.sectionTitle}>검증할 영수증 데이터</Text>

          <View style={styles.totalAmountCard}>
            <Text style={styles.totalAmountTitle}>총 결제 금액 확인</Text>
            <Text style={styles.totalAmountValue}>
              {resolvedTotalAmount && resolvedTotalAmount > 0
                ? `${resolvedTotalAmount.toLocaleString()}원`
                : '총액 확인 필요'}
            </Text>
            <Text style={styles.totalAmountHelper}>
              OCR 총액: {receiptDraft.totalAmount && receiptDraft.totalAmount > 0
                ? `${receiptDraft.totalAmount.toLocaleString()}원`
                : '미인식 또는 0원'}
            </Text>
            <Text style={styles.totalAmountHelper}>
              품목 합계: {recognizedItemAmountSum > 0
                ? `${recognizedItemAmountSum.toLocaleString()}원`
                : '계산 불가'}
            </Text>
            <Text style={styles.totalAmountNotice}>
              {totalAmountNeedsReview
                ? '총액이 0원으로 인식되어 품목 합계로 자동 보정했습니다. 아래 입력창에서 직접 수정할 수 있습니다.'
                : '영수증 총액을 눈으로 확인하고 필요하면 아래 입력창에서 수정하세요.'}
            </Text>
          </View>

          <View style={styles.metaCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>매장명</Text>
              <TextInput
                value={receiptDraft.merchantName}
                onChangeText={value => updateDraftField('merchantName', value)}
                placeholder="매장명 입력"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>주소</Text>
              <TextInput
                value={receiptDraft.address}
                onChangeText={value => updateDraftField('address', value)}
                placeholder="주소 입력"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.inlineRow}>
              <View style={[styles.fieldGroup, styles.inlineFieldGroup]}>
                <Text style={styles.fieldLabel}>총 결제 금액</Text>
                <TextInput
                  value={receiptDraft.totalAmount?.toString() ?? ''}
                  onChangeText={value =>
                    updateDraftField('totalAmount', parseNumberInput(value))
                  }
                  placeholder="총 결제 금액 입력"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  style={[styles.input, styles.inlineInput, styles.compactInput]}
                />
              </View>
              <View style={[styles.fieldGroup, styles.inlineFieldGroup]}>
                <Text style={styles.fieldLabel}>사업자번호</Text>
                <TextInput
                  value={receiptDraft.businessNumber}
                  onChangeText={value => updateDraftField('businessNumber', value)}
                  placeholder="사업자번호 입력"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, styles.inlineInput, styles.compactInput]}
                />
              </View>
            </View>
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
        </View>
      ) : null}

        <Pressable
          style={[styles.completeButton, !hasVerifiedDraft && styles.buttonDisabled]}
          disabled={!hasVerifiedDraft}
          onPress={isTransactionMode ? handleSubmitTransactionReceipt : goToSettleMemberSelect}>
          <Text style={styles.completeButtonText}>{completeButtonText}</Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageScrollContent: {
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerEyebrow: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  cardHelper: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 14,
  },
  imageReadyBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imageReadyBadgeText: {
    fontSize: 12,
    color: COLORS.success,
    fontFamily: FONT_FAMILY.bold,
  },
  button: {
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  placeholder: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  placeholderTitle: {
    color: COLORS.dark,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 6,
  },
  placeholderText: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  editorSection: {
    marginBottom: 8,
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  inlineFieldGroup: {
    flex: 1,
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
    color: '#334155',
    marginBottom: 6,
  },
  totalAmountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    padding: 18,
    marginBottom: 16,
  },
  totalAmountTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
    marginBottom: 8,
  },
  totalAmountValue: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  totalAmountHelper: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    fontFamily: FONT_FAMILY.medium,
  },
  totalAmountNotice: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E3A8A',
    fontFamily: FONT_FAMILY.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.dark,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    fontFamily: FONT_FAMILY.medium,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineInput: {
    flex: 1,
  },
  compactInput: {
    marginBottom: 0,
  },
  itemSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  subtleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  subtleButtonText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
  },
  itemCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    shadowColor: '#1428A0',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT_FAMILY.medium,
  },
  completeButton: {
    backgroundColor: COLORS.brand,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
});