import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);

  const status = params.get('status');
  const amount = Number(params.get('amount') ?? 0);
  const orderId = params.get('orderId');

  return (
    <div className="page success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <p className="success-label">
          {status === 'success' ? '결제 완료' : '결제 상태 확인'}
        </p>
        <h1 className="success-title">
          {amount.toLocaleString()}원 결제가 완료되었습니다
        </h1>

        <div className="success-info">
          <p>
            <strong>주문번호</strong>
          </p>
          <p>{orderId ?? '-'}</p>
        </div>

        <div className="success-info">
          <p>
            <strong>결제금액</strong>
          </p>
          <p>{amount.toLocaleString()}원</p>
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