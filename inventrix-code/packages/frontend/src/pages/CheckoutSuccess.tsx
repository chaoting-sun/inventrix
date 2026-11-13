import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { mascot } from '../mascot';

interface PlacedOrder {
  id: number;
  points_spent: number;
  balance: number;
}

const danceStyle = `
@keyframes checkout-dance {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-12px) rotate(8deg); }
}
.checkout-dancer { display: inline-block; margin: 0 0.75rem; animation: checkout-dance 0.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .checkout-dancer { animation: none; } }
`;

export default function CheckoutSuccess() {
  const order = useLocation().state as PlacedOrder | null;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!order) return;
    mascot.dance();
    headingRef.current?.focus();
  }, [order]);

  if (!order) return <Navigate to="/orders" replace />;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '8px', padding: '3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <style>{danceStyle}</style>
      <p aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        ♪ ♪ <span className="checkout-dancer">( ^ o ^ )</span> ♪ ♪
      </p>
      <h1 ref={headingRef} tabIndex={-1} style={{ marginBottom: '1rem', outline: 'none' }}>下單成功！</h1>
      <p style={{ marginBottom: '0.5rem' }}>訂單編號 #{order.id}</p>
      <p style={{ marginBottom: '2rem' }}>花費 ★ {order.points_spent}，剩下 ★ {order.balance}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/orders" style={{ color: '#667eea', fontWeight: 600 }}>查看我的訂單</Link>
        <Link to="/" style={{ color: '#667eea', fontWeight: 600 }}>繼續逛逛</Link>
      </div>
    </div>
  );
}
