/**
 * FloatingNavArrow - Desktop gallery-style floating navigation
 *
 * Floating arrows positioned at the sides of the viewport for
 * easy verse navigation without scrolling. Includes hover preview.
 *
 * Features:
 * - Fixed Y position (vertically centered in viewport)
 * - Absolute X position (left/right of content)
 * - Default: Translucent (60% opacity)
 * - Hover: Solid + scale up + show preview
 * - Hidden on mobile (hidden sm:block)
 *
 * Used by: VerseDetail (desktop only)
 */

import { Link } from "react-router-dom";
import type { Verse } from "../types";

interface FloatingNavArrowProps {
  /** Direction of navigation */
  direction: "prev" | "next";
  /** Verse data for the navigation target */
  verse: Verse | null;
  /** Whether the user is at the start (prev) or end (next) of the Geeta */
  isAtBoundary: boolean;
}

/**
 * Truncate text to a maximum length at word boundary
 */
function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

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

export function FloatingNavArrow({
  direction,
  verse,
  isAtBoundary,
}: FloatingNavArrowProps) {
  const isPrev = direction === "prev";

  // Don't render if at boundary and no verse
  if (!verse && isAtBoundary) {
    return null;
  }

  // If verse is loading/null but not at boundary, show placeholder
  if (!verse) {
    return (
      <div
        className={`hidden sm:flex fixed top-1/2 -translate-y-1/2 z-30
                    ${isPrev ? "left-2 lg:left-4" : "right-2 lg:right-4"}
                    flex-col items-center justify-center p-3
                    bg-white/40 backdrop-blur-sm rounded-lg shadow-md
                    text-gray-400 opacity-60`}
        aria-hidden="true"
      >
        <span className="text-2xl">{isPrev ? "←" : "→"}</span>
      </div>
    );
  }

  return (
    <Link
      to={`/verses/${verse.canonical_id}`}
      className={`hidden sm:flex fixed top-1/2 -translate-y-1/2 z-30
                  ${isPrev ? "left-2 lg:left-4" : "right-2 lg:right-4"}
                  flex-col ${isPrev ? "items-start" : "items-end"} justify-center
                  p-3 lg:p-4 min-w-[80px] lg:min-w-[100px]
                  bg-white/60 backdrop-blur-sm rounded-xl shadow-lg
                  border border-amber-200/50
                  opacity-70 hover:opacity-100
                  hover:bg-white/90 hover:scale-105 hover:shadow-xl
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                  focus-visible:ring-offset-2
                  group`}
      aria-label={`${isPrev ? "Previous" : "Next"} verse: ${formatVerseRef(verse)}`}
    >
      {/* Arrow and verse reference */}
      <div className={`flex items-center gap-1 text-amber-700 font-medium text-sm lg:text-base
                       ${isPrev ? "flex-row" : "flex-row-reverse"}`}>
        <span aria-hidden="true" className="text-lg lg:text-xl">
          {isPrev ? "←" : "→"}
        </span>
        <span>{formatVerseRef(verse)}</span>
      </div>

      {/* Preview - shown on hover with transition */}
      <p className={`text-xs lg:text-sm text-gray-600 leading-tight mt-1
                     max-h-0 overflow-hidden opacity-0
                     group-hover:max-h-20 group-hover:opacity-100
                     transition-all duration-200
                     ${isPrev ? "text-left" : "text-right"}`}>
        {truncateText(verse.paraphrase_en, 60)}
      </p>
    </Link>
  );
}
