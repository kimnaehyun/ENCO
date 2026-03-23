import axios from 'axios';
import {compressReceiptImage} from './imageCompressionService';
import {getCachedAccessToken} from '../utils/tokenStorage';
import {
  createEmptyReceiptDraft,
  type ReceiptContentSubmitRequestDto,
  type ReceiptContentSubmitResponse,
  type ReceiptDraft,
  type ReceiptEvidenceUploadResponse,
  type ReceiptItemDto,
  type ReceiptOcrCandidateMap,
  type ReceiptOcrMeta,
  type ReceiptItemDraft,
  type ReceiptOptionDto,
  type ReceiptOcrResult,
  type ReceiptOptionDraft,
  type ReceiptDto,
} from '../types/receipt';

const RECEIPT_BASE_URL = 'https://api.ssafywte.site/payment-service/api/v1';

export const RECEIPT_OCR_ENDPOINT = '/receipts/ocr';
export const RECEIPT_EVIDENCE_ENDPOINT = '/receipts/evidence';
export const RECEIPT_CONTENT_ENDPOINT = '/receipts/content';

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

export type SubmitVerifiedReceiptRequest = {
  receipt: ReceiptDraft;
  imageUri: string;
  groupId?: number | string;
  fileName?: string;
  mimeType?: string;
};

export type UploadReceiptEvidenceRequest = {
  imageUri: string;
  groupId?: number | string;
  fileName?: string;
  mimeType?: string;
};

export type UploadReceiptEvidenceResult = ReceiptEvidenceUploadResponse & {
  evidenceId: string | null;
  rawResponse: unknown;
};

export type SubmitReceiptContentRequest = {
  receipt: ReceiptDraft;
  groupId?: number | string;
  evidenceId?: string | null;
};

export type SubmitVerifiedReceiptResult = {
  evidence: UploadReceiptEvidenceResult;
  content: ReceiptContentSubmitResponse;
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
    quantity: option.quantity,
    amount: option.amount,
  }));

const serializeItems = (items: ReceiptItemDraft[]): ReceiptItemDto[] =>
  items.map(item => ({
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    amount: item.amount,
    options: serializeOptions(item.options),
  }));

const serializeReceiptDraft = (receipt: ReceiptDraft): ReceiptDto => ({
  merchantName: receipt.merchantName,
  address: receipt.address,
  paidAt: receipt.paidAt,
  businessNumber: receipt.businessNumber,
  totalAmount: receipt.totalAmount,
  items: serializeItems(receipt.items),
  candidates: receipt.candidates,
  ocrMeta: receipt.ocrMeta,
});

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

const extractEvidenceId = (responseData: unknown): string | null => {
  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  const source = responseData as Record<string, unknown>;
  const candidates = [
    source.evidenceId,
    source.receiptEvidenceId,
    source.fileId,
    source.receiptFileId,
    source.id,
  ];

  const result = source.result;
  if (result && typeof result === 'object') {
    const nested = result as Record<string, unknown>;
    candidates.push(
      nested.evidenceId,
      nested.receiptEvidenceId,
      nested.fileId,
      nested.receiptFileId,
      nested.id,
    );
  }

  const matched = candidates.find(
    candidate => typeof candidate === 'string' || typeof candidate === 'number',
  );

  return (matched as string | number | undefined) ?? null;
};

const normalizeEvidenceUploadResponse = (
  responseData: unknown,
): UploadReceiptEvidenceResult => {
  const result = extractResultObject(responseData);

  return {
    evidenceId: extractEvidenceId(responseData),
    receiptImageUrl: toText(result?.receiptImageUrl),
    source: toText(result?.source),
    groupId: toNumber(result?.groupId),
    rawResponse: responseData,
  };
};

const normalizeContentSubmitResponse = (
  responseData: unknown,
): ReceiptContentSubmitResponse => {
  const result = extractResultObject(responseData);

  return {
    groupId: toNumber(result?.groupId),
    evidenceId: toText(result?.evidenceId),
    receipt: normalizeReceipt(result?.receipt),
    accepted: toBoolean(result?.accepted),
    rawResponse: responseData,
  };
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

export async function uploadReceiptEvidence(
  payload: UploadReceiptEvidenceRequest,
): Promise<UploadReceiptEvidenceResult> {
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

  const response = await receiptApi.post(RECEIPT_EVIDENCE_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return normalizeEvidenceUploadResponse(response.data);
}

export async function submitReceiptContent(
  payload: SubmitReceiptContentRequest,
) : Promise<ReceiptContentSubmitResponse> {
  const requestBody: ReceiptContentSubmitRequestDto = {
    receipt: serializeReceiptDraft(payload.receipt),
  };

  const groupId = toGroupId(payload.groupId);
  if (groupId !== undefined) {
    requestBody.groupId = groupId;
  }

  if (payload.evidenceId !== undefined && payload.evidenceId !== null) {
    requestBody.evidenceId = payload.evidenceId;
  }

  const response = await receiptApi.post(RECEIPT_CONTENT_ENDPOINT, requestBody, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return normalizeContentSubmitResponse(response.data);
}

export async function submitVerifiedReceipt(
  payload: SubmitVerifiedReceiptRequest,
) : Promise<SubmitVerifiedReceiptResult> {
  const evidence = await uploadReceiptEvidence({
    imageUri: payload.imageUri,
    groupId: payload.groupId,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
  });

  const content = await submitReceiptContent({
    receipt: payload.receipt,
    groupId: payload.groupId,
    evidenceId: evidence.evidenceId,
  });

  return {
    evidence,
    content,
  };
}