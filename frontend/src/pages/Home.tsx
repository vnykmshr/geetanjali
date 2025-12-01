import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth } from '../lib/api';
import type { HealthResponse } from '../types';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Geetanjali
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ethical leadership guidance from the Bhagavad Gita
          </p>

          {/* Backend Status */}
          <div className="mb-12">
            {loading && (
              <div className="text-gray-500">Checking backend connection...</div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ⚠️ Backend connection error: {error}
              </div>
            )}
            {health && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded inline-block">
                ✓ Backend connected: {health.service} ({health.environment})
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-x-4">
            <Link
              to="/cases/new"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Create New Case
            </Link>
            <Link
              to="/verses"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Verses
            </Link>
          </div>

          {/* Feature Overview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Executive Summaries</h3>
              <p className="text-gray-600">
                Clear, concise analysis of ethical dilemmas
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Three Options</h3>
              <p className="text-gray-600">
                Balanced alternatives with pros and cons
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Full Provenance</h3>
              <p className="text-gray-600">
                Verses, commentaries, and confidence scores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
