import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://vyxlqqbznqytxglzstbe.supabase.co';
export const SUPABASE_FN = `${SUPABASE_URL}/functions/v1`;

export const supabase = createClient(
  SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
