/**
 * Featured cases caching logic for homepage.
 *
 * Priority: localStorage cache → API → hardcoded fallback
 *
 * - Fresh cache (< 24h): Use immediately
 * - Stale cache: Return immediately, revalidate in background
 * - No cache: Fetch from API
 * - API failure: Use fallback examples
 */

import type { FeaturedCase, FeaturedCasesResponse } from "../types";
import { casesApi } from "./api";

const CACHE_KEY = "geetanjali:featuredCases";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedFeaturedCases {
  data: FeaturedCasesResponse;
  cachedAt: number;
}

/**
 * Hardcoded fallback examples when API is unavailable.
 * No slug = no "View Full" link, no "From community" badge.
 */
const FALLBACK_EXAMPLES: FeaturedCase[] = [
  {
    slug: null,
    category: "career",
    dilemma_preview:
      "My boss asked me to falsify a report. I need this job, but this feels wrong...",
    guidance_summary: "",
    recommended_steps: [
      "Document the request in writing and clarify what's being asked",
      "Consult with a trusted mentor or legal advisor",
      "Decide based on dharma, not fear of consequences",
    ],
    verse_references: [
      { canonical_id: "BG_2_47", display: "BG 2.47" },
      { canonical_id: "BG_18_63", display: "BG 18.63" },
    ],
    has_followups: false,
  },
  {
    slug: null,
    category: "relationships",
    dilemma_preview:
      "My closest friend borrowed money and keeps avoiding the topic...",
    guidance_summary: "",
    recommended_steps: [
      "Choose a calm moment for a direct but compassionate conversation",
      "Focus on the relationship, not just the money",
      "Accept that you can only control your own actions",
    ],
    verse_references: [
      { canonical_id: "BG_2_47", display: "BG 2.47" },
      { canonical_id: "BG_6_9", display: "BG 6.9" },
    ],
    has_followups: false,
  },
  {
    slug: null,
    category: "ethics",
    dilemma_preview:
      "I discovered financial irregularities at my company. Should I escalate?",
    guidance_summary: "",
    recommended_steps: [
      "Document thoroughly with dates and evidence",
      "Seek counsel from trusted mentors before acting",
      "Act from clarity and duty, not anger",
    ],
    verse_references: [
      { canonical_id: "BG_18_63", display: "BG 18.63" },
      { canonical_id: "BG_3_19", display: "BG 3.19" },
    ],
    has_followups: false,
  },
  {
    slug: null,
    category: "leadership",
    dilemma_preview:
      "I must recommend one of two qualified team members for promotion...",
    guidance_summary: "",
    recommended_steps: [
      "Evaluate based on merit and organizational need",
      "Don't let threats or tenure alone influence the decision",
      "Communicate transparently with both candidates",
    ],
    verse_references: [
      { canonical_id: "BG_2_48", display: "BG 2.48" },
      { canonical_id: "BG_3_21", display: "BG 3.21" },
    ],
    has_followups: false,
  },
];

/**
 * Cache response in localStorage
 */
function cacheResponse(response: FeaturedCasesResponse): void {
  try {
    const cached: CachedFeaturedCases = {
      data: response,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    // localStorage might be full or disabled
    console.warn("Failed to cache featured cases:", e);
  }
}

/**
 * Revalidate cache in background (fire and forget)
 */
async function revalidateInBackground(): Promise<void> {
  try {
    const response = await casesApi.getFeatured();
    cacheResponse(response);
  } catch {
    // Ignore - we already have stale cache
  }
}

/**
 * Get featured cases with caching strategy.
 *
 * 1. Check localStorage cache
 * 2. If fresh: return immediately
 * 3. If stale: return immediately, revalidate in background
 * 4. If missing: fetch from API
 * 5. If API fails: return fallback
 */
export async function getFeaturedCases(): Promise<FeaturedCasesResponse> {
  // 1. Check localStorage cache
  const cachedStr = localStorage.getItem(CACHE_KEY);
  if (cachedStr) {
    try {
      const parsed: CachedFeaturedCases = JSON.parse(cachedStr);
      const isStale = Date.now() - parsed.cachedAt > CACHE_TTL_MS;

      if (!isStale) {
        // Fresh cache - use directly
        return parsed.data;
      }

      // Stale cache - return immediately, revalidate in background
      revalidateInBackground();
      return parsed.data;
    } catch {
      // Invalid cache - clear it
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // 2. No cache - fetch from API
  try {
    const response = await casesApi.getFeatured();
    cacheResponse(response);
    return response;
  } catch {
    // 3. API failed - return fallback
    return {
      cases: FALLBACK_EXAMPLES,
      categories: ["career", "relationships", "ethics", "leadership"],
      cached_at: new Date().toISOString(),
    };
  }
}

/**
 * Get a random case for a specific category.
 *
 * If multiple cases exist for the category, pick one randomly.
 * Falls back to first case for category if only one exists.
 */
export function getRandomCaseForCategory(
  cases: FeaturedCase[],
  category: string,
): FeaturedCase | undefined {
  const categoryCases = cases.filter((c) => c.category === category);
  if (categoryCases.length === 0) return undefined;
  if (categoryCases.length === 1) return categoryCases[0];

  const randomIndex = Math.floor(Math.random() * categoryCases.length);
  return categoryCases[randomIndex];
}

/**
 * Check if a case is from API (has slug) vs fallback
 */
export function isApiCase(featuredCase: FeaturedCase): boolean {
  return featuredCase.slug !== null;
}

/**
 * Clear cached featured cases (useful for testing)
 */
export function clearFeaturedCasesCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
