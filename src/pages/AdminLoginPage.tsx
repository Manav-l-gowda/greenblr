import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPABASE_FN, fnHeaders } from '@/lib/supabase';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`${SUPABASE_FN}/admin-api/login`, {
      method: 'POST',
      headers: fnHeaders,
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      sessionStorage.setItem('adminPassword', password);
      navigate('/admin');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <img
            src="/Green logo.png"
            alt="Green BLR"
            width={64}
            height={64}
            className="mx-auto mb-4 mix-blend-multiply opacity-80"
          />
          <h1 className="text-white text-xl font-bold">Organizer Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Green BLR 2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
            ← Back to site
          </a>
        </p>
      </div>
    </main>
  );
}
