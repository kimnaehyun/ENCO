import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import AccommodationListPage from './pages/AccommodationListPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import TestDeepLink from './pages/TestDeepLink';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccommodationListPage />} />
        <Route
          path="/accommodations/:accommodationId"
          element={<AccommodationDetailPage />}
        />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path = "/deepLinktest" element={<TestDeepLink/>}/>
      </Routes>
    </BrowserRouter>
  );
}