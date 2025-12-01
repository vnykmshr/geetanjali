import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth, casesApi } from '../lib/api';
import type { HealthResponse, Case } from '../types';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Load recent consultations
    casesApi.list(0, 5)
      .then(setRecentCases)
      .catch((err) => console.error('Failed to load recent cases:', err))
      .finally(() => setCasesLoading(false));
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

          {/* CTA Button */}
          <div className="mb-12">
            <Link
              to="/cases/new"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-12 py-4 rounded-lg transition-colors shadow-lg text-lg"
            >
              Ask a Question
            </Link>
          </div>

          {/* Recent Consultations */}
          {!casesLoading && recentCases.length > 0 && (
            <div className="mb-16 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Consultations</h2>
                  <Link to="/consultations" className="text-red-600 hover:text-red-700 font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentCases.map((case_) => (
                    <Link
                      key={case_.id}
                      to={`/cases/${case_.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{case_.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{case_.description}</p>
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {new Date(case_.created_at || '').toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feature Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Clear Guidance</h3>
              <p className="text-gray-600">
                Practical wisdom for life's difficult decisions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Multiple Perspectives</h3>
              <p className="text-gray-600">
                Explore different approaches with pros and cons
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Grounded in Wisdom</h3>
              <p className="text-gray-600">
                Every insight backed by verses from the Gita
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
