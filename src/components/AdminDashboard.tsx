import { useState, useEffect, useCallback } from 'react';

interface DailyCount { date: string; count: number; }
interface Stats {
  totalRunners: number;
  totalRevenue: number;
  daily: DailyCount[];
  categories: Record<string, number>;
  tshirts: Record<string, number>;
}
interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

function BarChart({ data }: { data: DailyCount[] }) {
  if (!data.length) return (
    <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
      No registrations in the last 30 days
    </div>
  );
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-40 pt-4">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
          <div
            className="w-full bg-green-600 rounded-t-sm hover:bg-green-400 transition-colors cursor-default"
            style={{ height: `${Math.max((d.count / max) * 128, 4)}px` }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
              {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function generateCode() {
  const adj = ['GREEN', 'RUN', 'TREE', 'BLR', 'ECO', 'FAST'];
  const num = Math.floor(1000 + Math.random() * 9000);
  return adj[Math.floor(Math.random() * adj.length)] + num;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'runners'>('overview');

  const [form, setForm] = useState({
    code: generateCode(),
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    expires_at: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetch('/api/admin/stats');
    if (res.ok) setStats(await res.json());
    setStatsLoading(false);
  }, []);

  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    const res = await fetch('/api/admin/coupons');
    if (res.ok) setCoupons((await res.json()).coupons);
    setCouponsLoading(false);
  }, []);

  useEffect(() => { fetchStats(); fetchCoupons(); }, [fetchStats, fetchCoupons]);

  async function createCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setCreateSuccess(`Coupon "${data.coupon.code}" created!`);
      setForm({ code: generateCode(), discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
      fetchCoupons();
    } else {
      setCreateError(data.error || 'Failed to create coupon');
    }
    setCreating(false);
  }

  async function toggleCoupon(id: string, is_active: boolean) {
    await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    });
    fetchCoupons();
  }

  const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950 z-10">
        <div className="flex items-center gap-3">
          <img src="/Green logo.png" alt="Green BLR" width={36} height={36} className="mix-blend-multiply opacity-80" />
          <div>
            <p className="font-bold text-sm">Green BLR 2.0</p>
            <p className="text-gray-500 text-xs">Organizer Dashboard</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['overview', 'coupons', 'runners'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => { fetchStats(); fetchCoupons(); }}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <a
            href="/api/admin/export"
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-5 animate-pulse h-20" />
                ))
              ) : (
                <>
                  <StatCard label="Total Runners" value={stats?.totalRunners.toLocaleString('en-IN') ?? '0'} />
                  <StatCard label="Revenue Collected" value={INR(stats?.totalRevenue ?? 0)} />
                  <StatCard
                    label="Category Split"
                    value={`${stats?.categories['3K'] ?? 0} · ${stats?.categories['5K'] ?? 0} · ${stats?.categories['10K'] ?? 0}`}
                    sub="3K · 5K · 10K"
                  />
                  <StatCard
                    label="Today's Registrations"
                    value={String(
                      stats?.daily.find(
                        (d) => d.date === new Date().toISOString().split('T')[0]
                      )?.count ?? 0
                    )}
                  />
                </>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-200">Registrations — Last 30 Days</h2>
                <span className="text-gray-500 text-xs">Hover bars for date details</span>
              </div>
              {statsLoading ? (
                <div className="h-40 animate-pulse bg-gray-700 rounded" />
              ) : (
                <BarChart data={stats?.daily ?? []} />
              )}
              {stats?.daily && stats.daily.length > 0 && (
                <div className="flex justify-between mt-2 text-gray-600 text-xs">
                  <span>{new Date(stats.daily[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  {stats.daily.length > 2 && (
                    <span>{new Date(stats.daily[Math.floor(stats.daily.length / 2)].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  )}
                  <span>{new Date(stats.daily[stats.daily.length - 1].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-200 mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {['3K', '5K', '10K'].map((cat) => {
                    const count = stats?.categories[cat] ?? 0;
                    const total = stats?.totalRunners ?? 1;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{cat}</span>
                          <span className="text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-200 mb-4">T-Shirt Size Breakdown</h3>
                <div className="space-y-3">
                  {['XS-36', 'S-38', 'M-40', 'L-42', 'XL-44'].map((size) => {
                    const count = stats?.tshirts[size] ?? 0;
                    const total = stats?.totalRunners ?? 1;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={size}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{size}</span>
                          <span className="text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COUPONS TAB ── */}
        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-gray-200 mb-6">Generate New Coupon</h2>
              <form onSubmit={createCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 rounded-lg text-xs transition-colors"
                      title="Generate random code"
                    >
                      ↺
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Discount Value {form.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                    min={1}
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    placeholder={form.discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Max Uses (blank = unlimited)</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                    min={1}
                    placeholder="e.g. 50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Expiry Date (blank = never)</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {createError && <p className="sm:col-span-2 text-red-400 text-sm">{createError}</p>}
                {createSuccess && <p className="sm:col-span-2 text-green-400 text-sm">{createSuccess}</p>}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="font-semibold text-gray-200">All Coupons ({coupons.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                      {['Code', 'Discount', 'Used / Max', 'Expires', 'Status', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {couponsLoading ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                    ) : coupons.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No coupons yet</td></tr>
                    ) : (
                      coupons.map((c) => (
                        <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="px-4 py-3 font-mono font-semibold tracking-widest">{c.code}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                          </td>
                          <td className="px-4 py-3 text-gray-300">{c.current_uses} / {c.max_uses ?? '∞'}</td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {c.expires_at
                              ? new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                              : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              c.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                            }`}>
                              {c.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleCoupon(c.id, !c.is_active)}
                              className={`text-xs font-medium transition-colors ${
                                c.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                              }`}
                            >
                              {c.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── RUNNERS TAB ── */}
        {activeTab === 'runners' && <RunnersList />}
      </div>
    </div>
  );
}

function RunnersList() {
  const [runners, setRunners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/export?json=1')
      .then((r) => r.json())
      .then((d) => { setRunners(d.runners ?? []); setLoading(false); });
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">All Registered Runners ({runners.length})</h2>
        <a
          href="/api/admin/export"
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              {['Name', 'Email', 'Phone', 'Gender', 'Category', 'T-Shirt', 'Registered'].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : runners.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No runners yet</td></tr>
            ) : (
              runners.map((r: any, i: number) => (
                <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3 text-gray-300">{r.email}</td>
                  <td className="px-4 py-3 text-gray-300">{r.phone}</td>
                  <td className="px-4 py-3 text-gray-300">{r.gender}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded-full text-xs font-semibold">{r.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{r.tshirt_size}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
