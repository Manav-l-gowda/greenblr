-- Green BLR 2.0 - Supabase Database Schema
-- Run this in the Supabase SQL editor

-- Registrations table (one per order/payment)
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  lead_email TEXT NOT NULL,
  lead_phone TEXT NOT NULL,
  runner_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runners table (one per person, linked to a registration)
CREATE TABLE runners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  dob DATE NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  tshirt_size TEXT NOT NULL CHECK (tshirt_size IN ('XS-36', 'S-38', 'M-40', 'L-42', 'XL-44')),
  category TEXT NOT NULL CHECK (category IN ('3K', '5K', '10K')),
  bib_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on registrations
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_lead_email ON registrations(lead_email);
CREATE INDEX idx_runners_registration_id ON runners(registration_id);
CREATE INDEX idx_runners_email ON runners(email);
CREATE INDEX idx_runners_category ON runners(category);

-- Row Level Security (enable but allow service role full access)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access on registrations"
  ON registrations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on runners"
  ON runners FOR ALL
  TO service_role USING (true) WITH CHECK (true);
