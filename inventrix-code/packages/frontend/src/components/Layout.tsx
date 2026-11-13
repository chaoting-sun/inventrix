import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import Poops from './Poops';

export default function Layout() {
  const { user, logout } = useAuth();
  const { balance } = usePoints();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--px-ink)', color: 'white', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid var(--px-pink)' }}>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem' }}>✨ Inventrix</Link>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', opacity: 0.9, transition: 'opacity 0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}>Store</Link>
          {user && <Link to="/orders" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', opacity: 0.9, transition: 'opacity 0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}>My Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', opacity: 0.9, transition: 'opacity 0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}>Admin</Link>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              {balance !== null && <span style={{ padding: '8px 0', color: 'var(--px-yellow)' }}>★ {balance} 點</span>}
              <span style={{ padding: '8px 0' }}>👤 {user.name}</span>
              <button onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', padding: '8px 16px', border: '4px solid white' }}>Login</Link>
              <Link to="/register" style={{ color: 'var(--px-ink)', textDecoration: 'none', padding: '8px 16px', background: 'var(--px-yellow)', border: '4px solid var(--px-yellow)' }}>Register</Link>
            </>
          )}
        </div>
      </nav>
      <main style={{ flex: 1, padding: '3rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
      {user && !pathname.startsWith('/admin') && <Poops />}
    </div>
  );
}
