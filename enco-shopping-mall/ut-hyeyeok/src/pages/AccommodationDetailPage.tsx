import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct } from '../api/products';
import type { Accommodation } from '../types/accommodation';
import Header from '../components/Header';

const DEFAULT_IMAGE = 'https://placehold.co/430x290?text=No+Image';

export default function AccommodationDetailPage() {
  const { accommodationId } = useParams();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accommodationId) return;
    fetchProduct(Number(accommodationId))
      .then(setAccommodation)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accommodationId]);

  const handleEncoPay = () => {
    if (!accommodation) return;

    const orderId = accommodation.id;
    const price = accommodation.price;

    const callbackUrl = encodeURIComponent(
      'http://ssafywte.site/payment-success'
    );

    const deepLink =
      `enco://app/pay/success?orderId=${orderId}` +
      `&amount=${price}` +
      `&callbackUrl=${callbackUrl}`;

    window.location.href = deepLink;
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <p style={{ padding: '40px 16px', textAlign: 'center' }}>불러오는 중...</p>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="page">
        <Header />
        <div className="empty-state">
          <p>{error || '숙소 정보를 찾을 수 없습니다.'}</p>
          <Link to="/" className="text-link">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <div className="page detail-page">
        <img
          src={"https://ssafywte.site/" + accommodation.imageUrl || DEFAULT_IMAGE}
          alt={accommodation.name}
          className="detail-image"
        />

        <div className="detail-content">
          <div className="detail-header-row">
            <div>
              <p className="detail-location">{accommodation.location}</p>
              <h1 className="detail-title">{accommodation.name}</h1>
            </div>
            <span className="detail-rating">{accommodation.merchantName}</span>
          </div>

          <div className="benefit-badge large">ENCO PAY 결제 시 즉시 할인 혜택</div>

          <p className="detail-description">{accommodation.description}</p>

          <section className="info-box">
            <h2 className="section-title">예약 정보</h2>
            <p>체크인 15:00</p>
            <p>체크아웃 11:00</p>
            <p>남은 객실 {accommodation.quantity}개</p>
          </section>
        </div>

        <div className="bottom-bar">
          <div>
            <p className="bottom-label">총 결제금액</p>
            <p className="bottom-price">
              {accommodation.price.toLocaleString()}원
            </p>
          </div>

          <button className="enco-pay-button" onClick={handleEncoPay}>
            ENCO PAY로 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
