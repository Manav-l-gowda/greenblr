import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { code, baseTotal } = await req.json()

    if (!code || typeof code !== 'string') {
      return Response.json({ valid: false, error: 'Invalid coupon code' }, { headers: corsHeaders })
    }
    if (!baseTotal || baseTotal <= 0) {
      return Response.json({ valid: false, error: 'Select a race category first' }, { headers: corsHeaders })
    }

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: coupon, error } = await db
      .from('coupons')
      .select('id, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (error || !coupon) return Response.json({ valid: false, error: 'Coupon code not found' }, { headers: corsHeaders })
    if (!coupon.is_active) return Response.json({ valid: false, error: 'This coupon is no longer active' }, { headers: corsHeaders })
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ valid: false, error: 'This coupon has expired' }, { headers: corsHeaders })
    }
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return Response.json({ valid: false, error: 'This coupon has reached its usage limit' }, { headers: corsHeaders })
    }

    const { discountAmount, discountedBase, gst, total } = applyDiscount(baseTotal, coupon.discount_type, coupon.discount_value)

    return Response.json({
      valid: true,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
      discountedBase,
      gst,
      total,
    }, { headers: corsHeaders })
  } catch (err) {
    return Response.json({ valid: false, error: 'Something went wrong' }, { headers: corsHeaders, status: 500 })
  }
})
