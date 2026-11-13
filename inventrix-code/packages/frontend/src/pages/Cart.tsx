import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePoints } from '../context/PointsContext';
import { createOrder } from '../orders';

const checkoutErrors: Record<number, string> = {
  400: '購買數量不正確，請重新確認。',
  402: '點數不足，去清便便吧！',
  409: '有商品庫存不足，請調整數量。',
};

const card = { background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };

export default function Cart() {
  const { user, token } = useAuth();
  const { items, setQuantity, remove, clear } = useCart();
  const { balance, setBalance } = usePoints();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.point_price * i.quantity, 0);
  const shortfall = balance === null ? 0 : total - balance;

  const handleCheckout = async () => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await createOrder(token, items.map(i => ({ product_id: i.product_id, quantity: i.quantity })));
      if (!res.ok) {
        setError(checkoutErrors[res.status] ?? '結帳失敗，請稍後再試。');
        return;
      }
      const order = await res.json();
      setBalance(order.balance);
      clear();
      navigate('/checkout/success', { state: order });
    } catch {
      setError('結帳失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div style={{ ...card, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>我的購物車</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>購物車空空的，去逛逛吧！</p>
        <Link to="/" style={{ color: '#667eea', fontWeight: 600 }}>回商品列表</Link>
      </div>
    );
  }

  return (
    <div style={{ ...card, maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>我的購物車</h1>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map(item => (
          <li key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={item.image_url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
            <span style={{ flex: 1, fontWeight: 600 }}>{item.name}</span>
            <span>★ {item.point_price} x</span>
            <button aria-label={`減少 ${item.name} 數量`} onClick={() => setQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '6px 12px' }}>-</button>
            <span aria-label={`${item.name} 數量`} style={{ minWidth: '2ch', textAlign: 'center' }}>{item.quantity}</span>
            <button aria-label={`增加 ${item.name} 數量`} onClick={() => setQuantity(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock} style={{ padding: '6px 12px' }}>+</button>
            <span style={{ minWidth: '5rem', textAlign: 'right' }}>★ {item.point_price * item.quantity}</span>
            <button onClick={() => remove(item.product_id)} style={{ background: '#dc3545', color: 'white', padding: '6px 12px' }}>移除</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '2rem', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>合計：★ {total}</p>
        <p>我的點數：{balance === null ? '登入後顯示' : `★ ${balance}`}</p>
        {shortfall > 0 && <p style={{ color: '#dc3545' }}>還差 ★ {shortfall}，去清便便吧！</p>}
        {error && <p role="alert" style={{ color: '#dc3545' }}>{error}</p>}
        <button onClick={handleCheckout} disabled={submitting || shortfall > 0} style={{ background: '#007bff', color: 'white' }}>用點數結帳</button>
      </div>
    </div>
  );
}
