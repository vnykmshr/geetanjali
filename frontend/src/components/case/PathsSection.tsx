interface PathOption {
  title: string;
  pros: string[];
  cons: string[];
}

interface PathsSectionProps {
  options: PathOption[];
  selectedOption: number;
  showPaths: boolean;
  onToggle: () => void;
  onSelectOption: (index: number) => void;
}

export function PathsSection({
  options,
  selectedOption,
  showPaths,
  onToggle,
  onSelectOption,
}: PathsSectionProps) {
  if (options.length === 0) return null;

  return (
    <div className="relative pl-8 sm:pl-10 pb-3 sm:pb-4">
      <div className="absolute left-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>

      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center justify-between bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">
              Paths Before You
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              {options.length} approaches to consider
            </p>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPaths ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showPaths && (
        <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          {/* Path selector - horizontal scroll on mobile, grid on larger screens */}
          <div className="flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`flex-shrink-0 w-28 sm:w-auto p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all h-full ${
                  selectedOption === idx
                    ? 'bg-red-50 border-red-400 shadow-md'
                    : 'bg-white border-gray-200 hover:border-red-200'
                }`}
              >
                <div className={`text-xs font-semibold ${selectedOption === idx ? 'text-red-700' : 'text-gray-500'}`}>
                  Path {idx + 1}
                </div>
                <div className={`text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 leading-snug line-clamp-2 ${selectedOption === idx ? 'text-red-900' : 'text-gray-700'}`}>
                  {opt.title.replace(' Approach', '')}
                </div>
              </button>
            ))}
          </div>

          {/* Selected path details */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-red-100">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
              {options[selectedOption].title}
            </h4>
            {/* Stack on mobile, side-by-side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div>
                <div className="text-xs font-semibold text-green-700 mb-1">Benefits</div>
                {options[selectedOption].pros.map((pro, i) => (
                  <div key={i} className="text-xs sm:text-sm text-gray-700 flex items-start gap-1 mb-0.5">
                    <span className="text-green-500 mt-0.5 text-xs flex-shrink-0">+</span>
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 mb-1">Consider</div>
                {options[selectedOption].cons.map((con, i) => (
                  <div key={i} className="text-xs sm:text-sm text-gray-700 flex items-start gap-1 mb-0.5">
                    <span className="text-amber-500 mt-0.5 text-xs flex-shrink-0">-</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
