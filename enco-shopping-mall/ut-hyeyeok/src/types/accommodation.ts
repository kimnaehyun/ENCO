// 백엔드 ProductResponseDto에 맞춘 타입
export type Accommodation = {
  id: number;
  name: string;
  merchantName: string;
  location: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string | null;
};

// 백엔드 CommonResponse 래퍼
export type CommonResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};
