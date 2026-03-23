import axios from 'axios';
import {compressReceiptImage} from './imageCompressionService';
import {getCachedAccessToken} from '../utils/tokenStorage';
import {
  createEmptyReceiptDraft,
  type ReceiptDraft,
  type ReceiptItemDraft,
  type ReceiptOcrResult,
  type ReceiptOptionDraft,
} from '../types/receipt';

const RECEIPT_BASE_URL = 'https://api.ssafywte.site/payment-service/api/v1';

export const RECEIPT_OCR_ENDPOINT = '/receipts/ocr';
export const RECEIPT_SUBMIT_ENDPOINT = '/receipts';

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
  groupId?: string;
  fileName?: string;
  mimeType?: string;
};

export type SubmitVerifiedReceiptRequest = {
  receipt: ReceiptDraft;
  imageUri: string;
  groupId?: string;
  fileName?: string;
  mimeType?: string;
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

const normalizeReceipt = (payload: unknown): ReceiptDraft => {
  if (!payload || typeof payload !== 'object') {
    return createEmptyReceiptDraft();
  }

  const source = payload as Record<string, unknown>;
  return {
    merchantName: toText(source.merchantName),
    address: toText(source.address),
    paidAt: toText(source.paidAt),
    items: toItems(source.items),
    totalAmount: toNumber(source.totalAmount),
    businessNumber: toText(source.businessNumber),
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

  if (payload.groupId) {
    formData.append('groupId', payload.groupId);
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

export async function submitVerifiedReceipt(
  payload: SubmitVerifiedReceiptRequest,
) {
  const preparedImage = await prepareReceiptImageForUpload(
    payload.imageUri,
    payload.fileName,
    payload.mimeType,
  );

  const formData = new FormData();
  formData.append('receipt', JSON.stringify(payload.receipt));
  formData.append(
    'file',
    buildReceiptFilePart(
      preparedImage.imageUri,
      preparedImage.fileName,
      preparedImage.mimeType,
    ) as any,
  );

  if (payload.groupId) {
    formData.append('groupId', payload.groupId);
  }

  const response = await receiptApi.post(RECEIPT_SUBMIT_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}