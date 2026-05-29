import { Router } from 'express';
import { createServiceClient } from '../lib/supabase';
import {
  isAdminAuthenticated,
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
} from '../lib/adminAuth';

const router = Router();

const unauthorized = (res: any) => res.status(401).json({ error: 'Unauthorized' });

// Auth check (used by the React AdminPage on mount)
router.get('/me', (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);
  return res.json({ ok: true });
});

// Login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createSessionToken();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
    path: '/',
  });
  return res.json({ success: true });
});

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
});

// Stats
router.get('/stats', async (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);

  const db = createServiceClient();
  const [runnersRes, revenueRes, dailyRes, categoryRes, tshirtRes] = await Promise.all([
    db.from('runners').select('id', { count: 'exact', head: true }),
    db.from('registrations').select('total_amount').eq('status', 'paid'),
    db.rpc('daily_registration_counts'),
    db.from('runners').select('category'),
    db.from('runners').select('tshirt_size'),
  ]);

  const totalRunners = runnersRes.count ?? 0;
  const totalRevenue = (revenueRes.data ?? []).reduce(
    (s: number, r: any) => s + Number(r.total_amount), 0
  );

  const catCounts: Record<string, number> = {};
  for (const r of categoryRes.data ?? []) {
    catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
  }

  const tshirtCounts: Record<string, number> = {};
  for (const r of tshirtRes.data ?? []) {
    tshirtCounts[r.tshirt_size] = (tshirtCounts[r.tshirt_size] ?? 0) + 1;
  }

  return res.json({ totalRunners, totalRevenue, daily: dailyRes.data ?? [], categories: catCounts, tshirts: tshirtCounts });
});

// Export CSV / JSON
router.get('/export', async (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);

  const db = createServiceClient();
  const { data, error } = await db
    .from('runners')
    .select(`
      first_name, last_name, email, phone, gender, dob,
      emergency_contact_name, emergency_contact_phone,
      tshirt_size, category, bib_number, created_at,
      registrations!inner(razorpay_order_id, razorpay_payment_id, total_amount, status, runner_count)
    `)
    .eq('registrations.status', 'paid')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  if (req.query.json === '1') return res.json({ runners: data });

  const headers = [
    'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'DOB',
    'Emergency Contact', 'Emergency Phone', 'T-Shirt Size', 'Category',
    'Bib Number', 'Order ID', 'Payment ID', 'Registered At',
  ];
  const rows = (data || []).map((r: any) => [
    r.first_name, r.last_name, r.email, r.phone, r.gender, r.dob,
    r.emergency_contact_name, r.emergency_contact_phone,
    r.tshirt_size, r.category, r.bib_number || '',
    r.registrations?.razorpay_order_id || '',
    r.registrations?.razorpay_payment_id || '',
    r.created_at,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="greenblr2-runners-${Date.now()}.csv"`);
  return res.send(csv);
});

// List coupons
router.get('/coupons', async (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);
  const db = createServiceClient();
  const { data, error } = await db.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ coupons: data });
});

// Create coupon
router.post('/coupons', async (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);
  const { code, discount_type, discount_value, max_uses, expires_at } = req.body;

  if (!code || !discount_type || discount_value == null) {
    return res.status(400).json({ error: 'code, discount_type, and discount_value are required' });
  }
  if (!['percentage', 'fixed'].includes(discount_type)) {
    return res.status(400).json({ error: 'discount_type must be percentage or fixed' });
  }
  if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
    return res.status(400).json({ error: 'Percentage must be between 1 and 100' });
  }
  if (discount_type === 'fixed' && discount_value <= 0) {
    return res.status(400).json({ error: 'Fixed discount must be greater than 0' });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('coupons')
    .insert({
      code: code.trim().toUpperCase(),
      discount_type,
      discount_value: Number(discount_value),
      max_uses: max_uses ? Number(max_uses) : null,
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Coupon code already exists' });
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json({ coupon: data });
});

// Toggle coupon active state
router.patch('/coupons', async (req, res) => {
  if (!isAdminAuthenticated(req)) return unauthorized(res);
  const { id, is_active } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  const db = createServiceClient();
  const { data, error } = await db
    .from('coupons')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ coupon: data });
});

export default router;
