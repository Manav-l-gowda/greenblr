import { Router } from 'express';
import { createServiceClient } from '../lib/supabase';
import { applyDiscount } from '../../src/types/index';

const router = Router();

router.post('/validate', async (req, res) => {
  try {
    const { code, baseTotal }: { code: string; baseTotal: number } = req.body;

    if (!code || typeof code !== 'string') {
      return res.json({ valid: false, error: 'Invalid coupon code' });
    }
    if (!baseTotal || baseTotal <= 0) {
      return res.json({ valid: false, error: 'Select a race category first' });
    }

    const db = createServiceClient();
    const { data: coupon, error } = await db
      .from('coupons')
      .select('id, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (error || !coupon) return res.json({ valid: false, error: 'Coupon code not found' });
    if (!coupon.is_active) return res.json({ valid: false, error: 'This coupon is no longer active' });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ valid: false, error: 'This coupon has expired' });
    }
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return res.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    const { discountAmount, discountedBase, gst, total } = applyDiscount(
      baseTotal,
      coupon.discount_type,
      coupon.discount_value
    );

    return res.json({
      valid: true,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
      discountedBase,
      gst,
      total,
    });
  } catch (err) {
    console.error('coupon validate error:', err);
    return res.json({ valid: false, error: 'Something went wrong' });
  }
});

export default router;
