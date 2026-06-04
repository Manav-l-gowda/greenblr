import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RunnerCard from './RunnerCard';
import { RunnerFormData, calculatePrice, CATEGORY_PRICES, CouponValidation } from '@/types';
import { SUPABASE_FN } from '@/lib/supabase';

const emptyRunner = (): RunnerFormData => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  tshirt_size: '',
  category: '',
});

declare global {
  interface Window { Razorpay: any; }
}

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [runners, setRunners] = useState<RunnerFormData[]>([emptyRunner()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponData, setCouponData] = useState<CouponValidation | null>(null);

  const baseAmount = runners.reduce((sum, r) => {
    if (!r.category) return sum;
    return sum + calculatePrice(r.category as keyof typeof CATEGORY_PRICES).base;
  }, 0);

  // Final amounts — use coupon breakdown if applied, otherwise plain base+GST
  const displayGst = couponData ? couponData.gst : Math.round(baseAmount * 0.18);
  const displayDiscount = couponData ? couponData.discountAmount : 0;
  const displayTotal = couponData ? couponData.total : baseAmount + displayGst;

  function handleChange(index: number, field: keyof RunnerFormData, value: string) {
    setRunners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear coupon when category changes — amounts changed
    if (field === 'category') {
      setCouponData(null);
      setCouponCode('');
      setCouponError('');
    }
  }

  function addRunner() {
    setRunners((prev) => [...prev, emptyRunner()]);
    setCouponData(null);
    setCouponCode('');
  }

  function removeRunner(index: number) {
    setRunners((prev) => prev.filter((_, i) => i !== index));
    setCouponData(null);
    setCouponCode('');
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    if (baseAmount === 0) {
      setCouponError('Select a race category before applying a coupon');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    setCouponData(null);
    try {
      const res = await fetch(`${SUPABASE_FN}/coupon-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), baseTotal: baseAmount }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponData(data as CouponValidation);
        setCouponCode(couponInput.trim().toUpperCase());
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setCouponData(null);
        setCouponCode('');
      }
    } catch {
      setCouponError('Could not validate coupon. Try again.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponData(null);
    setCouponCode('');
    setCouponInput('');
    setCouponError('');
  }

  function validate(): string | null {
    for (let i = 0; i < runners.length; i++) {
      const r = runners[i];
      const label = `Runner ${i + 1}`;
      if (!r.category) return `${label}: Please select a race category`;
      if (!r.first_name.trim()) return `${label}: First name is required`;
      if (!r.last_name.trim()) return `${label}: Last name is required`;
      if (!r.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return `${label}: Valid email is required`;
      if (!r.phone.trim()) return `${label}: Phone is required`;
      if (!r.gender) return `${label}: Gender is required`;
      if (!r.dob) return `${label}: Date of birth is required`;
      if (!r.tshirt_size) return `${label}: T-shirt size is required`;
      if (!r.emergency_contact_name.trim()) return `${label}: Emergency contact name is required`;
      if (!r.emergency_contact_phone.trim()) return `${label}: Emergency contact phone is required`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const orderRes = await fetch(`${SUPABASE_FN}/razorpay-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runners, couponCode: couponCode || undefined }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Green BLR 2.0',
        description: `${runners.length} Runner Registration${runners.length > 1 ? 's' : ''}`,
        order_id: orderData.orderId,
        prefill: {
          name: `${runners[0].first_name} ${runners[0].last_name}`,
          email: runners[0].email,
          contact: runners[0].phone,
        },
        theme: { color: '#1a6b2a' },
        handler: async (response: any) => {
          const verifyRes = await fetch(`${SUPABASE_FN}/payment-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              runners,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
          navigate(`/success?orderId=${response.razorpay_order_id}&count=${runners.length}`);
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {runners.map((runner, i) => (
        <RunnerCard
          key={i}
          index={i}
          data={runner}
          onChange={handleChange}
          onRemove={removeRunner}
          canRemove={runners.length > 1}
        />
      ))}

      {/* Add Runner */}
      <button
        type="button"
        onClick={addRunner}
        disabled={runners.length >= 10}
        className="w-full border-2 border-dashed border-green-400 rounded-xl py-4 text-green-700 font-medium hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Add Another Runner
      </button>

      {/* Coupon Code */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Have a coupon code?</p>
        {couponData ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-4 py-3">
            <div>
              <span className="text-green-800 font-semibold text-sm">{couponCode}</span>
              <span className="text-green-600 text-sm ml-2">
                — ₹{couponData.discountAmount.toLocaleString('en-IN')} off applied!
              </span>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 text-xs font-medium ml-4"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-red-500 text-xs mt-2">{couponError}</p>
        )}
      </div>

      {/* Total + Submit */}
      <div className="bg-green-900 text-white rounded-xl p-6 sticky bottom-4">
        <div className="mb-4 space-y-1.5 text-sm">
          <p className="text-green-300 text-xs mb-2">
            {runners.length} runner{runners.length > 1 ? 's' : ''} · {runners.filter((r) => r.category).length} categor{runners.filter((r) => r.category).length === 1 ? 'y' : 'ies'} selected
          </p>

          {baseAmount > 0 ? (
            <>
              <div className="flex justify-between text-green-400">
                <span>Base fee</span>
                <span>₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon discount ({couponCode})</span>
                  <span>- ₹{displayDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-green-400">
                <span>GST (18%)</span>
                <span>₹{displayGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-green-700 pt-2 flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span>₹{displayTotal.toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
            <p className="text-green-500 text-sm">Select a category above to see pricing</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400 rounded-lg px-4 py-2 mb-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || displayTotal === 0}
          className="w-full bg-white text-green-900 font-bold py-3.5 rounded-lg text-base hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay ₹${displayTotal.toLocaleString('en-IN')} & Register`}
        </button>
        <p className="text-center text-green-400 text-xs mt-3">
          Secured by Razorpay · UPI, Cards, Netbanking accepted
        </p>
      </div>
    </form>
  );
}
