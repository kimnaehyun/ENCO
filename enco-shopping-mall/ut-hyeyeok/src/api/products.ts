import type { Accommodation, CommonResponse } from '../types/accommodation';
import { API_BASE_URL } from './config';

export async function fetchAllProducts(): Promise<Accommodation[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products`);
  if (!res.ok) throw new Error('상품 목록을 불러오는데 실패했습니다.');
  const json: CommonResponse<Accommodation[]> = await res.json();
  return json.data;
}

export async function fetchProduct(productId: number): Promise<Accommodation> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`);
  if (!res.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
  const json: CommonResponse<Accommodation> = await res.json();
  return json.data;
}
