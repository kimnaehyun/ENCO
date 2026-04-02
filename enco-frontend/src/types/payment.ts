export type paymentMethod = 'barcode' | 'qr';

export interface PaymentState {
  paymentMethod: paymentMethod;
  barcode: () => void;
  qr: () => void;
}

export interface Group {
  groupId: string | number;
  groupName: string;
  role: string;
  account: string;
  card: string;
}

export type SelectedAccount = {
  bankName: string;
  accountNumber: string;
  label: string;
};

export type GroupTransactionDetailItem = {
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
  options: GroupTransactionDetailItemOption[];
};

export type GroupTransactionDetailItemOption = {
  name: string;
  unitPrice: number | null;
  quantity: number | null;
  amount: number | null;
};

export interface PaymentStatusMember {
  userId: number;
  name: string;
  profileImage: number;
  paymentStatus: 'PAID' | 'UNPAID';
  unpaidAmount: number;
}

export interface GroupPaymentStatusResponse {
  message: string;
  result: {
    groupId: number;
    totalMemberCount: number;
    unpaidCount: number;
    paidCount: number;
    unpaidMembers: PaymentStatusMember[];
    paidMembers: PaymentStatusMember[];
  };
}

export type GroupTransactionDetailResponse = {
  message: string;
  result: {
    displayName: string;
    amount: number;
    transactionDate: string;
    type: 'TRANSFER' | 'CARD_PAYMENT';
    cardName: string | null;
    balanceAfter: number;
    memo: string | null;
    receipt: {
      receiptImageUrl: string | null;
      receiptContent: {
        merchantName: string;
        address: string;
        paidAt: string;
        items: GroupTransactionDetailItem[];
        totalAmount: number | null;
        businessNumber: string | null;
      } | null;
    } | null;
  };
};

export type GroupTransactionSort = 'LATEST' | 'OLDEST';
export type GroupTransactionType = 'ALL' | 'DEPOSIT' | 'WITHDRAW';
export type GroupTransactionReferenceType = 'TRANSACTION' | 'EXPENSE' | 'POINT';

export type GroupTransactionItem = {
  referenceType: GroupTransactionReferenceType;
  referenceId: number;
  transactionDate: string;
  title: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  amount: number;
  balanceAfter: number;
};

export type GetGroupTransactionsParams = {
  sort?: GroupTransactionSort;
  type?: GroupTransactionType;
  cursor?: number;
  size?: number;
};

export type GetGroupTransactionsResponse = {
  message: string;
  result: {
    items: GroupTransactionItem[];
    nextCursor: number | null;
    hasNext: boolean;
  };
};

export type GroupDashboardItem = {
  paidCount: number;
  unpaidCount: number;
  paidRatio: number;
  unpaidRatio: number;
};

export type GroupDashboardResponse = {
  message: string;
  result: {
    groupId: number;
    groupName: string;
    paymentStatus: GroupDashboardItem;
    balance: number;
  };
};

export type UnpaidItem = {
  chargeTargetId: number;
  chargeId: number;
  displayName: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
};

export type GetUnpaidDuesResponse = {
  message: string;
  result: {
    groupId: number;
    userId: number;
    totalUnpaidAmount: number;
    totalUnpaidCount: number;
    charges: UnpaidItem[];
  };
};

export type SelectedDuesPaymentRequest = {
  amount: number;
  targetChargeTargetIds: number[];
  withdrawDisplayName: string;
  depositDisplayName: string;
  memo: string;
};

export type DuesPaymentRequest = {
  withdrawAccountBankName: string;
  withdrawAccountNumber: string;
  amount: number;
  withdrawDisplayName: string;
  depositDisplayName: string;
  memo: string;
};

export type DuesPaymentItem = {
  chargeTargetId: number;
  allocatedAmount: number;
  chargeStatus: string;
  remainingAmount: number;
};

export type DuesPaymentResponse = {
  message: string;
  result: {
    paymentId: number;
    groupId: number;
    payerUserId: number;
    totalAmount: number;
    paidAt: string;
    allocations: DuesPaymentItem[];
  };
};

export type CardAddRequest = {
  accountId: number;
  cardProductId: number;
};

export type CardAddResult = {
  cardId: number;
  cardNumber: string;
  frontImageUrl: string;
};

export type CardAddResponse = {
  message: string;
  result: CardAddResult;
};

export interface GroupDashboardReportResponse {
  message: string;
  result: {
    groupId: number;
    balance: number;
    paidAmount: number;
    pointAmount: number;
  };
}

export type CardDetailResult = {
  id: number;
  name: string;
  baseSpending: number;
  maxBenefitLimit: number;
  description: string;
  maxLimit: number;
  frontImageUrl: string;
  backImageUrl: string;
};

export type GetCardDetailResponse = {
  message: string;
  result: CardDetailResult;
};

export type GetRecommendedCardsResponse = {
  message: string;
  result: CardDetailResult[];
};

export type CardBenefitItem = {
  categoryName: string;
  discountRate: number;
};

export type CardListItem = {
  id: number;
  name: string;
  frontImageUrl: string;
  backImageUrl: string;
  baseSpending: number;
  maxBenefitLimit: number;
  benefits: CardBenefitItem[];
};

export type GetCardListResponse = {
  message: string;
  result: CardListItem[];
};

export interface GroupCardItem {
  cardId: number;
  frontCardImageUrl: string;
  cardName: string;
  backCardImageUrl: string;
  isBasic: boolean;
}

export interface GroupCardsResponse {
  message: string;
  result: GroupCardItem[];
}
