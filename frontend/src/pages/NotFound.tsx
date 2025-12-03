import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Path Not Found</h1>
          <p className="text-gray-600 mb-8">
            The path you seek does not exist. Let us guide you back.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
