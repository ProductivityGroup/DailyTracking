import { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'shared@dailytracking.app',
        password,
      });
      if (error) throw error;
      // The AuthContext will automatically pick up the session change and re-render
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Incorrect group password.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>DailyTracking</h1>
        <p className="auth-subtitle">
          Enter the group password to access your shared habits.
        </p>

        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="password"
            placeholder="Shared Group Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Decrypting...' : 'Enter Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
