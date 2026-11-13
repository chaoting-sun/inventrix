import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: number;
  subtotal: number;
  gst: number;
  total: number;
  status: string;
  created_at: string;
}

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setOrders);
  }, [token]);

  const statusColors: Record<string, string> = {
    pending: '#ffc107',
    processing: '#17a2b8',
    shipped: '#007bff',
    delivered: '#28a745',
    cancelled: '#dc3545'
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => (
          <div key={order.id} style={{ background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Order #{order.id}</h3>
                <p style={{ color: 'var(--px-muted)', fontSize: '10px' }}>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', color: 'var(--px-muted)', margin: '0.25rem 0' }}>Subtotal: ${order.subtotal.toFixed(2)}</p>
                <p style={{ fontSize: '10px', color: 'var(--px-muted)', margin: '0.25rem 0' }}>GST (10%): ${order.gst.toFixed(2)}</p>
                <p style={{ fontSize: '14px' }}>Total: ${order.total.toFixed(2)}</p>
                <span style={{ padding: '0.25rem 0.75rem', border: '2px solid var(--px-ink)', fontSize: '10px', background: statusColors[order.status], color: 'white' }}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
