
export type Accommodation = {
  id: number;
  name: string;
  merchantName: string;
  location: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string | null;
  rating?: number;
};

export type CommonResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};
