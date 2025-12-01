import type { Option } from '../types';

interface OptionTableProps {
  options: Option[];
}

export default function OptionTable({ options }: OptionTableProps) {
  return (
    <div className="space-y-6">
      {options.map((option, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Option {index + 1}: {option.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            <div>
              <h4 className="font-medium text-green-700 mb-2 flex items-center">
                <span className="mr-2">✓</span> Pros
              </h4>
              <ul className="space-y-1">
                {option.pros.map((pro, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="mr-2">✗</span> Cons
              </h4>
              <ul className="space-y-1">
                {option.cons.map((con, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    • {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Referenced Verses */}
          {option.verses && option.verses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 text-sm mb-2">
                Supporting Verses:
              </h4>
              <div className="flex flex-wrap gap-2">
                {option.verses.map((verse, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-mono rounded"
                  >
                    {verse}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
