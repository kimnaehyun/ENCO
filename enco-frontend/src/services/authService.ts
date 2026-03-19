import axios from "axios";

const AUTH_BASE_URL = "https://api.ssafywte.site/auth-service/api/v1";

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 로그인 ──
export type LoginRequest = {
  pinCode: string;
  deviceToken: string;
};

export type LoginResponse = {
  message: string;
  result: {
    id: number;
    name: string;
    deviceToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export async function loginService(payload: LoginRequest): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

// ── 재로그인 (디바이스 토큰 없을 때 폴백) ──
export type ReLoginRequest = {
  email: string;
  password: string;
};

export type ReLoginResponse = {
  message: string;
  result: {
    id: number;
    name: string;
    deviceToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export async function ReLoginService(
  payload: ReLoginRequest,
): Promise<ReLoginResponse> {
  const response = await authApi.post<ReLoginResponse>(
    "/auth/re-login",
    payload,
  );
  return response.data;
}

// ── 회원가입 ──
export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  birthDay: string; // "2000-01-01"
  phoneNumber: string; // "01012345678"
  gender: "M" | "W";
  pinCode: string; // "1234"
  profileUrl: number;
};

export type SignupResponse = {
  message: string;
  result: {
    id: number;
    deviceToken: string;
  };
};

export async function signupService(payload: SignupRequest): Promise<SignupResponse> {
  const response = await authApi.post<SignupResponse>("/auth/regist", payload);
  return response.data;
}


// 통장 개설

export type CreateGroupRequest = {
    name: string,
    groupName: string,
    groupCategory: string[],
    cardProductId: number,
    password: string,
};

export type CreateGroupResponse = {
    message: string;
    result: {
        groupId: number,
        groupName: string,
        accountId : number,
        accountNumber : string,
        cardId : number,
        chatRoomId : number,
    };
}

export async function createGroup(payload: CreateGroupRequest): Promise<CreateGroupResponse> {
    const response = await authApi.post<CreateGroupResponse>("/groups/account", payload);
    return response.data;
}


export type GetGroupTypeResponse = {
  message : string;
  result: {
  typeId: number;
  typeName: string;
}[]
}

export async function getGroupType(): Promise<GetGroupTypeResponse> {
    const response = await authApi.get<GetGroupTypeResponse>("/groups/types");
    return response.data;
}

export type GetRecommendCardListResponse = {
  message : string;
  result :{
    groupCategoryName : string,
    name : string,
    years : string,
    gender : string,
    recommendedCards : {
      cardProductId : number,
      cardName : string,
      frontImageUrl : string,
      backImageUrl : string,
      description : string,
      cardBenefit:{
        categoryName : string,
        discountRate : number,
      }[]
    }[]
  }
}

export async function getGroupRecommendCardList(): Promise<GetRecommendCardListResponse> {
    const response = await authApi.get<GetRecommendCardListResponse>("/groups/types");
    return response.data;
}
