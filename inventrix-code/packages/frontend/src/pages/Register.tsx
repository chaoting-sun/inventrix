import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', padding: '3rem', background: 'var(--px-paper)', border: 'var(--px-border)', boxShadow: 'var(--px-shadow)' }}>
      <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.25rem', color: 'var(--px-pink)' }}>Join Inventrix</h1>
      <p style={{ textAlign: 'center', color: 'var(--px-muted)', marginBottom: '2rem' }}>Create your account to get started</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={{ color: 'var(--px-red)', textAlign: 'center', fontSize: '0.9rem' }}>❌ {error}</p>}
        <button type="submit" style={{ padding: '14px' }}>Register</button>
      </form>
      <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--px-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--px-pink)' }}>Login</Link>
      </p>
    </div>
  );
}
