import Header from "../components/Header";
import AccommodationCard from "../components/AccommodationCard";
import { accommodations } from "../data/accommodations";

export default function AccommodationListPage() {
  return (
    <div className="page">
      <Header />

      <main className="list">
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