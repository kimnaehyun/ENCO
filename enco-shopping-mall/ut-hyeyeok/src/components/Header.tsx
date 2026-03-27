import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        여기 <span className="logo-highlight">엇-혜역</span>
      </div>
    </header>
  );
}