import { Link } from 'react-router-dom';
import type { Accommodation } from '../types/accommodation';

type Props = {
  accommodation: Accommodation;
};

export default function AccommodationCard({ accommodation }: Props) {
  return (
    <Link to={`/accommodations/${accommodation.id}`} className="card">
      <img
        src={accommodation.imageUrl}
        alt={accommodation.name}
        className="card-image"
      />

      <div className="card-body">
        <div className="card-header-row">
          <h2 className="card-title">{accommodation.name}</h2>
          <span className="card-rating">★ {accommodation.rating}</span>
        </div>

        <p className="card-location">{accommodation.location}</p>

        <p className="card-quantity">남은 객실 {accommodation.quantity}개</p>

        <div className="benefit-badge">{accommodation.benefitText}</div>

        <p className="card-price">1박 {accommodation.price.toLocaleString()}원</p>
      </div>
    </Link>
  );
}