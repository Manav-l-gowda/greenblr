import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://vyxlqqbznqytxglzstbe.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eGxxcWJ6bnF5dHhnbHpzdGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDY4MDQsImV4cCI6MjA5NTIyMjgwNH0.m7A6M9e6xQ1RuPMpQ3jPihHvgUQKL5dNLAn9TFrzWw0';
export const SUPABASE_FN = `${SUPABASE_URL}/functions/v1`;
export const fnHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
