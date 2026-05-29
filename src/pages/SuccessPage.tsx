import { Link, useSearchParams } from 'react-router-dom';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const count = parseInt(searchParams.get('count') || '1');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">You&apos;re in!</h1>
        <p className="text-gray-600 text-lg mb-6">
          {count > 1
            ? `${count} runners are registered for Green BLR 2.0`
            : "You're registered for Green BLR 2.0"}
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 text-left shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Order ID</span>
            <span className="font-mono text-sm text-gray-800 font-semibold break-all">{orderId}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Event</span>
            <span className="text-gray-800 font-semibold text-sm">Green BLR 2.0</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Date</span>
            <span className="text-gray-800 font-semibold text-sm">August 16, 2026</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Runners</span>
            <span className="text-green-700 font-bold">{count}</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-800 text-left">
          <p className="font-semibold mb-2">What happens next?</p>
          <ul className="space-y-1 text-green-700">
            <li>✉️ Confirmation email sent to your inbox</li>
            <li>🎽 Race kit collection details will be shared soon</li>
            <li>🏷️ Bib numbers assigned 48 hours before the event</li>
            <li>🌳 Your tree will be planted on race day</li>
          </ul>
        </div>

        <Link
          to="/"
          className="inline-block bg-green-700 text-white font-bold px-8 py-3 rounded-full hover:bg-green-800 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
