/**
 * Shared utilities for navigation components
 */

/**
 * Get user initials for avatar display
 * - Two-word names: first + last initial (e.g., "John Doe" → "JD")
 * - Single-word names: first two characters (e.g., "John" → "JO")
 * - Empty/undefined: "?"
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get first name from full name
 */
export function getFirstName(name: string | undefined): string {
  if (!name) return "User";
  return name.trim().split(" ")[0];
}
