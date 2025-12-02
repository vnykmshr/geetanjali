import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { versesApi } from '../lib/api';
import type { Verse, Translation } from '../types';
import { Navbar } from '../components/Navbar';
import { errorMessages } from '../lib/errorMessages';

// Translator priority order (1 = highest)
const TRANSLATOR_PRIORITY: Record<string, number> = {
  'Swami Gambirananda': 1,
  'Swami Adidevananda': 2,
  'Swami Sivananda': 3,
  'Dr. S. Sankaranarayan': 4,
  'Shri Purohit Swami': 5,
};

// Sort translations by priority
function sortTranslations(translations: Translation[]): Translation[] {
  return [...translations].sort((a, b) => {
    const priorityA = a.translator ? (TRANSLATOR_PRIORITY[a.translator] || 99) : 99;
    const priorityB = b.translator ? (TRANSLATOR_PRIORITY[b.translator] || 99) : 99;
    return priorityA - priorityB;
  });
}


export default function VerseDetail() {
  const { canonicalId } = useParams<{ canonicalId: string }>();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canonicalId) return;

    const loadVerseDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load verse and translations in parallel
        const [verseData, translationsData] = await Promise.all([
          versesApi.get(canonicalId),
          versesApi.getTranslations(canonicalId).catch(() => []),
        ]);

        setVerse(verseData);
        setTranslations(sortTranslations(translationsData));
      } catch (err) {
        setError(errorMessages.verseLoad(err));
      } finally {
        setLoading(false);
      }
    };

    loadVerseDetails();
  }, [canonicalId]);

  // Format canonical ID for display (BG_2_47 -> 2.47)
  const formatVerseId = (id: string) => id.replace('BG_', '').replace(/_/g, '.');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading verse...</div>
        </div>
      </div>
    );
  }

  if (error || !verse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || 'Verse not found'}</p>
            <Link to="/verses" className="text-red-600 hover:text-red-700">
              ← Back to Verses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Link */}
          <div className="mb-6">
            <Link to="/verses" className="text-red-600 hover:text-red-700 font-medium">
              ← Back to Verses
            </Link>
          </div>

          {/* Verse Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-baseline gap-4 mb-6">
              <h1 className="text-4xl font-bold text-gray-900">
                {formatVerseId(verse.canonical_id)}
              </h1>
              <span className="text-lg text-orange-600 font-medium">
                Chapter {verse.chapter}, Verse {verse.verse}
              </span>
            </div>

            {/* Sanskrit Devanagari */}
            {verse.sanskrit_devanagari && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Sanskrit
                </h2>
                <p className="text-2xl text-gray-800 font-serif leading-relaxed">
                  {verse.sanskrit_devanagari}
                </p>
              </div>
            )}

            {/* Sanskrit IAST (Romanized) */}
            {verse.sanskrit_iast && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Romanized (IAST)
                </h2>
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  {verse.sanskrit_iast}
                </p>
              </div>
            )}

            {/* Primary Translation */}
            {verse.translation_en && (
              <div className="mb-6 bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-2">
                  Translation
                </h2>
                <p className="text-lg text-gray-800 leading-relaxed">
                  {verse.translation_en}
                </p>
                {verse.source && (
                  <p className="text-sm text-gray-500 mt-3">
                    <a
                      href={verse.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      View source
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Paraphrase / Leadership Summary */}
            {verse.paraphrase_en && (
              <div className="mb-6 bg-red-50 rounded-xl p-6 border border-red-100">
                <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                  Leadership Insight
                </h2>
                <p className="text-lg text-gray-800 leading-relaxed italic">
                  "{verse.paraphrase_en}"
                </p>
              </div>
            )}

            {/* Consulting Principles */}
            {verse.consulting_principles && verse.consulting_principles.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Consulting Principles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {verse.consulting_principles.map((principle, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-200"
                    >
                      {principle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Translations Section */}
          {translations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Translations ({translations.length})
              </h2>
              <div className="space-y-8">
                {translations.map((translation, index) => (
                  <div
                    key={translation.id}
                    className="border-l-4 border-orange-400 pl-6 py-3"
                  >
                    {/* Translation text - more prominent */}
                    <p className="text-lg text-gray-800 leading-relaxed mb-4">
                      {translation.text}
                    </p>
                    {/* Translator info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {translation.translator && (
                        <span className="font-medium text-gray-700">
                          — {translation.translator}
                        </span>
                      )}
                      {translation.school && (
                        <span className="text-gray-500">
                          {translation.school}
                        </span>
                      )}
                      {translation.source && (
                        <a
                          href={translation.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          Source
                        </a>
                      )}
                    </div>
                    {/* Subtle divider between translations (except last) */}
                    {index < translations.length - 1 && (
                      <div className="mt-6 border-b border-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation to adjacent verses */}
          <div className="mt-8 flex justify-between items-center">
            {verse.verse > 1 ? (
              <Link
                to={`/verses/BG_${verse.chapter}_${verse.verse - 1}`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                ← Previous Verse
              </Link>
            ) : verse.chapter > 1 ? (
              <Link
                to={`/verses?chapter=${verse.chapter - 1}`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                ← Previous Chapter
              </Link>
            ) : (
              <div />
            )}
            <Link
              to={`/verses/BG_${verse.chapter}_${verse.verse + 1}`}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Next Verse →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
