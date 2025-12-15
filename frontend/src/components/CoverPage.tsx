/**
 * CoverPage - Full-screen book cover for Reading Mode
 *
 * Displays the Bhagavad Geeta title, tagline, and intro text
 * with a "Begin Reading" button to start the reading experience.
 *
 * Designed as an overlay that can be dismissed.
 */

import type { BookMetadata } from "../types";

interface CoverPageProps {
  /** Book metadata to display */
  book: BookMetadata;
  /** Called when user clicks "Begin Reading" */
  onStart: () => void;
  /** Whether the cover is currently visible */
  isVisible: boolean;
}

export function CoverPage({ book, onStart, isVisible }: CoverPageProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Book cover page"
    >
      {/* Decorative Om symbol at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-amber-200/20 text-6xl select-none">
        ॐ
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Sanskrit title */}
          <h1 className="text-4xl sm:text-5xl font-serif text-amber-100 leading-tight">
            {book.sanskrit_title}
          </h1>

          {/* Transliteration */}
          <p className="text-xl sm:text-2xl text-amber-200/80 font-light tracking-wide">
            {book.transliteration}
          </p>

          {/* English title */}
          <p className="text-lg text-amber-300/70">
            {book.english_title}
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 py-4">
            <span className="w-12 h-px bg-amber-400/30" />
            <span className="text-amber-400/50 text-sm">✦</span>
            <span className="w-12 h-px bg-amber-400/30" />
          </div>

          {/* Tagline */}
          <p className="text-xl text-amber-100/90 font-medium italic">
            "{book.tagline}"
          </p>

          {/* Intro text */}
          <p className="text-amber-200/70 leading-relaxed text-base sm:text-lg">
            {book.intro_text}
          </p>

          {/* Stats */}
          <p className="text-amber-400/60 text-sm">
            {book.chapter_count} Chapters · {book.verse_count} Verses
          </p>
        </div>
      </div>

      {/* Bottom action area */}
      <div className="p-6 pb-8">
        <button
          onClick={onStart}
          className="w-full max-w-sm mx-auto block py-4 px-8 bg-amber-100 hover:bg-white
                     text-amber-900 font-semibold text-lg rounded-xl
                     shadow-lg hover:shadow-xl transition-all duration-200
                     active:scale-[0.98]"
          autoFocus
        >
          Begin Reading
        </button>
      </div>
    </div>
  );
}

export default CoverPage;
