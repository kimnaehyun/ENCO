import axios from 'axios';
import {compressReceiptImage} from './imageCompressionService';
import {getCachedAccessToken} from '../utils/tokenStorage';
import {
  createEmptyReceiptDraft,
  resolveReceiptTotalAmount,
  type ReceiptDraft,
  type ReceiptItemDto,
  type ReceiptOcrCandidateMap,
  type ReceiptOcrMeta,
  type ReceiptItemDraft,
  type ReceiptOptionDto,
  type ReceiptOcrResult,
  type ReceiptOptionDraft,
  type ReceiptSubmissionDto,
  type DeleteSettlementResponse,
  type SettlementDefaultersResponse,
  type SettlementDetailResponse,
  type SettlementCreateResponse,
  type SettlementReminderResponse,
  type TransactionReceiptContentResponse,
} from '../types/receipt';

const RECEIPT_BASE_URL = 'https://api.ssafywte.site/payment-service/api/v1';

export const RECEIPT_OCR_ENDPOINT = '/receipts/ocr';

const receiptApi = axios.create({
  baseURL: RECEIPT_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

receiptApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type UploadReceiptOcrRequest = {
  imageUri: string;
  groupId?: number | string;
  fileName?: string;
  mimeType?: string;
};

type ReceiptMultipartUploadRequest = {
  imageUri: string;
  groupId: number | string;
  fileName?: string;
  mimeType?: string;
};

export type SubmitTransactionReceiptRequest = ReceiptMultipartUploadRequest & {
  transactionId: number | string;
  receipt: ReceiptDraft;
};

export type CreateSettlementRequest = ReceiptMultipartUploadRequest & {
  amount: number;
  receiverBankName: string;
  receiverAccountNumber: string;
  displayName: string;
  memo: string;
  participants: number[];
  receipt: ReceiptDraft;
};

const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const digitsOnly = value.replace(/[^\d.-]/g, '');
    if (!digitsOnly) {
      return null;
    }
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
};

const toGroupId = (value: unknown): number | undefined => {
  const normalized = toNumber(value);
  return normalized ?? undefined;
};

const toCandidateArray = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
};

const toCandidates = (value: unknown): ReceiptOcrCandidateMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<ReceiptOcrCandidateMap>(
    (acc, [key, candidateValue]) => {
      acc[key] = toCandidateArray(candidateValue);
      return acc;
    },
    {},
  );
};

const toOcrMeta = (value: unknown): ReceiptOcrMeta | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  return {
    provider: toText(source.provider),
    requestId: toText(source.requestId),
    inferResult: toText(source.inferResult),
  };
};

const toOptions = (value: unknown): ReceiptOptionDraft[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(option => {
    const source = option as Record<string, unknown>;
    return {
      id: createClientId('option'),
      name: toText(source.name),
      unitPrice: toNumber(source.unitPrice),
      quantity: toNumber(source.quantity),
      amount: toNumber(source.amount),
    };
  });
};

const toItems = (value: unknown): ReceiptItemDraft[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => {
    const source = item as Record<string, unknown>;
    return {
      id: createClientId('item'),
      name: toText(source.name),
      unitPrice: toNumber(source.unitPrice),
      quantity: toNumber(source.quantity),
      amount: toNumber(source.amount),
      options: toOptions(source.options),
    };
  });
};

const serializeOptions = (options: ReceiptOptionDraft[]): ReceiptOptionDto[] =>
  options.map(option => ({
    name: option.name,
    unitPrice: option.unitPrice,
    quantity: option.quantity ?? 1,
    amount: option.amount,
  }));

const serializeItems = (items: ReceiptItemDraft[]): ReceiptItemDto[] =>
  items.map(item => ({
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity ?? 1,
    amount: item.amount,
    options: serializeOptions(item.options),
  }));

const serializeReceiptDraft = (receipt: ReceiptDraft): ReceiptSubmissionDto => ({
  merchantName: receipt.merchantName,
  address: receipt.address,
  paidAt: receipt.paidAt,
  businessNumber: receipt.businessNumber,
  totalAmount: receipt.totalAmount,
  items: serializeItems(receipt.items),
});

const normalizeReceipt = (payload: unknown): ReceiptDraft => {
  if (!payload || typeof payload !== 'object') {
    return createEmptyReceiptDraft();
  }

  const source = payload as Record<string, unknown>;
  const items = toItems(source.items);
  return {
    merchantName: toText(source.merchantName),
    address: toText(source.address),
    paidAt: toText(source.paidAt),
    items,
    totalAmount: resolveReceiptTotalAmount(toNumber(source.totalAmount), items),
    businessNumber: toText(source.businessNumber),
    candidates: toCandidates(source.candidates),
    ocrMeta: toOcrMeta(source.ocrMeta),
  };
};

