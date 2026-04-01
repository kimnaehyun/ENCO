import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getCachedAccessToken } from '../utils/tokenStorage';
import {
  CardAddRequest,
  CardAddResponse,
  DuesPaymentRequest,
  DuesPaymentResponse,
  GetCardDetailResponse,
  GetCardListResponse,
  GetGroupTransactionsParams,
  GetGroupTransactionsResponse,
  GetRecommendedCardsResponse,
  GetUnpaidDuesResponse,
  GroupCardsResponse,
  GroupDashboardReportResponse,
  GroupDashboardResponse,
  GroupPaymentStatusResponse,
  GroupTransactionDetailResponse,
  SelectedDuesPaymentRequest,
} from '@/types/payment';

const PAYMENT_BASE_URL = 'https://api.ssafywte.site/payment-service/api/v1';

export const paymentApi = axios.create({
  baseURL: PAYMENT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getCardDetail(
  cardProductId: number,
): Promise<GetCardDetailResponse> {
  const response = await paymentApi.get<GetCardDetailResponse>(
    `/cards/${cardProductId}`,
  );
  return response.data;
}

export async function getCardList(): Promise<GetCardListResponse> {
  const response = await paymentApi.get<GetCardListResponse>('/cards');
  return response.data;
}

export async function getRecommendedCards(
  categories: string[],
): Promise<GetRecommendedCardsResponse> {
  const response = await paymentApi.get<GetRecommendedCardsResponse>(
    '/cards/recommend',
    { params: { categories } },
  );
  return response.data;
}

export async function cardAdd(
  payload: CardAddRequest,
): Promise<CardAddResponse> {
  const response = await paymentApi.post<CardAddResponse>(
    '/accounts/card-add',
    payload,
  );
  return response.data;
}

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

export async function getUnpaidDues(
  groupId: number,
): Promise<GetUnpaidDuesResponse> {
  const response = await paymentApi.get<GetUnpaidDuesResponse>(
    `/groups/${groupId}/dues/unpaid`,
  );
  return response.data;
}

export async function getGroupDashboard(
  groupId: number,
): Promise<GroupDashboardResponse> {
  const response = await paymentApi.get<GroupDashboardResponse>(
    `/groups/${groupId}/dashboard`,
  );
  return response.data;
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
  usePoint: boolean,
  amount: number,
  merchantName: string,
) => {
  const response = await paymentApi.post(
    '/payments/pay',
    {
      barcodeNumber,
      amount,
      merchantName,
      cardId,
      usePoint,
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

export async function getGroupPaymentStatus(
  groupId: number | string,
): Promise<GroupPaymentStatusResponse> {
  const response = await paymentApi.get<GroupPaymentStatusResponse>(
    `/groups/${groupId}/members/payment-status`,
  );
  return response.data;
}

export async function getPaymentStatus(groupId: number) {
  console.log('[미납알림] API 호출 시작:', groupId);
  try {
    const response = await paymentApi.get(
      `/groups/${groupId}/members/payment-status`,
    );
    console.log('[미납알림] API 응답:', JSON.stringify(response.data));
    return response.data;
  } catch (err: unknown) {
    console.error(
      '[미납알림] API 호출 실패:',
      (err as { response?: { data?: { message?: string } } })?.response?.data ??
        err,
    );

    throw err;
  }
}

export async function sendNonPaymentNotification(
  groupId: number,
  userId: number,
) {
  try {
    const response = await paymentApi.post(
      `/groups/${groupId}/members/${userId}/dues/reminder`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
