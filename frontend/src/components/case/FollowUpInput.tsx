import type { FormEvent } from 'react';

interface FollowUpInputProps {
  value: string;
  submitting: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function FollowUpInput({ value, submitting, onChange, onSubmit }: FollowUpInputProps) {
  return (
    <div className="mt-4 bg-white rounded-xl shadow-md p-3 sm:p-4">
      <form onSubmit={onSubmit}>
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!value.trim() || submitting}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">{submitting ? '...' : 'Ask'}</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
