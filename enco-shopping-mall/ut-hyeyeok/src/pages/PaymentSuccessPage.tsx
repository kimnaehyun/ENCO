import { Link, useLocation, useNavigate } from 'react-router-dom';

type PaymentState = {
  name?: string;
  price?: number;
};

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as PaymentState;

  const name = state.name ?? '선택한 숙소';
  const price = state.price ?? 0;

  return (
    <div className="page success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <p className="success-label">결제 완료</p>
        <h1 className="success-title">ENCO PAY 결제가 완료되었습니다</h1>

        <div className="success-info">
          <p>
            <strong>숙소명</strong>
          </p>
          <p>{name}</p>
        </div>

        <div className="success-info">
          <p>
            <strong>결제금액</strong>
          </p>
          <p>{price.toLocaleString()}원</p>
        </div>

        <button className="primary-button" onClick={() => navigate('/')}>
          홈으로 이동
        </button>

        <Link to="/" className="text-link centered">
          숙소 목록 다시 보기
        </Link>
      </div>
    </div>
  );
}