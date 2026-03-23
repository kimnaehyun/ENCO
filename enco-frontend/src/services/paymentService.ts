import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getCachedAccessToken } from "../utils/tokenStorage";

const PAYMENT_BASE_URL = "https://api.ssafywte.site/payment-service/api/v1";

const paymentApi = axios.create({
    baseURL: PAYMENT_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
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

export async function getCardDetail(cardProductId: number): Promise<GetCardDetailResponse> {
    const response = await paymentApi.get<GetCardDetailResponse>(
        `/cards/${cardProductId}`
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
    const response = await paymentApi.get<GetCardListResponse>("/cards");
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

export type DuesPaymentResponse = {
    message: string;
    result: {
        paymentId: number;
        groupId: number;
        payerUserId: number;
        totalAmount: number;
        paidAt: string;
        allocations: {
            chargeTargetId: number;
            allocatedAmount: number;
            chargeStatus: string;
            remainingAmount: number;
        }[];
    };
};

export async function duesPayment(
    groupId: number,
    payload: DuesPaymentRequest
): Promise<DuesPaymentResponse> {
    const response = await paymentApi.post<DuesPaymentResponse>(
        `/groups/${groupId}/dues-payments/free`,
        payload,
        {
            headers: {
                "Idempotency-Key": uuidv4(),
            },
        }
    );
    return response.data;
}

export type SelectedDuesPaymentRequest = {
    amount: number;
    targetChargeTargetIds: number[];
    withdrawDisplayName: string;
    depositDisplayName: string;
    memo: string;
};

export async function selectedDuesPayment(
    groupId: number,
    payload: SelectedDuesPaymentRequest
): Promise<DuesPaymentResponse> {
    const response = await paymentApi.post<DuesPaymentResponse>(
        `/groups/${groupId}/dues-payments/selected`,
        payload,
        {
            headers: {
                "Idempotency-Key": uuidv4(),
            },
        }
    );
    return response.data;
}

export type GetUnpaidDuesResponse = {
    message: string;
    result: {
        groupId: number,
        userId: number,
        totalUnpaidAmount: number,
        totalUnpaidCount: number,
        charges: {
            chargeTargetId: number,
            chargeId: number,
            title: string,
            amout: number,
            paidAmount: number,
            remainingAmount: number,
        }[]
    }
}

export async function getUnpaidDues(groupId: number): Promise<GetUnpaidDuesResponse> {
    const response = await paymentApi.get<GetUnpaidDuesResponse>(
        `/groups/${groupId}/dues/unpaid`);
    return response.data;
}

// 모임 대시보드 조회
export type GroupDashboardResponse = {
    message: string;
    result: {
        groupId: number;
        groupName: string;
        paymentStatus: {
            paidCount: number;
            unpaidCount: number;
            paidRatio: number;
            unpaidRatio: number;
        };
        balance: number;
    };
};

export async function getGroupDashboard(
    groupId: number
): Promise<GroupDashboardResponse> {
    const response = await paymentApi.get<GroupDashboardResponse>(
        `/groups/${groupId}/dashboard`
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