const resolveReceiptPayload = (responseData: unknown): unknown => {
  if (!responseData || typeof responseData !== 'object') {
    return responseData;
  }

  const source = responseData as Record<string, unknown>;
  const result = source.result;

  if (result && typeof result === 'object') {
    const nested = result as Record<string, unknown>;
    if (nested.normalizedReceipt) {
      return nested.normalizedReceipt;
    }
    if (nested.receipt) {
      return nested.receipt;
    }
    if (nested.merchantName || nested.items || nested.totalAmount) {
      return nested;
    }
  }

  if (source.normalizedReceipt) {
    return source.normalizedReceipt;
  }

  if (source.receipt) {
    return source.receipt;
  }

  return source;
};

const extractResultObject = (responseData: unknown): Record<string, unknown> | null => {
  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  const source = responseData as Record<string, unknown>;
  const result = source.result;

  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }

  return source;
};

const toNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(entry => toNumber(entry))
    .filter((entry): entry is number => entry !== null);
};

const buildReceiptFilePart = (
  imageUri: string,
  fileName?: string,
  mimeType?: string,
) => ({
  uri: imageUri,
  name: fileName ?? `receipt-${Date.now()}.jpg`,
  type: mimeType ?? 'image/jpeg',
});

const prepareReceiptImageForUpload = async (
  imageUri: string,
  fileName?: string,
  mimeType?: string,
) => {
  const compressed = await compressReceiptImage(imageUri);

  return {
    imageUri: compressed.uri,
    fileName: compressed.fileName ?? fileName,
    mimeType: compressed.mimeType ?? mimeType ?? 'image/jpeg',
  };
};

const appendMultipartData = (formData: FormData, key: string, value: unknown) => {
  formData.append(key, JSON.stringify(value));
};

const getResponseMessage = (responseData: unknown, fallback: string) => {
  if (!responseData || typeof responseData !== 'object') {
    return fallback;
  }

  return toText((responseData as Record<string, unknown>).message) || fallback;
};

const normalizeTransactionReceiptSubmitResponse = (
  responseData: unknown,
): TransactionReceiptContentResponse => {
  const result = extractResultObject(responseData);

  return {
    message: getResponseMessage(responseData, '영수증 증빙이 등록되었습니다.'),
    receiptImageUrl: toText(result) || toText((responseData as Record<string, unknown> | null)?.result),
    rawResponse: responseData,
  };
};

const normalizeSettlementCreateResponse = (
  responseData: unknown,
): SettlementCreateResponse => {
  const result = extractResultObject(responseData);
  const paymentInfo = (result?.paymentInfo ?? result?.receipt ?? null) as unknown;

  return {
    expenseId: toNumber(result?.expenseId) ?? 0,
    chargeId: toNumber(result?.chargeId) ?? 0,
    groupId: toNumber(result?.groupId) ?? 0,
    amount: toNumber(result?.amount) ?? 0,
    useCard: toText(result?.useCard),
    paidCount: toNumber(result?.paidCount) ?? 0,
    totalCount: toNumber(result?.totalCount) ?? 0,
    displayName: toText(result?.displayName),
    transactionType: toText(result?.transactionType),
    memo: toText(result?.memo),
    paidAt: toText(result?.paidAt),
    receiptImageUrl: toText(result?.receiptImageUrl),
    receiverAccountNumber: toText(result?.receiverAccountNumber),
    receiverBankCode: toText(result?.receiverBankCode),
    receiverBankName: toText(result?.receiverBankName),
    paymentInfo: {
      merchantName: toText((paymentInfo as Record<string, unknown> | null)?.merchantName),
      address: toText((paymentInfo as Record<string, unknown> | null)?.address),
      paidAt: toText((paymentInfo as Record<string, unknown> | null)?.paidAt),
      businessNumber: toText((paymentInfo as Record<string, unknown> | null)?.businessNumber),
      totalAmount: toNumber((paymentInfo as Record<string, unknown> | null)?.totalAmount),
      items: serializeItems(normalizeReceipt(paymentInfo).items),
    },
    participants: Array.isArray(result?.participants)
      ? result.participants.map(participant => {
          const source = participant as Record<string, unknown>;
          return {
            chargeTargetId: toNumber(source.chargeTargetId) ?? 0,
            userId: toNumber(source.userId) ?? 0,
            amount: toNumber(source.amount) ?? 0,
            remainingAmount: toNumber(source.remainingAmount) ?? 0,
            status: toText(source.status),
          };
        })
      : [],
    rawResponse: responseData,
  };
};

