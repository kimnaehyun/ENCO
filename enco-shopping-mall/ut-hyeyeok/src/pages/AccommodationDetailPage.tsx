import { Link, useNavigate, useParams } from 'react-router-dom';
import { accommodations } from '../data/accommodations';
import Header from "../components/Header";

export default function AccommodationDetailPage() {
  const { accommodationId } = useParams();
  const navigate = useNavigate();

  const accommodation = accommodations.find(
    (item) => item.id === Number(accommodationId)
  );

  const handleEncoPay = () => {
    if (!accommodation) return;

    navigate('/payment-success', {
      state: {
        name: accommodation.name,
        price: accommodation.price,
      },
    });
  };

  if (!accommodation) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>숙소 정보를 찾을 수 없습니다.</p>
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
        src={accommodation.imageUrl}
        alt={accommodation.name}
        className="detail-image"
      />

      <div className="detail-content">
        <div className="detail-header-row">
          <div>
            <p className="detail-location">{accommodation.location}</p>
            <h1 className="detail-title">{accommodation.name}</h1>
          </div>
          <span className="detail-rating">★ {accommodation.rating}</span>
        </div>

        <div className="benefit-badge large">{accommodation.benefitText}</div>

        <p className="detail-description">{accommodation.description}</p>

        <section className="info-box">
          <h2 className="section-title">예약 정보</h2>
          <p>체크인 {accommodation.checkIn}</p>
          <p>체크아웃 {accommodation.checkOut}</p>
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