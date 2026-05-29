import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => {
        if (res.ok) {
          setAuthorized(true);
        } else {
          navigate('/admin/login', { replace: true });
        }
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
