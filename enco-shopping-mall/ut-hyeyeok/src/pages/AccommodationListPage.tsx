import { useEffect, useState } from 'react';
import Header from '../components/Header';
import AccommodationCard from '../components/AccommodationCard';
import { fetchAllProducts } from '../api/products';
import type { Accommodation } from '../types/accommodation';

export default function AccommodationListPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts()
      .then(setAccommodations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Header />

      <main className="list">
        {loading && <p style={{ padding: '16px', textAlign: 'center' }}>불러오는 중...</p>}
        {error && <p style={{ padding: '16px', color: 'red' }}>{error}</p>}
        {!loading && !error && accommodations.length === 0 && (
          <p style={{ padding: '16px', textAlign: 'center' }}>등록된 상품이 없습니다.</p>
        )}
        {accommodations.map((accommodation) => (
          <AccommodationCard
            key={accommodation.id}
            accommodation={accommodation}
          />
        ))}
      </main>
    </div>
  );
}
