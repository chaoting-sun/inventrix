import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', padding: '3rem', background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)' }}>
      <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.25rem', color: 'var(--px-pink)' }}>Welcome Back</h1>
      <p style={{ textAlign: 'center', color: 'var(--px-muted)', marginBottom: '2rem' }}>Login to your Tamagotchi account</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={{ color: 'var(--px-red)', textAlign: 'center', fontSize: '0.9rem' }}>❌ {error}</p>}
        <button type="submit" style={{ padding: '14px' }}>Login</button>
      </form>
      <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--px-muted)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--px-pink)' }}>Register</Link>
      </p>
    </div>
  );
}