const normalizeSettlementDetailResponse = (
  responseData: unknown,
): SettlementDetailResponse => {
  const result = extractResultObject(responseData);
  const paymentInfo = (result?.paymentInfo ?? null) as unknown;

  return {
    amount: toNumber(result?.amount) ?? 0,
    useCard: toText(result?.useCard),
    paidCount: toNumber(result?.paidCount) ?? 0,
    totalCount: toNumber(result?.totalCount) ?? 0,
    status: toText(result?.status),
    displayName: toText(result?.displayName),
    transactionType: toText(result?.transactionType),
    memo: toText(result?.memo),
    paidAt: toText(result?.paidAt),
    receiptImageUrl: toText(result?.receiptImageUrl),
    paymentInfo:
      paymentInfo && typeof paymentInfo === 'object'
        ? {
            merchantName: toText((paymentInfo as Record<string, unknown>).merchantName),
            address: toText((paymentInfo as Record<string, unknown>).address),
            paidAt: toText((paymentInfo as Record<string, unknown>).paidAt),
            businessNumber: toText((paymentInfo as Record<string, unknown>).businessNumber),
            totalAmount: toNumber((paymentInfo as Record<string, unknown>).totalAmount),
            items: serializeItems(normalizeReceipt(paymentInfo).items),
          }
        : null,
    rawResponse: responseData,
  };
};

const normalizeSettlementDefaultersResponse = (
  responseData: unknown,
): SettlementDefaultersResponse => {
  const result = extractResultObject(responseData);

  return {
    paidCount: toNumber(result?.paidCount) ?? 0,
    totalCount: toNumber(result?.totalCount) ?? 0,
    participants: Array.isArray(result?.participants)
      ? result.participants.map(participant => {
          const source = participant as Record<string, unknown>;
          return {
            chargeTargetId: toNumber(source.chargeTargetId) ?? 0,
            userId: toNumber(source.userId) ?? 0,
            amount: toNumber(source.amount) ?? 0,
            remainingAmount: toNumber(source.remainingAmount) ?? 0,
            status: toText(source.status),
          };
        })
      : [],
    rawResponse: responseData,
  };
};

const buildGroupTransactionReceiptEndpoint = (
  groupId: number,
  transactionId: number,
) => `/groups/${groupId}/transactions/${transactionId}/receipts/contents`;

const buildSettlementEndpoint = (groupId: number) => `/groups/${groupId}/settlements`;
const buildSettlementDetailEndpoint = (groupId: number, expenseId: number) =>
  `/groups/${groupId}/settlements/${expenseId}`;
const buildSettlementDefaultersEndpoint = (groupId: number, expenseId: number) =>
  `/groups/${groupId}/settlements/${expenseId}/defaulters`;
const buildSettlementReminderEndpoint = (groupId: number, expenseId: number) =>
  `/groups/${groupId}/settlements/${expenseId}/reminder`;

const normalizeSettlementReminderResponse = (
  responseData: unknown,
): SettlementReminderResponse => {
  const result = extractResultObject(responseData);

  return {
    chargeId: toNumber(result?.chargeId) ?? 0,
    requestedCount: toNumber(result?.requestedCount) ?? 0,
    sentCount: toNumber(result?.sentCount) ?? 0,
    failedCount: toNumber(result?.failedCount) ?? 0,
    sentAt: toText(result?.sentAt),
    rawResponse: responseData,
  };
};

export async function requestReceiptOcr(
  payload: UploadReceiptOcrRequest,
): Promise<ReceiptOcrResult> {
  const preparedImage = await prepareReceiptImageForUpload(
    payload.imageUri,
    payload.fileName,
    payload.mimeType,
  );

  const formData = new FormData();
  formData.append(
    'file',
    buildReceiptFilePart(
      preparedImage.imageUri,
      preparedImage.fileName,
      preparedImage.mimeType,
    ) as any,
  );

  const groupId = toGroupId(payload.groupId);
  if (groupId !== undefined) {
    formData.append('groupId', String(groupId));
  }

  const response = await receiptApi.post(RECEIPT_OCR_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    message:
      toText((response.data as Record<string, unknown>)?.message) ||
      'OCR 분석이 완료되었습니다.',
    receipt: normalizeReceipt(resolveReceiptPayload(response.data)),
    rawResponse: response.data,
  };
}

