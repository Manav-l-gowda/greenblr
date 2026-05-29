export type Category = '3K' | '5K' | '10K';
export type Gender = 'Male' | 'Female' | 'Other';
export type TshirtSize = 'XS-36' | 'S-38' | 'M-40' | 'L-42' | 'XL-44';
export type RegistrationStatus = 'pending' | 'paid' | 'failed';

export interface RunnerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: Gender | '';
  dob: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  tshirt_size: TshirtSize | '';
  category: Category | '';
}

export interface Registration {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  total_amount: number;
  status: RegistrationStatus;
  lead_email: string;
  lead_phone: string;
  runner_count: number;
  created_at: string;
  updated_at: string;
}

export interface Runner {
  id: string;
  registration_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  tshirt_size: TshirtSize;
  category: Category;
  bib_number: string | null;
  created_at: string;
}

export const CATEGORY_PRICES: Record<Category, number> = {
  '3K': 500,
  '5K': 799,
  '10K': 999,
};

export const GST_RATE = 0.18;

export const TSHIRT_SIZES: TshirtSize[] = ['XS-36', 'S-38', 'M-40', 'L-42', 'XL-44'];
export const CATEGORIES: Category[] = ['3K', '5K', '10K'];
export const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

export function calculatePrice(category: Category): { base: number; gst: number; total: number } {
  const base = CATEGORY_PRICES[category];
  const gst = Math.round(base * GST_RATE);
  return { base, gst, total: base + gst };
}

export interface CouponValidation {
  valid: true;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number; // rupees off the base total
  discountedBase: number;
  gst: number;
  total: number;
}

export interface CouponError {
  valid: false;
  error: string;
}

export type CouponResult = CouponValidation | CouponError;

export function applyDiscount(
  baseTotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): { discountAmount: number; discountedBase: number; gst: number; total: number } {
  let discountAmount =
    discountType === 'percentage'
      ? Math.round((baseTotal * discountValue) / 100)
      : Math.min(discountValue, baseTotal);

  const discountedBase = Math.max(0, baseTotal - discountAmount);
  const gst = Math.round(discountedBase * GST_RATE);
  return { discountAmount, discountedBase, gst, total: discountedBase + gst };
}
