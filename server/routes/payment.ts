import { Router } from 'express';
import { getRazorpay, verifyPaymentSignature } from '../lib/razorpay';
import { createServiceClient } from '../lib/supabase';
import { sendConfirmationEmail } from '../lib/email';
import type { RunnerFormData } from '../../src/types/index';
import { calculatePrice, CATEGORY_PRICES, applyDiscount } from '../../src/types/index';

const router = Router();

router.post('/create-order', async (req, res) => {
  try {
    const { runners, couponCode }: { runners: RunnerFormData[]; couponCode?: string } = req.body;

    if (!runners || runners.length === 0) {
      return res.status(400).json({ error: 'No runners provided' });
    }

    let baseTotal = 0;
    for (const runner of runners) {
      if (!runner.category) return res.status(400).json({ error: 'Category missing' });
      baseTotal += calculatePrice(runner.category as keyof typeof CATEGORY_PRICES).base;
    }

    let discountAmount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const db = createServiceClient();
      const { data: coupon } = await db
        .from('coupons')
        .select('id, discount_type, discount_value, max_uses, current_uses, expires_at, is_active')
        .eq('code', couponCode.trim().toUpperCase())
        .single();

      const now = new Date();
      const isValid =
        coupon &&
        coupon.is_active &&
        (!coupon.expires_at || new Date(coupon.expires_at) > now) &&
        (coupon.max_uses === null || coupon.current_uses < coupon.max_uses);

      if (isValid) {
        couponId = coupon.id;
        discountAmount = applyDiscount(baseTotal, coupon.discount_type, coupon.discount_value).discountAmount;
      }
    }

    const discountedBase = Math.max(0, baseTotal - discountAmount);
    const gst = Math.round(discountedBase * 0.18);
    const totalPaise = (discountedBase + gst) * 100;

    const order = await getRazorpay().orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: `greenblr_${Date.now()}`,
      notes: { runner_count: String(runners.length) },
    });

    const db = createServiceClient();
    await db.from('registrations').insert({
      razorpay_order_id: order.id,
      total_amount: totalPaise / 100,
      discount_amount: discountAmount,
      coupon_id: couponId,
      status: 'pending',
      lead_email: runners[0].email,
      lead_phone: runners[0].phone,
      runner_count: runners.length,
    });

    return res.json({ orderId: order.id, amount: totalPaise, discountAmount });
  } catch (err) {
    console.error('create-order error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, runners } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      runners: RunnerFormData[];
    };

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

    const db = createServiceClient();

    const { data: registration, error: regErr } = await db
      .from('registrations')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (regErr || !registration) throw new Error('Registration not found');

    const runnerRows = runners.map((r) => ({
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
    }));

    const { data: insertedRunners, error: runnerErr } = await db
      .from('runners')
      .insert(runnerRows)
      .select();

    if (runnerErr) throw runnerErr;

    if (registration.coupon_id) {
      await db.rpc('increment_coupon_uses', { coupon_id: registration.coupon_id });
    }

    try {
      await sendConfirmationEmail(registration, insertedRunners);
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr);
    }

    return res.json({ success: true, registrationId: registration.id });
  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
