import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pointPrice } from '../points';
import { mascot } from '../mascot';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
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
    add({ product_id: product.id, name: product.name, image_url: product.image_url, point_price: pointPrice(product), stock: product.stock, quantity });
    mascot.happy();
    setMessage('已加入購物車！');
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>{product.name}</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>${product.price}</span>
          <span style={{ fontSize: '1rem', color: product.stock > 0 ? '#28a745' : '#dc3545' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input type="number" aria-label="數量" min="1" max={product.stock} value={quantity} disabled={product.stock <= 0} onChange={e => setQuantity(Math.max(1, Math.min(product.stock, Math.floor(Number(e.target.value)) || 1)))} style={{ width: '100px' }} />
          <button onClick={handleAdd} disabled={product.stock <= 0} style={{ background: '#007bff', color: 'white', flex: 1 }}>{product.stock > 0 ? '加入購物車' : '已售完'}</button>
        </div>
        {message && <p style={{ marginTop: '1rem', color: '#28a745' }}>{message} <Link to="/cart" style={{ color: '#667eea', fontWeight: 600 }}>前往購物車</Link></p>}
      </div>
    </div>
  );
}
