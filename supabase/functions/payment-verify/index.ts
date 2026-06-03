import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get('RAZORPAY_KEY_SECRET')!
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const raw = await crypto.subtle.sign('HMAC', key, encoder.encode(`${orderId}|${paymentId}`))
  const hex = Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === signature
}

async function sendConfirmationEmail(registration: any, runners: any[]) {
  const totalFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(registration.total_amount)

  const runnersHtml = runners.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
      <td style="padding:8px 12px;border:1px solid #e0e0e0">${i + 1}</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0">${r.first_name} ${r.last_name}</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0">${r.category}</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0">${r.tshirt_size}</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0">${r.gender}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:#1a6b2a;padding:32px 40px;text-align:center">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800">GREEN BLR 2.0</h1>
          <p style="color:#90ee90;margin:8px 0 0;font-size:14px">Every Runner Plants a Tree 🌳</p>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="color:#1a6b2a;margin:0 0 8px;font-size:22px">You're registered!</h2>
          <p style="color:#555;margin:0 0 24px;font-size:15px">
            Congratulations — your spot${runners.length > 1 ? 's are' : ' is'} confirmed for <strong>Green BLR 2.0</strong> on
            <strong>August 16, 2026</strong> in Bengaluru.
          </p>
          <div style="background:#f0faf2;border:1px solid #c3e6cb;border-radius:6px;padding:20px;margin-bottom:24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="color:#555;font-size:13px">Order ID</td>
                <td align="right" style="color:#333;font-size:13px;font-weight:bold">${registration.razorpay_order_id}</td></tr>
              <tr><td style="color:#555;font-size:13px;padding-top:8px">Payment ID</td>
                <td align="right" style="color:#333;font-size:13px;font-weight:bold;padding-top:8px">${registration.razorpay_payment_id}</td></tr>
              <tr><td style="color:#555;font-size:13px;padding-top:8px">Runners</td>
                <td align="right" style="color:#333;font-size:13px;font-weight:bold;padding-top:8px">${registration.runner_count}</td></tr>
              <tr><td style="color:#1a6b2a;font-size:15px;font-weight:bold;padding-top:12px;border-top:1px solid #c3e6cb">Total Paid</td>
                <td align="right" style="color:#1a6b2a;font-size:15px;font-weight:bold;padding-top:12px;border-top:1px solid #c3e6cb">${totalFormatted}</td></tr>
            </table>
          </div>
          <h3 style="color:#333;margin:0 0 12px;font-size:16px">Runner Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#1a6b2a;color:#fff">
              <th style="padding:8px 12px;border:1px solid #1a6b2a;text-align:left">#</th>
              <th style="padding:8px 12px;border:1px solid #1a6b2a;text-align:left">Name</th>
              <th style="padding:8px 12px;border:1px solid #1a6b2a;text-align:left">Category</th>
              <th style="padding:8px 12px;border:1px solid #1a6b2a;text-align:left">T-Shirt</th>
              <th style="padding:8px 12px;border:1px solid #1a6b2a;text-align:left">Gender</th>
            </tr>
            ${runnersHtml}
          </table>
          <div style="background:#fff8e1;border-left:4px solid #f5c518;border-radius:4px;padding:16px;margin-top:24px">
            <p style="margin:0;font-size:14px;color:#555"><strong>What's next?</strong></p>
            <ul style="margin:8px 0 0;padding-left:20px;color:#555;font-size:14px">
              <li style="margin-bottom:6px">Bib numbers will be shared 48 hours before the event</li>
              <li style="margin-bottom:6px">Race kit collection details will be emailed separately</li>
              <li>Follow us on Instagram @greenblr.run for updates</li>
            </ul>
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;color:#999;font-size:12px">
            Green BLR 2.0 · Bengaluru's Largest Green Movement<br>
            Questions? Email us at <a href="mailto:Green@bengaluruletsrun.com" style="color:#1a6b2a">Green@bengaluruletsrun.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM_EMAIL') || 'tickets@bengaluruletsrun.com',
      to: registration.lead_email,
      subject: `✅ Registration Confirmed — Green BLR 2.0 (${runners.length} runner${runners.length > 1 ? 's' : ''})`,
      html,
    }),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, runners } = await req.json()

    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return Response.json({ error: 'Invalid payment signature' }, { headers: corsHeaders, status: 400 })
    }

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: registration, error: regErr } = await db
      .from('registrations')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single()

    if (regErr || !registration) throw new Error('Registration not found')

    const runnerRows = runners.map((r: any) => ({
      registration_id: registration.id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      phone: r.phone,
      gender: r.gender,
      dob: r.dob,
      emergency_contact_name: r.emergency_contact_name,
      emergency_contact_phone: r.emergency_contact_phone,
      tshirt_size: r.tshirt_size,
      category: r.category,
    }))

    const { data: insertedRunners, error: runnerErr } = await db.from('runners').insert(runnerRows).select()
    if (runnerErr) throw runnerErr

    if (registration.coupon_id) {
      await db.rpc('increment_coupon_uses', { coupon_id: registration.coupon_id })
    }

    try {
      await sendConfirmationEmail(registration, insertedRunners)
    } catch (emailErr) {
      console.error('Email failed (non-fatal):', emailErr)
    }

    return Response.json({ success: true, registrationId: registration.id }, { headers: corsHeaders })
  } catch (err: any) {
    console.error('payment-verify error:', err)
    return Response.json({ error: 'Payment verification failed' }, { headers: corsHeaders, status: 500 })
  }
})
