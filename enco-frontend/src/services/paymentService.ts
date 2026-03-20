import axios from "axios";
import { v4 as uuidv4 } from "uuid";


const PAYMENT_BASE_URL = "https://api.ssafywte.site/payment-service/api/v1";

const paymentApi = axios.create({
    baseURL: PAYMENT_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});



export type GetCardDetailResponse = {
    message: string;
    result: {
        name: string,
        baseSpending: number,
        maxBenefitLimit: number,
        description: string,
        maxLimit: number,
        frontImageUrl: string,
        backImageUrl: string
    }
}

export async function getCardDetail(cardProductId: number): Promise<GetCardDetailResponse> {
    const response = await paymentApi.get<GetCardDetailResponse>(
        `/cards/${cardProductId}`
    );
    return response.data;
}

export type GetCardListResponse = {
    message: string;
    result: {
        cardId: number,
        cardName: string,
        frontImageUrl: string,
        backImageUrl: string,
        basespending: number,
        maxbenefitLimit: number,
        benefits: {
            categoryName: string,
            discountRate: number;
        }[]
    }[]
}

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
    message : string;
    result : {
        groupId : number,
        userId : number,
        totalUnpaidAmount : number,
        totalUnpaidCount : number,
        charges : {
            chargeTargetId : number,
            chargeId : number,
            title : string,
            amout : number,
            paidAmount : number,
            remainingAmount : number,
        }[]
    }
}

export async function getUnpaidDues(groupId : number) : Promise<GetUnpaidDuesResponse>{
    const response = await paymentApi.get<GetUnpaidDuesResponse>(
        `/groups/${groupId}/dues/unpaid`);
    return response.data;
}