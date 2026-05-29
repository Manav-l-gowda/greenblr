import { RunnerFormData, TSHIRT_SIZES, CATEGORIES, GENDERS, calculatePrice } from '@/types';

interface Props {
  index: number;
  data: RunnerFormData;
  onChange: (index: number, field: keyof RunnerFormData, value: string) => void;
  onRemove?: (index: number) => void;
  canRemove: boolean;
}

export default function RunnerCard({ index, data, onChange, onRemove, canRemove }: Props) {
  const priceInfo = data.category ? calculatePrice(data.category as any) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">Runner {index + 1}</h3>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Race Category */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Race Category <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map((cat) => {
              const { base } = calculatePrice(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChange(index, 'category', cat)}
                  className={`flex-1 min-w-[100px] border-2 rounded-lg p-3 text-center transition-all cursor-pointer ${
                    data.category === cat
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-green-400 text-gray-700'
                  }`}
                >
                  <div className="font-bold text-lg">{cat}</div>
                  <div className="text-sm font-semibold text-green-700 mt-0.5">₹{base}</div>
                  <div className="text-xs text-gray-400 mt-0.5">+ GST</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => onChange(index, 'first_name', e.target.value)}
            placeholder="Arjun"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => onChange(index, 'last_name', e.target.value)}
            placeholder="Sharma"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            placeholder="arjun@email.com"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
            placeholder="+91 98765 43210"
            required
            maxLength={13}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={data.gender}
            onChange={(e) => onChange(index, 'gender', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dob}
            onChange={(e) => onChange(index, 'dob', e.target.value)}
            required
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />
        </div>

        {/* T-shirt Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            T-Shirt Size <span className="text-red-500">*</span>
          </label>
          <select
            value={data.tshirt_size}
            onChange={(e) => onChange(index, 'tshirt_size', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select size</option>
            {TSHIRT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.emergency_contact_name}
            onChange={(e) => onChange(index, 'emergency_contact_name', e.target.value)}
            placeholder="Contact person's name"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Emergency Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.emergency_contact_phone}
            onChange={(e) => onChange(index, 'emergency_contact_phone', e.target.value)}
            placeholder="+91 98765 43210"
            required
            maxLength={13}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {priceInfo && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="text-right text-sm text-gray-500">
            Registration fee:&nbsp;
            <span className="text-green-700 font-bold text-base">₹{priceInfo.base}</span>
            <span className="text-gray-400 text-xs ml-1">(+18% GST at checkout)</span>
          </div>
        </div>
      )}
    </div>
  );
}
