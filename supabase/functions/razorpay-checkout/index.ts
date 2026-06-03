import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "https://esm.sh/razorpay@2.9.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Updated with your exact registration price mappings
const PRICING_MAP: Record<string, number> = {
  "3k": 699,   // ₹699/- + GST
  "5k": 999,   // ₹999/- + GST
  "10k": 1299  // ₹1,299/- + GST
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { runners } = await req.json()
    
    if (!runners || !Array.isArray(runners) || runners.length === 0) {
      throw new Error("No registration data received.")
    }

    let subtotal = 0

    // Look up the price for each runner dynamically
    for (const runner of runners) {
      // Normalizes strings like "3K Run" or "5k" to match our lowercase map keys
      const categoryKey = String(runner.category || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      
      const basePrice = PRICING_MAP[categoryKey] !== undefined ? PRICING_MAP[categoryKey] : 1299
      subtotal += basePrice
    }

    // Apply 18% GST (Subtotal * 1.18)
    const finalAmountInRupees = subtotal * 1.18

    // Convert total Rupees to Paisa for the Razorpay API engine
    const finalAmountInPaisa = Math.round(finalAmountInRupees * 100)

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
    })

    const order = await razorpay.orders.create({
      amount: finalAmountInPaisa,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    })

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})