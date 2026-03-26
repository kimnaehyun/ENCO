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

const resolveLineAmount = ({
  amount,
}: {
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
}) => {
  if (typeof amount === 'number' && Number.isFinite(amount) && amount > 0) {
    return amount;
  }

  return 0;
};

export const sumReceiptItemAmounts = (
  items: Array<Pick<ReceiptItemDraft, 'unitPrice' | 'quantity' | 'amount'>>,
) => items.reduce((sum, item) => sum + resolveLineAmount(item), 0);

export const resolveReceiptTotalAmount = (
  totalAmount: number | null,
  items: Array<Pick<ReceiptItemDraft, 'unitPrice' | 'quantity' | 'amount'>>,
) => {
  if (
    typeof totalAmount === 'number' &&
    Number.isFinite(totalAmount) &&
    totalAmount > 0
  ) {
    return totalAmount;
  }

  const itemSum = sumReceiptItemAmounts(items);
  return itemSum > 0 ? itemSum : totalAmount;
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

export type SettlementDetailResponse = {
  amount: number;
  useCard: string;
  paidCount: number;
  totalCount: number;
  status: string;
  displayName: string;
  transactionType: string;
  memo: string;
  paidAt: string;
  receiptImageUrl: string;
  paymentInfo: ReceiptSubmissionDto | null;
  rawResponse: unknown;
};

export type DeleteSettlementResponse = {
  message: string;
  result: null;
};

export type SettlementDefaulterParticipantResponse = {
  chargeTargetId: number;
  userId: number;
  name: string;
  profileImage: number;
  amount: number;
  remainingAmount: number;
  status: string;
};

export type SettlementDefaultersResponse = {
  paidCount: number;
  totalCount: number;
  participants: SettlementDefaulterParticipantResponse[];
  rawResponse: unknown;
};

export type SettlementReminderResponse = {
  chargeId: number;
  requestedCount: number;
  sentCount: number;
  failedCount: number;
  sentAt: string;
  rawResponse: unknown;
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