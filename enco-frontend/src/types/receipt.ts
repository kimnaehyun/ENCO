export type ReceiptOcrCandidateMap = Record<string, unknown[]>;

export type ReceiptOcrMeta = {
  provider: string;
  requestId: string;
  inferResult: string;
};

export type ReceiptOptionDto = {
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
};

export type ReceiptItemDto = {
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
  options: ReceiptOptionDto[];
};

export type ReceiptDto = {
  merchantName: string;
  address: string;
  paidAt: string;
  businessNumber: string;
  totalAmount: number | null;
  items: ReceiptItemDto[];
  candidates: ReceiptOcrCandidateMap;
  ocrMeta: ReceiptOcrMeta | null;
};

export type ReceiptOptionDraft = ReceiptOptionDto & {
  id: string;
};

export type ReceiptItemDraft = Omit<ReceiptItemDto, 'options'> & {
  id: string;
  options: ReceiptOptionDraft[];
};

export type ReceiptDraft = Omit<ReceiptDto, 'items'> & {
  items: ReceiptItemDraft[];
};

export type ReceiptOcrResult = {
  message: string;
  receipt: ReceiptDraft;
  rawResponse: unknown;
};

export type ReceiptEvidenceUploadResponse = {
  evidenceId: string;
  receiptImageUrl: string;
  source: string;
  groupId: number | null;
};

export type ReceiptContentSubmitRequestDto = {
  groupId?: number;
  evidenceId?: string;
  receipt: ReceiptDto;
};

export type ReceiptContentSubmitResponse = {
  groupId: number | null;
  evidenceId: string;
  receipt: ReceiptDraft;
  accepted: boolean;
  rawResponse: unknown;
};

export const createEmptyReceiptDraft = (): ReceiptDraft => ({
  merchantName: '',
  address: '',
  paidAt: '',
  items: [],
  totalAmount: null,
  businessNumber: '',
  candidates: {},
  ocrMeta: null,
});