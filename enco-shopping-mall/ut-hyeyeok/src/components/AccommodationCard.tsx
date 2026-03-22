import { Link } from 'react-router-dom';
import type { Accommodation } from '../types/accommodation';

type Props = {
  accommodation: Accommodation;
};

const DEFAULT_IMAGE = 'https://placehold.co/400x220?text=No+Image';

export default function AccommodationCard({ accommodation }: Props) {
  return (
    <Link to={`/accommodations/${accommodation.id}`} className="card">
      <img
        src={accommodation.imageUrl || DEFAULT_IMAGE}
        alt={accommodation.name}
        className="card-image"
      />

      <div className="card-body">
        <div className="card-header-row">
          <h2 className="card-title">{accommodation.name}</h2>
          <span className="card-rating">{accommodation.merchantName}</span>
        </div>

        <p className="card-location">{accommodation.location}</p>

        <p className="card-quantity">남은 객실 {accommodation.quantity}개</p>

        <div className="benefit-badge">ENCO PAY 결제 시 즉시 할인 혜택</div>

        <p className="card-price">1박 {accommodation.price.toLocaleString()}원</p>
      </div>
    </Link>
  );
}
