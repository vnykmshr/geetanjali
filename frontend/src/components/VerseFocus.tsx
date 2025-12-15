/**
 * VerseFocus - Single verse display for Reading Mode
 *
 * Features:
 * - Sanskrit hero text (large, centered)
 * - Tap/click to reveal translations (Hindi + English)
 * - Smooth expand/collapse animation
 * - Lazy loading of translations
 *
 * Used by: ReadingMode
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { versesApi } from "../lib/api";
import { getTranslatorPriority } from "../constants/translators";
import type { Verse, Translation } from "../types";

interface VerseFocusProps {
  /** The verse to display */
  verse: Verse;
  /** Callback when user taps the verse */
  onTap?: () => void;
}

/**
 * Sort translations by priority (lower number = higher priority)
 */
function sortTranslations(translations: Translation[]): Translation[] {
  return [...translations].sort((a, b) => {
    const priorityA = getTranslatorPriority(a.translator);
    const priorityB = getTranslatorPriority(b.translator);
    return priorityA - priorityB;
  });
}

export function VerseFocus({ verse, onTap }: VerseFocusProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Get primary translations (first Hindi and first English)
  const hindiTranslation = translations.find((t) => t.language === "hi");
  const englishTranslation = translations.find((t) => t.language === "en");

  // Fetch translations lazily when user first reveals
  const loadTranslations = useCallback(async () => {
    if (translations.length > 0 || loadingTranslations) return;

    setLoadingTranslations(true);
    setTranslationError(null);

    try {
      const data = await versesApi.getTranslations(verse.canonical_id);
      setTranslations(sortTranslations(data));
    } catch {
      setTranslationError("Failed to load translations");
    } finally {
      setLoadingTranslations(false);
    }
  }, [verse.canonical_id, translations.length, loadingTranslations]);

  // Handle tap/click to toggle translation
  const handleToggle = useCallback(() => {
    const newState = !showTranslation;
    setShowTranslation(newState);

    // Load translations when revealing for the first time
    if (newState && translations.length === 0) {
      loadTranslations();
    }

    onTap?.();
  }, [showTranslation, translations.length, loadTranslations, onTap]);

  // Format Sanskrit text (split by newlines for proper rendering)
  const sanskritText = verse.sanskrit_devanagari || verse.sanskrit_iast || "";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tappable verse area */}
      <button
        onClick={handleToggle}
        className="w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 rounded-xl transition-transform active:scale-[0.99]"
        aria-expanded={showTranslation}
        aria-label={showTranslation ? "Hide translation" : "Show translation"}
      >
        {/* Om symbol */}
        <div className="text-3xl sm:text-4xl text-amber-400/60 mb-4 sm:mb-6">
          ॐ
        </div>

        {/* Sanskrit verse - hero display */}
        <div className="mb-4 sm:mb-6">
          <p
            className="text-xl sm:text-2xl lg:text-3xl leading-relaxed sm:leading-loose font-serif text-amber-900 whitespace-pre-line"
            lang="sa"
          >
            {sanskritText}
          </p>
        </div>

        {/* Verse reference */}
        <div className="text-sm text-amber-600/70 mb-4">
          {verse.chapter}.{verse.verse}
        </div>

        {/* Tap hint (only show when translation is hidden) */}
        {!showTranslation && (
          <div className="text-sm text-amber-500/60 italic animate-pulse">
            Tap for translation
          </div>
        )}
      </button>

      {/* Translation panel - expandable */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showTranslation ? "max-h-[800px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        {loadingTranslations ? (
          // Loading state
          <div className="text-center py-4">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-amber-600/70">Loading translations...</p>
          </div>
        ) : translationError ? (
          // Error state
          <div className="text-center py-4">
            <p className="text-sm text-red-600">{translationError}</p>
            <button
              onClick={loadTranslations}
              className="mt-2 text-sm text-amber-600 hover:text-amber-800 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          // Translations display
          <div className="space-y-4">
            {/* Hindi translation */}
            {hindiTranslation && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/50">
                <div className="text-xs text-amber-600/70 mb-2 uppercase tracking-wide">
                  Hindi
                  {hindiTranslation.translator && (
                    <span className="normal-case ml-1">
                      — {hindiTranslation.translator}
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-800 leading-relaxed" lang="hi">
                  {hindiTranslation.text}
                </p>
              </div>
            )}

            {/* English translation */}
            {englishTranslation && (
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200/50">
                <div className="text-xs text-amber-600/70 mb-2 uppercase tracking-wide">
                  English
                  {englishTranslation.translator && (
                    <span className="normal-case ml-1">
                      — {englishTranslation.translator}
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-800 leading-relaxed">
                  {englishTranslation.text}
                </p>
              </div>
            )}

            {/* Fallback: Use verse's built-in translation if no translations fetched */}
            {!hindiTranslation && !englishTranslation && verse.translation_en && (
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200/50">
                <div className="text-xs text-amber-600/70 mb-2 uppercase tracking-wide">
                  English
                </div>
                <p className="text-base text-gray-800 leading-relaxed">
                  {verse.translation_en}
                </p>
              </div>
            )}

            {/* No translations available */}
            {!hindiTranslation &&
              !englishTranslation &&
              !verse.translation_en && (
                <div className="text-center py-4 text-amber-600/60 text-sm">
                  No translations available
                </div>
              )}

            {/* View full details link */}
            <div className="text-center pt-2">
              <Link
                to={`/verses/${verse.canonical_id}`}
                className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 transition-colors"
              >
                View full details
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
