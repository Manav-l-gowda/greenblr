import { Link } from 'react-router-dom';
import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-900 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-green-400 text-sm hover:text-green-300 mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-black">Register for Green BLR 2.0</h1>
          <p className="text-green-300 mt-1 text-sm">August 16, 2026 · Bengaluru</p>
          <div className="flex gap-4 mt-4 text-sm text-green-400">
            <span>🌳 Every runner plants a tree</span>
            <span>·</span>
            <span>3K · 5K · 10K</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
          <strong>Registering multiple people?</strong> Click &quot;Add Another Runner&quot; below — you can
          register up to 10 runners in one payment.
        </div>
        <RegistrationForm />
      </div>
    </main>
  );
}
