import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth, casesApi, versesApi } from '../lib/api';
import type { Case, Verse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FeaturedVerse } from '../components/FeaturedVerse';
import { Navbar } from '../components/Navbar';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Cases loading state - only relevant when authenticated
  const [casesLoading, setCasesLoading] = useState(isAuthenticated);

  // Check backend health on mount
  useEffect(() => {
    checkHealth().catch((err) => setError(err.message));
  }, []);

  // Load recent consultations when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    casesApi.list(0, 5)
      .then((data) => {
        if (!cancelled) setRecentCases(data);
      })
      .catch(() => { /* Silent fail - cases section just won't show */ })
      .finally(() => {
        if (!cancelled) setCasesLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Load random verse on mount
  useEffect(() => {
    let cancelled = false;
    versesApi.getRandom()
      .then((data) => {
        if (!cancelled) {
          setDailyVerse(data);
        }
      })
      .catch(() => { /* Silent fail - verse section just won't show */ })
      .finally(() => {
        if (!cancelled) setVerseLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="text-center">
          {/* Logo - smaller on mobile */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img src="/logo.svg" alt="Geetanjali" className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
          </div>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-gray-600 mb-2 sm:mb-4">
            Ethical leadership guidance from the Bhagavad Geeta
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mb-6 sm:mb-8">
              Try it now - no signup required. Create an account to save your consultations.
            </p>
          )}

          {/* Backend Status - Only show errors */}
          {error && (
            <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 text-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-lg sm:text-xl">⚠️</span>
                <div className="text-left">
                  <p className="font-semibold mb-1 text-sm sm:text-base">Service Unavailable</p>
                  <p className="text-xs sm:text-sm text-red-600">Unable to connect to the service. Please try again later.</p>
                </div>
              </div>
            </div>
          )}

          {/* Featured Verse of the Day */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <FeaturedVerse
              verse={dailyVerse!}
              loading={verseLoading}
            />
          </div>

          {/* CTA Button - visible on desktop, hidden on mobile (FAB replaces it) */}
          <div className="hidden sm:block mb-10 lg:mb-12">
            <Link
              to="/cases/new"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-3 sm:px-12 sm:py-4 rounded-lg transition-colors shadow-lg text-base sm:text-lg"
            >
              Ask a Question
            </Link>
          </div>

          {/* Recent Consultations */}
          {!casesLoading && recentCases.length > 0 && (
            <div className="mb-10 sm:mb-12 lg:mb-16 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Consultations</h2>
                  <Link to="/consultations" className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {recentCases.map((case_) => (
                    <Link
                      key={case_.id}
                      to={`/cases/${case_.id}`}
                      className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">{case_.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{case_.description}</p>
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">
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
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Clear Guidance</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Practical wisdom for life's difficult decisions
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Multiple Perspectives</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Explore different approaches with pros and cons
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Grounded in Wisdom</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Every insight backed by verses from the Geeta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for FAB on mobile */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
