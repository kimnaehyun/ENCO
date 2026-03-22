
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


export type CommonResponse<T> = {
  message: string;
  result: T;
};