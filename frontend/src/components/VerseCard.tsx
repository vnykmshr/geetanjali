import { Link } from 'react-router-dom';
import type { Verse } from '../types';

export interface VerseCardProps {
  verse: Verse;
  displayMode?: 'detail' | 'compact';
  showSpeaker?: boolean;
  showCitation?: boolean;
  showTranslation?: boolean;
}

function formatVerseRef(verse: Verse): string {
  return `${verse.chapter}.${verse.verse}`;
}

function getVerseLink(verse: Verse): string {
  return `/verses/${verse.canonical_id}`;
}

/**
 * Format Sanskrit text to display with proper line breaks
 * - Separates speaker intros (श्री भगवानुवाच, धृतराष्ट्र उवाच, etc.) on their own line
 * - Splits verse content on single danda (।) and adds proper spacing
 * - Uses alternating danda pattern: single (।), double (॥), single (।), double (॥)
 */
function formatSanskritLines(text: string): string[] {
  if (!text) return [];

  // Remove the verse number at the end (e.g., ।।2.52।। or ॥2.52॥)
  const withoutVerseNum = text.replace(/[।॥]+\d+\.\d+[।॥]+\s*$/, '');

  // Split by newlines to detect speaker intro lines
  const lines = withoutVerseNum.split('\n').map(l => l.trim()).filter(l => l);

  const result: string[] = [];

  let verseLineIndex = 0;

  // Process each line
  for (const line of lines) {
    // Check if this line contains speaker intro (contains वाच - said/spoke)
    if (line.includes('वाच')) {
      // This is a speaker intro line, add it as-is
      result.push(line);
    } else {
      // This is verse content, split on danda
      const parts = line.split(/।(?=[^।])/);

      // Alternate between single (।) and double (॥) danda for each verse line
      // Odd verse lines (1st, 3rd, etc.) get single danda
      // Even verse lines (2nd, 4th, etc.) get double danda
      const isEvenLine = (verseLineIndex + 1) % 2 === 0;
      const endDanda = isEvenLine ? ' ॥' : ' ।';

      if (parts.length >= 2) {
        // Multiple clauses in this line
        for (let i = 0; i < parts.length - 1; i++) {
          result.push(parts[i].trim() + ' ।');
        }
        result.push(parts[parts.length - 1].replace(/।+\s*$/, '').trim() + endDanda);
      } else {
        // Single clause
        result.push(line.replace(/।+\s*$/, '').trim() + endDanda);
      }

      verseLineIndex++;
    }
  }

  return result.length > 0 ? result : [text.trim()];
}

export function VerseCard({
  verse,
  displayMode = 'detail',
  showSpeaker = true,
  showCitation = true,
  showTranslation = true,
}: VerseCardProps) {
  const sanskritLines = formatSanskritLines(verse.sanskrit_devanagari || '');
  const isCompact = displayMode === 'compact';

  // Compact mode: filter out speaker intros if not needed
  const displayLines = !isCompact && showSpeaker ? sanskritLines : sanskritLines.filter(line => !line.includes('वाच'));

  return (
    <div className="relative">
      {/* Main Card */}
      <div className={`${isCompact
        ? 'bg-white rounded-lg p-4 border border-gray-100 shadow-sm'
        : 'bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl p-8 border-2 border-amber-200/50 shadow-inner'
      }`}>
        {/* Decorative Om - centered (detail mode only) */}
        {!isCompact && (
          <div className="text-center text-amber-400/50 text-3xl font-light mb-4">ॐ</div>
        )}

        {/* Verses centered */}
        <div>
          {/* Sanskrit Text */}
          {displayLines.length > 0 && (
            <div className={`${isCompact
              ? 'text-base text-gray-700 font-serif text-center leading-relaxed mb-2'
              : 'text-xl md:text-2xl text-amber-800/60 font-serif text-center leading-relaxed tracking-wide mb-6'
            }`}>
              {displayLines.map((line, idx) => {
                const isSpeakerIntro = line.includes('वाच');

                return (
                  <p
                    key={idx}
                    className={`${isCompact
                      ? 'mb-0.5'
                      : isSpeakerIntro ? 'text-lg text-amber-600/60 mb-2' : 'mb-1'
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          )}

          {/* English Translation (prefer translation_en, fallback to paraphrase_en) */}
          {showTranslation && (verse.translation_en || verse.paraphrase_en) && (
            <p className={`${isCompact
              ? 'text-xs text-gray-600 leading-relaxed mb-2'
              : 'text-lg text-gray-700 text-center leading-relaxed italic'
            }`}>
              "{verse.translation_en || verse.paraphrase_en}"
            </p>
          )}
        </div>

        {/* Citation Link - centered */}
        {showCitation && (
          <div className={`text-center ${isCompact ? '' : 'pt-6'}`}>
            <Link
              to={getVerseLink(verse)}
              className={`inline-block transition-colors ${isCompact
                ? 'text-gray-400 hover:text-gray-600 text-xs font-medium'
                : 'text-amber-600/70 hover:text-amber-700 text-sm font-medium'
              }`}
            >
              ॥ {formatVerseRef(verse)} ॥
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerseCard;
