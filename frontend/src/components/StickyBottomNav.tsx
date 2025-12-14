/**
 * StickyBottomNav - Fixed footer navigation for mobile
 *
 * Shows previous/next verse navigation at the bottom of the screen,
 * always visible without scrolling. Includes verse number and
 * paraphrase preview for context.
 *
 * Features:
 * - Fixed position at bottom (thumb zone)
 * - Touch-friendly tap targets (min 44px)
 * - Truncated paraphrase preview
 * - Graceful fallback if no preview data
 * - Hidden on desktop (sm:hidden)
 *
 * Used by: VerseDetail (mobile only)
 */

import { Link } from "react-router-dom";
import type { Verse } from "../types";

interface StickyBottomNavProps {
  /** Previous verse data, null if at start of Geeta */
  prevVerse: Verse | null;
  /** Next verse data, null if at end of Geeta */
  nextVerse: Verse | null;
  /** Current chapter number (for display when no adjacent verse) */
  currentChapter: number;
  /** Current verse number (for display when no adjacent verse) */
  currentVerse: number;
}

/**
 * Truncate text to a maximum length at word boundary
 */
function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If no space found, just cut at maxLength
  if (lastSpace === -1) return truncated + "...";

  return truncated.slice(0, lastSpace) + "...";
}

/**
 * Format verse reference (e.g., "2.46")
 */
function formatVerseRef(verse: Verse | null): string {
  if (!verse) return "";
  return `${verse.chapter}.${verse.verse}`;
}

export function StickyBottomNav({
  prevVerse,
  nextVerse,
  currentChapter,
  currentVerse,
}: StickyBottomNavProps) {
  // Check if we're at boundaries
  const isAtStart = !prevVerse && currentChapter === 1 && currentVerse === 1;
  const isAtEnd = !nextVerse && currentChapter === 18;

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm
                 border-t border-amber-200 shadow-lg z-40"
      aria-label="Verse navigation"
    >
      <div className="flex items-stretch">
        {/* Previous verse button */}
        {prevVerse ? (
          <Link
            to={`/verses/${prevVerse.canonical_id}`}
            className="flex-1 flex flex-col items-start justify-center p-3 min-h-[72px]
                       hover:bg-amber-50 active:bg-amber-100 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
                       focus-visible:ring-amber-500"
            aria-label={`Previous verse: ${formatVerseRef(prevVerse)}`}
          >
            <div className="flex items-center gap-1 text-amber-700 font-medium text-sm">
              <span aria-hidden="true">←</span>
              <span>{formatVerseRef(prevVerse)}</span>
            </div>
            <p className="text-xs text-gray-600 leading-tight mt-1 text-left">
              {truncateText(prevVerse.paraphrase_en, 45)}
            </p>
          </Link>
        ) : (
          <div
            className={`flex-1 flex flex-col items-start justify-center p-3 min-h-[72px]
                        ${isAtStart ? "text-gray-300" : "text-gray-400"}`}
            aria-disabled="true"
          >
            <div className="flex items-center gap-1 font-medium text-sm">
              <span aria-hidden="true">←</span>
              <span>{isAtStart ? "Start" : "..."}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-px bg-amber-200 my-3" />

        {/* Next verse button */}
        {nextVerse ? (
          <Link
            to={`/verses/${nextVerse.canonical_id}`}
            className="flex-1 flex flex-col items-end justify-center p-3 min-h-[72px]
                       hover:bg-amber-50 active:bg-amber-100 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
                       focus-visible:ring-amber-500"
            aria-label={`Next verse: ${formatVerseRef(nextVerse)}`}
          >
            <div className="flex items-center gap-1 text-amber-700 font-medium text-sm">
              <span>{formatVerseRef(nextVerse)}</span>
              <span aria-hidden="true">→</span>
            </div>
            <p className="text-xs text-gray-600 leading-tight mt-1 text-right">
              {truncateText(nextVerse.paraphrase_en, 45)}
            </p>
          </Link>
        ) : (
          <div
            className={`flex-1 flex flex-col items-end justify-center p-3 min-h-[72px]
                        ${isAtEnd ? "text-gray-300" : "text-gray-400"}`}
            aria-disabled="true"
          >
            <div className="flex items-center gap-1 font-medium text-sm">
              <span>{isAtEnd ? "End" : "..."}</span>
              <span aria-hidden="true">→</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
