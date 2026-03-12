import { apiClient } from "./apiClient";

export type LoginRequest = {
    email: string;
    pin: string;
};


export type LoginResponse ={
    accessToken : string;
    refreshToken : string;
    user: {
        id : number;
        name : string;
        email : string;
    };
};

export async function loginService(payload: LoginRequest) {
    const response = await apiClient.post<LoginResponse>('/auth/login',payload);
    return response.data;
}