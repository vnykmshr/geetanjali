/**
 * ChapterIntro - Chapter introduction card for Reading Mode
 *
 * Displays chapter name, summary, and key themes before
 * diving into the verses. Shown when entering a new chapter.
 *
 * Designed as an overlay that can be dismissed.
 */

import type { ChapterMetadata } from "../types";

interface ChapterIntroProps {
  /** Chapter metadata to display */
  chapter: ChapterMetadata;
  /** Called when user clicks "Continue" to start reading */
  onContinue: () => void;
  /** Whether the intro is currently visible */
  isVisible: boolean;
}

export function ChapterIntro({ chapter, onContinue, isVisible }: ChapterIntroProps) {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onContinue}
        aria-hidden="true"
      />

      {/* Chapter Intro Card */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto
                   bg-gradient-to-b from-amber-50 to-white rounded-2xl shadow-2xl
                   overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Chapter ${chapter.chapter_number} introduction`}
      >
        {/* Header with chapter number badge */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-2">
            <span className="text-white font-bold text-xl">{chapter.chapter_number}</span>
          </div>
          <p className="text-amber-100 text-sm uppercase tracking-wider">Chapter</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Sanskrit name */}
          <h2 className="text-2xl font-serif text-amber-900 text-center">
            {chapter.sanskrit_name}
          </h2>

          {/* Transliteration */}
          <p className="text-lg text-amber-700/80 text-center font-light">
            {chapter.transliteration}
          </p>

          {/* English title */}
          <p className="text-amber-600 text-center font-medium">
            {chapter.english_title}
          </p>

          {/* Subtitle if present */}
          {chapter.subtitle && (
            <p className="text-amber-500/80 text-sm text-center italic">
              {chapter.subtitle}
            </p>
          )}

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="w-8 h-px bg-amber-300" />
            <span className="text-amber-400 text-xs">॥</span>
            <span className="w-8 h-px bg-amber-300" />
          </div>

          {/* Summary */}
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {chapter.summary}
          </p>

          {/* Key themes (if available) */}
          {chapter.key_themes && chapter.key_themes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {chapter.key_themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Verse count */}
          <p className="text-amber-500/70 text-sm text-center">
            {chapter.verse_count} verses
          </p>
        </div>

        {/* Action button */}
        <div className="px-6 pb-6">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700
                       text-white font-semibold rounded-xl
                       transition-colors active:scale-[0.98]"
            autoFocus
          >
            Begin Chapter
          </button>
        </div>
      </div>
    </>
  );
}

export default ChapterIntro;
