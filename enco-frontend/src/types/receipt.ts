export type ReceiptOptionDraft = {
  id: string;
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
};

export type ReceiptItemDraft = {
  id: string;
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
  options: ReceiptOptionDraft[];
};

export type ReceiptDraft = {
  merchantName: string;
  address: string;
  paidAt: string;
  items: ReceiptItemDraft[];
  totalAmount: number | null;
  businessNumber: string;
};

export type ReceiptOcrResult = {
  message: string;
  receipt: ReceiptDraft;
  rawResponse: unknown;
};

export const createEmptyReceiptDraft = (): ReceiptDraft => ({
  merchantName: '',
  address: '',
  paidAt: '',
  items: [],
  totalAmount: null,
  businessNumber: '',
});