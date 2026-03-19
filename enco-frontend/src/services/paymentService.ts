import axios from "axios";

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
