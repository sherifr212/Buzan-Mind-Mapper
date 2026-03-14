import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './AuthStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
    else setError('Login failed. Check your credentials.');
  };

  return (
    <div
      data-testid="login-page"
      style={{ padding: '2rem', maxWidth: 400, margin: '0 auto', fontFamily: 'sans-serif' }}
    >
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            data-testid="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', marginTop: 4 }}
          />
        </div>
        {error && (
          <p data-testid="login-error" style={{ color: 'red' }}>
            {error}
          </p>
        )}
        <button
          data-testid="login-submit"
          type="submit"
          style={{
            padding: '8px 20px',
            background: '#1e293b',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          Sign In
        </button>
      </form>
      <p>
        <Link to="/signup">Don&apos;t have an account? Sign up</Link>
      </p>
      <p>
        <Link to="/">← Back to home</Link>
      </p>
    </div>
  );
}
