import { Link } from 'react-router-dom';
import type { Verse } from '../types';

/**
 * Format Sanskrit text with proper line breaks and danda marks
 * - Removes verse number metadata
 * - Splits on danda marks with proper formatting
 * - Uses alternating danda pattern (। and ॥)
 * - Filters out speaker intros (वाच)
 */
function formatSanskritLines(text: string): string[] {
  if (!text) return [];

  // Remove the verse number at the end (e.g., ।।2.52।। or ॥2.52॥)
  const withoutVerseNum = text.replace(/[।॥]+\d+\.\d+[।॥]+\s*$/, '');

  // Split by newlines to detect speaker intro lines
  const lines = withoutVerseNum.split('\n').map(l => l.trim()).filter(l => l);

  const result: string[] = [];
  let verseLineIndex = 0;

  for (const line of lines) {
    // Skip speaker intro lines (contains वाच - said/spoke)
    if (line.includes('वाच')) {
      continue;
    }

    // Split on danda mark boundaries
    const parts = line.split(/।/).filter(p => p.trim());

    if (parts.length === 0) continue;

    // Alternate between single (।) and double (॥) danda
    const isEvenLine = (verseLineIndex + 1) % 2 === 0;

    for (let i = 0; i < parts.length; i++) {
      let formattedPart = parts[i].trim();

      // Add appropriate danda
      if (i < parts.length - 1) {
        formattedPart += ' |';
      } else {
        formattedPart += isEvenLine ? ' ॥' : ' ।';
      }

      result.push(formattedPart);
    }

    verseLineIndex++;
  }

  return result.length > 0 ? result : [text.trim()];
}

interface FeaturedVerseProps {
  verse: Verse;
  loading?: boolean;
}

export function FeaturedVerse({ verse, loading = false }: FeaturedVerseProps) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-12 border border-amber-200/50 shadow-xl">
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mx-auto" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  const verseRef = `${verse.chapter}.${verse.verse}`;
  const sanskritLines = formatSanskritLines(verse.sanskrit_devanagari || '');

  return (
    <Link
      to={`/verses/${verse.canonical_id}`}
      className="block max-w-4xl mx-auto"
    >
      {/* Main Featured Verse Container - Clickable */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-12 border border-amber-200/50 shadow-xl hover:shadow-2xl hover:border-amber-300 transition-all cursor-pointer">
        {/* Sanskrit Devanagari - Spotlight */}
        {verse.sanskrit_devanagari && (
          <div className="text-center mb-8">
            <div className="text-4xl text-amber-400/50 mb-6 font-light">ॐ</div>
            <div className="text-2xl md:text-3xl font-serif text-amber-900 leading-relaxed tracking-wide mb-6 space-y-1">
              {sanskritLines.map((line, idx) => (
                <p key={idx} className="mb-0">
                  {line}
                </p>
              ))}
            </div>
            <Link
              to={`/verses/${verse.canonical_id}`}
              onClick={(e) => e.preventDefault()}
              className="text-amber-700/70 font-serif text-lg hover:text-amber-900 transition-colors"
            >
              ॥ {verseRef} ॥
            </Link>
          </div>
        )}

        {/* Paraphrase - Leadership Insight */}
        {verse.paraphrase_en && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-100/50">
            <p className="text-lg text-gray-800 leading-relaxed italic">
              "{verse.paraphrase_en}"
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default FeaturedVerse;
