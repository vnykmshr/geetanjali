import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { versesApi } from '../lib/api';
import type { Verse } from '../types';
import { Navbar } from '../components/Navbar';
import { VerseCard } from '../components/VerseCard';
import { errorMessages } from '../lib/errorMessages';

const VERSES_PER_PAGE = 24;

// Filter modes: 'featured' shows curated verses, 'all' shows all 701 verses
type FilterMode = 'featured' | 'all' | number; // number = specific chapter

export default function Verses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false); // Sync ref to prevent race conditions

  // Parse initial filter from URL
  const getInitialFilter = (): FilterMode => {
    const chapter = searchParams.get('chapter');
    if (chapter) return parseInt(chapter);
    const showAll = searchParams.get('all');
    if (showAll === 'true') return 'all';
    return 'featured';
  };

  const [filterMode, setFilterMode] = useState<FilterMode>(getInitialFilter);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  // Derived state
  const selectedChapter = typeof filterMode === 'number' ? filterMode : null;
  const showFeatured = filterMode === 'featured';
  const showAll = filterMode === 'all';

  // Memoized load functions
  const loadCount = useCallback(async () => {
    try {
      const chapter = typeof filterMode === 'number' ? filterMode : undefined;
      const featured = filterMode === 'featured' ? true : undefined;
      const count = await versesApi.count(chapter, featured);
      setTotalCount(count);
    } catch {
      setTotalCount(null);
    }
  }, [filterMode]);

  const loadVerses = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setVerses([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const chapter = typeof filterMode === 'number' ? filterMode : undefined;
      const featured = filterMode === 'featured' ? true : undefined;
      const skip = reset ? 0 : undefined;

      const data = await versesApi.list(skip ?? 0, VERSES_PER_PAGE, chapter, featured);

      if (reset) {
        setVerses(data);
      } else {
        setVerses(prev => [...prev, ...data]);
      }

      setHasMore(data.length === VERSES_PER_PAGE);
    } catch (err) {
      setError(errorMessages.verseLoad(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterMode]);

  useEffect(() => {
    loadVerses(true);
    loadCount();
  }, [loadVerses, loadCount]);

  const loadMore = useCallback(async () => {
    // Use ref to prevent race conditions (state updates are async)
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const chapter = typeof filterMode === 'number' ? filterMode : undefined;
      const featured = filterMode === 'featured' ? true : undefined;

      // Get current length synchronously via callback
      const currentLength = await new Promise<number>(resolve => {
        setVerses(prev => {
          resolve(prev.length);
          return prev;
        });
      });

      const data = await versesApi.list(currentLength, VERSES_PER_PAGE, chapter, featured);

      // Deduplicate when adding new verses
      setVerses(prev => {
        const existingIds = new Set(prev.map(v => v.id));
        const newVerses = data.filter(v => !existingIds.has(v.id));
        return [...prev, ...newVerses];
      });
      setHasMore(data.length === VERSES_PER_PAGE);
    } catch (err) {
      setError(errorMessages.verseLoad(err));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [filterMode]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading) {
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleFilterSelect = (filter: FilterMode) => {
    setFilterMode(filter);

    if (typeof filter === 'number') {
      setSearchParams({ chapter: filter.toString() });
    } else if (filter === 'all') {
      setSearchParams({ all: 'true' });
    } else {
      setSearchParams({});
    }
  };

  const getFilterDescription = () => {
    if (showFeatured) return 'featured ';
    if (selectedChapter) return `from Chapter ${selectedChapter} `;
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <Navbar />

      {/* Sticky Filter Bar - Below navbar */}
      <div className="sticky top-14 sm:top-16 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Filter Pills - Responsive Layout */}
          <div className="flex gap-1.5 sm:gap-2 items-center">
            {/* Featured */}
            <button
              onClick={() => handleFilterSelect('featured')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                showFeatured
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Featured
            </button>
            {/* All */}
            <button
              onClick={() => handleFilterSelect('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                showAll
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All
            </button>
            {/* Divider */}
            <div className="w-px h-8 bg-gray-300 flex-shrink-0" />

            {/* Chapter Dropdown - All screen sizes */}
            <div className="relative">
              <button
                onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedChapter
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {selectedChapter ? `Chapter ${selectedChapter}` : 'Chapter'}
                <svg
                  className={`w-4 h-4 transition-transform ${showChapterDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Panel */}
              {showChapterDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowChapterDropdown(false)}
                  />
                  {/* Panel */}
                  <div className="absolute right-0 sm:left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200 z-20 w-64 sm:w-72">
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 18 }, (_, i) => i + 1).map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => {
                            handleFilterSelect(chapter);
                            setShowChapterDropdown(false);
                          }}
                          className={`h-10 rounded-lg text-sm font-medium transition-all ${
                            selectedChapter === chapter
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200'
                          }`}
                        >
                          {chapter}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Error State */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold text-sm sm:text-base">Error loading verses</p>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && verses.length === 0 ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="text-gray-500 text-base sm:text-lg">Loading verses...</div>
            </div>
          ) : verses.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-gray-500 text-base sm:text-lg">No verses found</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Showing {verses.length}{totalCount ? ` of ${totalCount}` : ''} {getFilterDescription()}verse{(totalCount || verses.length) !== 1 ? 's' : ''}
                {hasMore && <span className="hidden sm:inline"> (scroll for more)</span>}
              </div>

              {/* Verse Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {verses.map((verse) => (
                  <Link
                    key={verse.id}
                    to={`/verses/${verse.canonical_id}`}
                    className="transition-all hover:shadow-lg"
                  >
                    <VerseCard
                      verse={verse}
                      displayMode="compact"
                      showSpeaker={false}
                      showCitation={true}
                      showTranslation={false}
                    />
                  </Link>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 mt-4 sm:mt-6">
                {loadingMore && (
                  <div className="flex justify-center items-center py-4">
                    <div className="text-gray-500 text-sm sm:text-base">Loading more verses...</div>
                  </div>
                )}
              </div>

              {/* End of Results */}
              {!hasMore && verses.length > 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">
                  End of verses
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom padding for FAB on mobile */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
