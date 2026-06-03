import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isAuthorized(req: Request): boolean {
  const pw = req.headers.get('x-admin-password')
  return pw === Deno.env.get('ADMIN_PASSWORD')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const route = url.pathname.split('/').pop()

  // Login — just verify the password, no session needed
  if (route === 'login') {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    const { password } = await req.json()
    if (password === Deno.env.get('ADMIN_PASSWORD')) return json({ ok: true })
    return json({ error: 'Invalid credentials' }, 401)
  }

  // Me — verify the header password
  if (route === 'me') {
    if (!isAuthorized(req)) return json({ error: 'Unauthorized' }, 401)
    return json({ ok: true })
  }

  // All routes below require auth
  if (!isAuthorized(req)) return json({ error: 'Unauthorized' }, 401)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Stats
  if (route === 'stats' && req.method === 'GET') {
    const [runnersRes, revenueRes, dailyRes, categoryRes, tshirtRes] = await Promise.all([
      db.from('runners').select('id', { count: 'exact', head: true }),
      db.from('registrations').select('total_amount').eq('status', 'paid'),
      db.rpc('daily_registration_counts'),
      db.from('runners').select('category'),
      db.from('runners').select('tshirt_size'),
    ])

    const totalRunners = runnersRes.count ?? 0
    const totalRevenue = (revenueRes.data ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0)

    const catCounts: Record<string, number> = {}
    for (const r of categoryRes.data ?? []) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1

    const tshirtCounts: Record<string, number> = {}
    for (const r of tshirtRes.data ?? []) tshirtCounts[r.tshirt_size] = (tshirtCounts[r.tshirt_size] ?? 0) + 1

    return json({ totalRunners, totalRevenue, daily: dailyRes.data ?? [], categories: catCounts, tshirts: tshirtCounts })
  }

  // Coupons
  if (route === 'coupons') {
    if (req.method === 'GET') {
      const { data, error } = await db.from('coupons').select('*').order('created_at', { ascending: false })
      if (error) return json({ error: error.message }, 500)
      return json({ coupons: data })
    }

    if (req.method === 'POST') {
      const { code, discount_type, discount_value, max_uses, expires_at } = await req.json()
      if (!code || !discount_type || discount_value == null) {
        return json({ error: 'code, discount_type, and discount_value are required' }, 400)
      }
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
        .single()
      if (error) {
        if (error.code === '23505') return json({ error: 'Coupon code already exists' }, 409)
        return json({ error: error.message }, 500)
      }
      return json({ coupon: data }, 201)
    }

    if (req.method === 'PATCH') {
      const { id, is_active } = await req.json()
      if (!id) return json({ error: 'id required' }, 400)
      const { data, error } = await db.from('coupons').update({ is_active }).eq('id', id).select().single()
      if (error) return json({ error: error.message }, 500)
      return json({ coupon: data })
    }
  }

  // Export runners
  if (route === 'export' && req.method === 'GET') {
    const { data, error } = await db
      .from('runners')
      .select(`first_name, last_name, email, phone, gender, dob,
        emergency_contact_name, emergency_contact_phone,
        tshirt_size, category, bib_number, created_at,
        registrations!inner(razorpay_order_id, razorpay_payment_id, total_amount, status, runner_count)`)
      .eq('registrations.status', 'paid')
      .order('created_at', { ascending: false })

    if (error) return json({ error: error.message }, 500)

    if (url.searchParams.get('json') === '1') return json({ runners: data })

    const headers = ['First Name','Last Name','Email','Phone','Gender','DOB','Emergency Contact','Emergency Phone','T-Shirt Size','Category','Bib Number','Order ID','Payment ID','Registered At']
    const rows = (data || []).map((r: any) => [
      r.first_name, r.last_name, r.email, r.phone, r.gender, r.dob,
      r.emergency_contact_name, r.emergency_contact_phone,
      r.tshirt_size, r.category, r.bib_number || '',
      r.registrations?.razorpay_order_id || '',
      r.registrations?.razorpay_payment_id || '',
      r.created_at,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="greenblr2-runners-${Date.now()}.csv"`,
      },
    })
  }

  return json({ error: 'Not found' }, 404)
})
