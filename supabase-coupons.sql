-- Run this in Supabase SQL editor AFTER supabase-schema.sql

CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,          -- NULL = unlimited
  current_uses INTEGER DEFAULT 0 NOT NULL,
  expires_at TIMESTAMPTZ,    -- NULL = never expires
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link used coupons to registrations (for audit trail)
ALTER TABLE registrations
  ADD COLUMN coupon_id UUID REFERENCES coupons(id),
  ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

CREATE INDEX idx_coupons_code ON coupons(code);

-- Atomic increment to prevent race conditions on concurrent checkouts
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_id UUID)
RETURNS void AS $$
  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = coupon_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Daily registration counts for the last 30 days
CREATE OR REPLACE FUNCTION daily_registration_counts()
RETURNS TABLE(date TEXT, count BIGINT) AS $$
  SELECT
    TO_CHAR(DATE(created_at AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') AS date,
    COUNT(*) AS count
  FROM registrations
  WHERE status = 'paid'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at AT TIME ZONE 'Asia/Kolkata')
  ORDER BY date ASC;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on coupons"
  ON coupons FOR ALL
  TO service_role USING (true) WITH CHECK (true);
