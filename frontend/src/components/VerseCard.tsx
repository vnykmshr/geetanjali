import { Link } from 'react-router-dom';
import { formatSanskritLines, isSpeakerIntro } from '../lib/sanskritFormatter';
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

export function VerseCard({
  verse,
  displayMode = 'detail',
  showSpeaker = true,
  showCitation = true,
  showTranslation = true,
}: VerseCardProps) {
  const isCompact = displayMode === 'compact';

  // For compact mode: no speaker intros, compact formatting
  // For detail mode: respect showSpeaker prop
  const sanskritLines = formatSanskritLines(verse.sanskrit_devanagari || '', {
    mode: isCompact ? 'compact' : 'detail',
    includeSpeakerIntro: isCompact ? false : showSpeaker,
  });

  // Compact mode: Sanskrit-only display for verse browsing
  if (isCompact) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl p-3 sm:p-4 border border-amber-200/50 shadow-md hover:shadow-lg hover:border-amber-300 transition-all">
        {/* Verse Reference */}
        <div className="text-amber-600 font-serif font-medium text-xs sm:text-sm mb-2 sm:mb-3">
          ॥ {formatVerseRef(verse)} ॥
        </div>

        {/* Full Sanskrit Verse */}
        <div className="text-amber-900 font-serif text-sm sm:text-base leading-relaxed text-center">
          {sanskritLines.map((line, idx) => (
            <p key={idx} className="mb-0.5">{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // Detail mode: keep speaker intro filtering logic
  const displayLines = showSpeaker ? sanskritLines : sanskritLines.filter(line => !isSpeakerIntro(line));

  // Detail mode: original layout
  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl p-5 sm:p-6 lg:p-8 border-2 border-amber-200/50 shadow-inner">
        {/* Decorative Om */}
        <div className="text-center mb-3 sm:mb-4 text-2xl sm:text-3xl text-amber-400/50 font-light">
          ॐ
        </div>

        {/* Verses centered */}
        <div className="flex-grow flex flex-col justify-center">
          {/* Sanskrit Text */}
          {displayLines.length > 0 && (
            <div className="text-base sm:text-xl md:text-2xl text-amber-800/60 font-serif text-center leading-relaxed tracking-wide mb-4 sm:mb-6">
              {displayLines.map((line, idx) => (
                <p
                  key={idx}
                  className={isSpeakerIntro(line) ? 'text-lg text-amber-600/60 mb-2' : 'mb-1'}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* English Translation */}
          {showTranslation && (verse.translation_en || verse.paraphrase_en) && (
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 text-center leading-relaxed italic">
              "{verse.translation_en || verse.paraphrase_en}"
            </p>
          )}
        </div>

        {/* Citation Link */}
        {showCitation && (
          <div className="text-center pt-4 sm:pt-6">
            <Link
              to={getVerseLink(verse)}
              className="inline-block transition-colors text-amber-600/70 hover:text-amber-700 text-xs sm:text-sm font-medium"
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
