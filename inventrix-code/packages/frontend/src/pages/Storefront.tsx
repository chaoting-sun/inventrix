import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>🛍️ Featured Products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)', overflow: 'hidden', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--px-ink)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--px-shadow)'; }}>
              <div style={{ position: 'relative', paddingTop: '75%', background: 'var(--px-lcd-light)', borderBottom: 'var(--px-border)' }}>
                <img src={product.image_url} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>{product.name}</h3>
                <p style={{ color: 'var(--px-muted)', fontSize: '10px', marginBottom: '1rem' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--px-pink)' }}>${product.price}</span>
                  <span style={{ whiteSpace: 'nowrap', padding: '4px 8px', border: '2px solid currentColor', fontSize: '10px', color: product.stock > 0 ? 'var(--px-green)' : 'var(--px-red)' }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
