import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@bmm/api-client';
import { useAuthStore } from './AuthStore';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokens = await apiClient.register(email, password);
      // Auto-login after register
      const ok = await login(email, password);
      if (ok || tokens.token) navigate('/');
      else setError('Registration succeeded but login failed.');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <div
      data-testid="signup-page"
      style={{ padding: '2rem', maxWidth: 400, margin: '0 auto', fontFamily: 'sans-serif' }}
    >
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            data-testid="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            data-testid="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', marginTop: 4 }}
          />
        </div>
        {error && (
          <p data-testid="signup-error" style={{ color: 'red' }}>
            {error}
          </p>
        )}
        <button
          data-testid="signup-submit"
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
          Create Account
        </button>
      </form>
      <p>
        <Link to="/login">Already have an account? Sign in</Link>
      </p>
    </div>
  );
}
