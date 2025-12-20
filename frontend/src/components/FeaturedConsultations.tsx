import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "../lib/experiment";
import { getVersePath } from "../lib/sanskritFormatter";
import {
  getFeaturedCases,
  getRandomCaseForCategory,
  isApiCase,
} from "../lib/featuredCases";
import type { FeaturedCasesResponse } from "../types";

const CATEGORY_LABELS: Record<string, string> = {
  career: "Career",
  relationships: "Relationships",
  ethics: "Ethics",
  leadership: "Leadership",
};

interface FeaturedConsultationsProps {
  defaultCategory?: string;
}

export function FeaturedConsultations({
  defaultCategory = "career",
}: FeaturedConsultationsProps) {
  const [selected, setSelected] = useState<string>(defaultCategory);
  const [data, setData] = useState<FeaturedCasesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Fetch featured cases on mount
  useEffect(() => {
    let cancelled = false;

    getFeaturedCases()
      .then((response) => {
        if (!cancelled) {
          setData(response);
          // Use first available category if default not in response
          if (
            response.categories.length > 0 &&
            !response.categories.includes(defaultCategory)
          ) {
            setSelected(response.categories[0]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [defaultCategory]);

  // Get random case for selected category (memoized per category selection)
  const currentCase = useMemo(() => {
    if (!data) return null;
    return getRandomCaseForCategory(data.cases, selected);
  }, [data, selected]);

  const categories = data?.categories ?? Object.keys(CATEGORY_LABELS);

  const handleCategoryChange = (category: string) => {
    setSelected(category);
    trackEvent("homepage", "featured_tab_click", { category });
  };

  const handleViewFull = (slug: string) => {
    trackEvent("homepage", "cta_click", {
      type: "view_full",
      category: selected,
    });
    navigate(`/c/${slug}`);
  };

  const handleAskSimilar = (dilemma: string) => {
    trackEvent("homepage", "cta_click", {
      type: "ask_similar",
      category: selected,
    });
    navigate("/cases/new", {
      state: { prefill: dilemma },
    });
  };

  // Loading state
  if (loading) {
    return (
      <section className="max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          See how Geetanjali helps
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state - fall back to static message
  if (error || !currentCase) {
    return (
      <section className="max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          See how Geetanjali helps
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 sm:p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore real ethical dilemmas and see how ancient wisdom applies to
            modern challenges.
          </p>
          <Link
            to="/cases/new"
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
          >
            <span>Ask your own question</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto">
      {/* Section Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
        See how Geetanjali helps
      </h2>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selected === cat
                ? "bg-orange-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Featured Case Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        {/* Badge + Dilemma */}
        <div className="mb-4 sm:mb-5">
          {/* From Community Badge - only for API cases */}
          {isApiCase(currentCase) && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mb-2">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              From community
            </span>
          )}

          {/* Dilemma Quote */}
          <blockquote className="text-gray-800 dark:text-gray-200 text-base sm:text-lg italic border-l-4 border-orange-400 dark:border-orange-500 pl-4">
            "{currentCase.dilemma_preview}"
          </blockquote>
        </div>

        {/* Recommended Steps */}
        <div className="mb-4 sm:mb-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Geetanjali suggests:
          </p>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg p-3 sm:p-4">
            <ul className="space-y-2">
              {currentCase.recommended_steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Follow-up Indicator */}
        {currentCase.has_followups && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <span>💬</span>
            <span>Includes follow-up discussion</span>
          </p>
        )}

        {/* Verse References */}
        {currentCase.verse_references.length > 0 && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-5">
            Based on:{" "}
            {currentCase.verse_references.map((ref, idx) => (
              <span key={ref.canonical_id}>
                <Link
                  to={getVersePath(ref.display)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline"
                >
                  {ref.display}
                </Link>
                {idx < currentCase.verse_references.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* View Full - only for API cases with slug */}
          {isApiCase(currentCase) && currentCase.slug && (
            <button
              onClick={() => handleViewFull(currentCase.slug!)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <span>View Full Consultation</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          )}

          {/* Ask Similar */}
          <button
            onClick={() => handleAskSimilar(currentCase.dilemma_preview)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-medium text-sm sm:text-base ${
              isApiCase(currentCase)
                ? "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                : "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            }`}
          >
            <span>Ask a similar question</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedConsultations;
