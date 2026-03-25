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

export type ReceiptSubmissionDto = {
  merchantName: string;
  address: string;
  paidAt: string;
  businessNumber: string;
  totalAmount: number | null;
  items: ReceiptItemDto[];
};

export type ReceiptDto = ReceiptSubmissionDto & {
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

export type TransactionReceiptContentResponse = {
  message: string;
  receiptImageUrl: string;
  rawResponse: unknown;
};

export type SettlementParticipantResponse = {
  chargeTargetId: number;
  userId: number;
  amount: number;
  remainingAmount: number;
  status: string;
};

export type SettlementCreateResponse = {
  expenseId: number;
  chargeId: number;
  groupId: number;
  amount: number;
  useCard: string;
  paidCount: number;
  totalCount: number;
  displayName: string;
  transactionType: string;
  memo: string;
  paidAt: string;
  receiptImageUrl: string;
  receiverAccountNumber: string;
  receiverBankCode: string;
  receiverBankName: string;
  paymentInfo: ReceiptSubmissionDto;
  participants: SettlementParticipantResponse[];
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