import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';
import { SUPABASE_FN, fnHeaders } from '@/lib/supabase';

export default function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const pw = sessionStorage.getItem('adminPassword');
    if (!pw) { navigate('/admin/login', { replace: true }); setChecking(false); return; }
    fetch(`${SUPABASE_FN}/admin-api/me`, {
      headers: { ...fnHeaders, 'x-admin-password': pw },
    })
      .then((res) => {
        if (res.ok) setAuthorized(true);
        else { sessionStorage.removeItem('adminPassword'); navigate('/admin/login', { replace: true }); }
      })
      .catch(() => navigate('/admin/login', { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return <AdminDashboard />;
}
