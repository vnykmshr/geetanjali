/**
 * Translator Priority Order and Configuration
 * Used in VerseDetail to prioritize which translation is displayed first
 */

export const TRANSLATOR_PRIORITY: Record<string, number> = {
  'Swami Gambirananda': 1,
  'Swami Adidevananda': 2,
  'Swami Sivananda': 3,
  'Dr. S. Sankaranarayan': 4,
  'Shri Purohit Swami': 5,
};

/**
 * Get priority order for a translator
 * @param translator - Translator name
 * @returns Priority number (lower = higher priority), or 99 if unknown
 */
export function getTranslatorPriority(translator?: string): number {
  if (!translator) return 99;
  return TRANSLATOR_PRIORITY[translator] ?? 99;
}
