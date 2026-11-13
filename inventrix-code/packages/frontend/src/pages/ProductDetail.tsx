import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { mascot } from '../mascot';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  point_price: number;
  stock: number;
  image_url: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    add({ product_id: product.id, name: product.name, image_url: product.image_url, point_price: product.point_price, stock: product.stock, quantity });
    mascot.happy();
    setMessage('已加入購物車！');
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)', padding: '2rem' }}>
        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '400px', objectFit: 'cover', border: 'var(--px-border)', marginBottom: '2rem' }} />
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{product.name}</h1>
        <p style={{ color: 'var(--px-muted)', marginBottom: '2rem' }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.5rem', color: 'var(--px-pink)' }}>★ {product.point_price} 點</span>
          <span style={{ fontSize: '1rem', color: product.stock > 0 ? 'var(--px-green)' : 'var(--px-red)' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input type="number" aria-label="數量" min="1" max={product.stock} value={quantity} disabled={product.stock <= 0} onChange={e => setQuantity(Math.max(1, Math.min(product.stock, Math.floor(Number(e.target.value)) || 1)))} style={{ width: '100px' }} />
          <button onClick={handleAdd} disabled={product.stock <= 0} style={{ flex: 1 }}>{product.stock > 0 ? '加入購物車' : '已售完'}</button>
        </div>
        {message && <p style={{ marginTop: '1rem', color: 'var(--px-green)' }}>{message} <Link to="/cart" style={{ color: 'var(--px-pink)' }}>前往購物車</Link></p>}
      </div>
    </div>
  );
}
