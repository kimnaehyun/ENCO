import type { Accommodation } from '../types/accommodation';
import { images } from '../types/image'

export const accommodations: Accommodation[] = [
  {
    id: 1,
    name: '혜역 펠리스',
    location: '부산 해운대',
    price: 129000,
    quantity: 3,
    imageUrl: images.accomoone,
    rating: 4.8,
    description:
      '해운대 바다가 보이는 프리미엄 숙소입니다. 오션뷰 객실과 조식, 라운지 서비스를 제공합니다.',
    checkIn: '15:00',
    checkOut: '11:00',
    benefitText: 'ENCO PAY 결제 시 즉시 할인 혜택',
  },
  {
    id: 2,
    name: '혜역 스테이트 풀빌라',
    location: '서울 강남',
    price: 2147483647,
    quantity: 5,
    imageUrl: images.accomotwo,
    rating: 4.6,
    description:
      '강남 중심가에 위치한 실속형 비즈니스 숙소입니다. 출장과 짧은 도심 여행에 적합합니다.',
    checkIn: '16:00',
    checkOut: '11:00',
    benefitText: 'ENCO PAY 간편결제 지원',
  },
  {
    id: 3,
    name: '혜역이 집',
    location: '어디든',
    price: 1000,
    quantity: 2,
    imageUrl: images.boxjpg,
    rating: 1289.9,
    description:
      '박스 속에서 종이 내음과 자연의 소리를 즐기세요',
    checkIn: '15:00',
    checkOut: '11:00',
    benefitText: 'ENCO PAY 전용 적립 혜택',
  },
];