export async function submitTransactionReceipt(
  payload: SubmitTransactionReceiptRequest,
): Promise<TransactionReceiptContentResponse> {
  const preparedImage = await prepareReceiptImageForUpload(
    payload.imageUri,
    payload.fileName,
    payload.mimeType,
  );

  const formData = new FormData();
  formData.append(
    'file',
    buildReceiptFilePart(
      preparedImage.imageUri,
      preparedImage.fileName,
      preparedImage.mimeType,
    ) as any,
  );

  const groupId = toGroupId(payload.groupId);
  const transactionId = toGroupId(payload.transactionId);

  if (groupId === undefined || transactionId === undefined) {
    throw new Error('유효한 모임 또는 거래 ID가 없습니다.');
  }

  appendMultipartData(formData, 'data', serializeReceiptDraft(payload.receipt));

  const response = await receiptApi.post(
    buildGroupTransactionReceiptEndpoint(groupId, transactionId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return normalizeTransactionReceiptSubmitResponse(response.data);
}

export async function createSettlement(
  payload: CreateSettlementRequest,
): Promise<SettlementCreateResponse> {
  const preparedImage = await prepareReceiptImageForUpload(
    payload.imageUri,
    payload.fileName,
    payload.mimeType,
  );

  const groupId = toGroupId(payload.groupId);
  if (groupId === undefined) {
    throw new Error('유효한 모임 ID가 없습니다.');
  }

  const formData = new FormData();
  formData.append(
    'file',
    buildReceiptFilePart(
      preparedImage.imageUri,
      preparedImage.fileName,
      preparedImage.mimeType,
    ) as any,
  );

  appendMultipartData(formData, 'data', {
    amount: payload.amount,
    receiverBankName: payload.receiverBankName,
    receiverAccountNumber: payload.receiverAccountNumber,
    paymentInfo: serializeReceiptDraft(payload.receipt),
    displayName: payload.displayName,
    memo: payload.memo,
    participants: toNumberArray(payload.participants),
  });

  const response = await receiptApi.post(
    buildSettlementEndpoint(groupId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return normalizeSettlementCreateResponse(response.data);
}

export async function getSettlementDetail(
  groupId: number | string,
  expenseId: number | string,
): Promise<SettlementDetailResponse> {
  const normalizedGroupId = toGroupId(groupId);
  const normalizedExpenseId = toGroupId(expenseId);

  if (normalizedGroupId === undefined || normalizedExpenseId === undefined) {
    throw new Error('유효한 모임 또는 정산 ID가 없습니다.');
  }

  const response = await receiptApi.get(
    buildSettlementDetailEndpoint(normalizedGroupId, normalizedExpenseId),
  );

  return normalizeSettlementDetailResponse(response.data);
}

export async function deleteSettlement(
  groupId: number | string,
  expenseId: number | string,
): Promise<DeleteSettlementResponse> {
  const normalizedGroupId = toGroupId(groupId);
  const normalizedExpenseId = toGroupId(expenseId);

  if (normalizedGroupId === undefined || normalizedExpenseId === undefined) {
    throw new Error('유효한 모임 또는 정산 ID가 없습니다.');
  }

  const response = await receiptApi.delete(
    buildSettlementDetailEndpoint(normalizedGroupId, normalizedExpenseId),
  );

  return {
    message: getResponseMessage(response.data, '요청에 성공했습니다.'),
    result: null,
  };
}

export async function getSettlementDefaulters(
  groupId: number | string,
  expenseId: number | string,
): Promise<SettlementDefaultersResponse> {
  const normalizedGroupId = toGroupId(groupId);
  const normalizedExpenseId = toGroupId(expenseId);

  if (normalizedGroupId === undefined || normalizedExpenseId === undefined) {
    throw new Error('유효한 모임 또는 정산 ID가 없습니다.');
  }

  const response = await receiptApi.get(
    buildSettlementDefaultersEndpoint(normalizedGroupId, normalizedExpenseId),
  );

  return normalizeSettlementDefaultersResponse(response.data);
}

export async function sendSettlementReminder(
  groupId: number | string,
  expenseId: number | string,
): Promise<SettlementReminderResponse> {
  const normalizedGroupId = toGroupId(groupId);
  const normalizedExpenseId = toGroupId(expenseId);

  if (normalizedGroupId === undefined || normalizedExpenseId === undefined) {
    throw new Error('유효한 모임 또는 정산 ID가 없습니다.');
  }

  const response = await receiptApi.post(
    buildSettlementReminderEndpoint(normalizedGroupId, normalizedExpenseId),
  );

  return normalizeSettlementReminderResponse(response.data);
}