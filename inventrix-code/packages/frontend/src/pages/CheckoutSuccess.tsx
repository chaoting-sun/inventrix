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
  from { transform: translateX(-8px) rotate(-12deg); }
  to { transform: translateX(8px) rotate(12deg); }
}
.checkout-dancer { display: inline-block; margin: 0 0.75rem; animation: checkout-dance 0.5s steps(2, jump-none) infinite alternate; }
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
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)', padding: '3rem', textAlign: 'center' }}>
      <style>{danceStyle}</style>
      <p aria-hidden="true" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--px-pink)' }}>
        ♪ ♪ <span className="checkout-dancer">( ^ o ^ )</span> ♪ ♪
      </p>
      <h1 ref={headingRef} tabIndex={-1} style={{ marginBottom: '1rem', fontSize: '1.5rem', outline: 'none' }}>下單成功！</h1>
      <p style={{ marginBottom: '0.5rem' }}>訂單編號 #{order.id}</p>
      <p style={{ marginBottom: '2rem' }}>花費 ★ {order.points_spent}，剩下 ★ {order.balance}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/orders" style={{ color: 'var(--px-pink)' }}>查看我的訂單</Link>
        <Link to="/" style={{ color: 'var(--px-pink)' }}>繼續逛逛</Link>
      </div>
    </div>
  );
}
