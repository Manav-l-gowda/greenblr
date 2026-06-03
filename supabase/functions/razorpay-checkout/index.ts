import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "https://esm.sh/razorpay@2.9.2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICING_MAP: Record<string, number> = {
  "3k": 699,
  "5k": 999,
  "10k": 1299,
}

function applyDiscount(baseTotal: number, discountType: string, discountValue: number) {
  const discountAmount = discountType === 'percentage'
    ? Math.round((baseTotal * discountValue) / 100)
    : Math.min(discountValue, baseTotal)
  const discountedBase = Math.max(0, baseTotal - discountAmount)
  const gst = Math.round(discountedBase * 0.18)
  return { discountAmount, discountedBase, gst, total: discountedBase + gst }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { runners, couponCode } = await req.json()

    if (!runners || !Array.isArray(runners) || runners.length === 0) {
      throw new Error("No registration data received.")
    }

    // Calculate base total
    let baseTotal = 0
    for (const runner of runners) {
      const categoryKey = String(runner.category || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      baseTotal += PRICING_MAP[categoryKey] ?? 1299
    }

    // Validate coupon if provided
    let discountAmount = 0
    let couponId: string | null = null

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    if (couponCode) {
      const { data: coupon } = await db
        .from('coupons')
        .select('id, discount_type, discount_value, max_uses, current_uses, expires_at, is_active')
        .eq('code', couponCode.trim().toUpperCase())
        .single()

      const isValid = coupon &&
        coupon.is_active &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (coupon.max_uses === null || coupon.current_uses < coupon.max_uses)

      if (isValid) {
        couponId = coupon.id
        discountAmount = applyDiscount(baseTotal, coupon.discount_type, coupon.discount_value).discountAmount
      }
    }

    const discountedBase = Math.max(0, baseTotal - discountAmount)
    const gst = Math.round(discountedBase * 0.18)
    const finalAmountInPaisa = Math.round((discountedBase + gst) * 100)

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
    })

    const order = await razorpay.orders.create({
      amount: finalAmountInPaisa,
      currency: "INR",
      receipt: `greenblr_${Date.now()}`,
      notes: { runner_count: String(runners.length) },
    })

    // Save pending registration
    await db.from('registrations').insert({
      razorpay_order_id: order.id,
      total_amount: finalAmountInPaisa / 100,
      discount_amount: discountAmount,
      coupon_id: couponId,
      status: 'pending',
      lead_email: runners[0].email,
      lead_phone: runners[0].phone,
      runner_count: runners.length,
    })

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: finalAmountInPaisa,
      discountAmount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
