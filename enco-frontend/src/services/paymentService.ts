import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getCachedAccessToken } from '../utils/tokenStorage';

const PAYMENT_BASE_URL = 'https://api.ssafywte.site/payment-service/api/v1';

export const paymentApi = axios.create({
  baseURL: PAYMENT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청마다 토큰 자동 주입
paymentApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 카드 상세 조회 (GET /cards/{cardProductId}) ──
// 응답: { message: "...", result: { id, name, baseSpending, ... } }

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

export async function getCardDetail(
  cardProductId: number,
): Promise<GetCardDetailResponse> {
  const response = await paymentApi.get<GetCardDetailResponse>(
    `/cards/${cardProductId}`,
  );
  return response.data;
}

// ── 전체 카드 목록 조회 (GET /cards) ──
// 응답: { message: "...", result: [{ id, name, frontImageUrl, ... }] }

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

export async function getCardList(): Promise<GetCardListResponse> {
  const response = await paymentApi.get<GetCardListResponse>('/cards');
  return response.data;
}

// ── 카드 추가 발급 (POST /accounts/card-add) ──
// 요청: { accountId, cardProductId }
// 응답: { message, result: { cardId, cardNumber, frontImageUrl } }

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

export async function cardAdd(
  payload: CardAddRequest,
): Promise<CardAddResponse> {
  const response = await paymentApi.post<CardAddResponse>(
    '/accounts/card-add',
    payload,
  );
  return response.data;
}

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

// 자유납부

export async function duesPayment(
  groupId: number,
  payload: DuesPaymentRequest,
): Promise<DuesPaymentResponse> {
  const response = await paymentApi.post<DuesPaymentResponse>(
    `/groups/${groupId}/dues-payments/free`,
    payload,
    {
      headers: {
        'Idempotency-Key': uuidv4(),
      },
    },
  );
  return response.data;
}

// 선택 납부
export type SelectedDuesPaymentRequest = {
  amount: number;
  targetChargeTargetIds: number[];
  withdrawDisplayName: string;
  depositDisplayName: string;
  memo: string;
};

export async function selectedDuesPayment(
  groupId: number,
  payload: SelectedDuesPaymentRequest,
): Promise<DuesPaymentResponse> {
  const response = await paymentApi.post<DuesPaymentResponse>(
    `/groups/${groupId}/dues-payments/selected`,
    payload,
    {
      headers: {
        'Idempotency-Key': uuidv4(),
      },
    },
  );
  return response.data;
}

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

export async function getUnpaidDues(
  groupId: number,
): Promise<GetUnpaidDuesResponse> {
  const response = await paymentApi.get<GetUnpaidDuesResponse>(
    `/groups/${groupId}/dues/unpaid`,
  );
  return response.data;
}

export type GroupDashboardItem = {
  paidCount: number;
  unpaidCount: number;
  paidRatio: number;
  unpaidRatio: number;
};

// 모임 대시보드 조회
export type GroupDashboardResponse = {
  message: string;
  result: {
    groupId: number;
    groupName: string;
    paymentStatus: GroupDashboardItem;
    balance: number;
  };
};

export async function getGroupDashboard(
  groupId: number,
): Promise<GroupDashboardResponse> {
  const response = await paymentApi.get<GroupDashboardResponse>(
    `/groups/${groupId}/dashboard`,
  );
  return response.data;
}

// 모임 대시보드 리포트(장부) 조회

export interface GroupDashboardReportResponse {
  message: string;
  result: {
    groupId: number;
    balance: number;
    paidAmount: number;
    pointAmount: number;
  };
}

export async function getGroupDashboardReport(groupId: number | string) {
  const token = getCachedAccessToken();

  const response = await axios.get<GroupDashboardReportResponse>(
    `https://api.ssafywte.site/payment-service/api/v1/groups/${groupId}/dashboard/report`,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}

// 모임카드 조회
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

export async function getGroupCards(groupId: number | string) {
  const token = getCachedAccessToken();

  const response = await axios.get<GroupCardsResponse>(
    `https://api.ssafywte.site/payment-service/api/v1/cards/groups/${groupId}/cards`,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}

// 모임 장부 조회
export type GroupTransactionSort = 'LATEST' | 'OLDEST';
export type GroupTransactionType = 'ALL' | 'DEPOSIT' | 'WITHDRAW';
export type GroupTransactionReferenceType = 'TRANSACTION' | 'EXPENSE' | 'POINT';

export type GroupTransactionItem = {
  referenceType: GroupTransactionReferenceType;
  referenceId: number;
  transactionDate: string;
  title: string;
  type: 'DEPOSIT' | 'WITHDRAW';
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

export async function getGroupTransactions(
  groupId: number,
  params: GetGroupTransactionsParams,
): Promise<GetGroupTransactionsResponse> {
  const response = await paymentApi.get<GetGroupTransactionsResponse>(
    `/groups/${groupId}/transactions`,
    {
      params,
    },
  );
  return response.data;
}

// ── 거래내역 상세 조회 ──

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

export async function getGroupTransactionDetail(
  groupId: number,
  transactionId: number,
): Promise<GroupTransactionDetailResponse> {
  const response = await paymentApi.get<GroupTransactionDetailResponse>(
    `/groups/${groupId}/transactions/${transactionId}`,
  );
  return response.data;
}

export const onsiteBarcodePayment = async (
  barcodeNumber: string,
  cardId: number,
) => {
  const response = await paymentApi.post(
    '/payments/pay',
    {
      barcodeNumber,
      amount: 15000, // 추후 실제 금액으로
      merchantName: '스타벅스', // 추후 실제 가게명으로
      cardId,
    },
    {
      headers: {
        'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    },
  );
  return response.data;
};
// ── 모임원 납부 현황 조회 (GET /groups/{groupId}/members/payment-status) ──

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

export async function getGroupPaymentStatus(
  groupId: number | string,
): Promise<GroupPaymentStatusResponse> {
  const response = await paymentApi.get<GroupPaymentStatusResponse>(
    `/groups/${groupId}/members/payment-status`,
  );
  return response.data;
}
