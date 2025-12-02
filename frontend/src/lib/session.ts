/**
 * Session management for anonymous users
 *
 * Generates and persists a unique session ID for anonymous users to track
 * their cases and interactions across the session.
 */

const SESSION_ID_KEY = 'geetanjali_session_id';

/**
 * Generate a new session ID using crypto.randomUUID()
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create a session ID
 *
 * If a session ID exists in sessionStorage, return it.
 * Otherwise, generate a new one and store it.
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the current session ID
 * Useful when user logs in or explicitly wants to start a new session
 */
export function clearSessionId(): void {
  sessionStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Check if a session ID exists
 */
export function hasSessionId(): boolean {
  return sessionStorage.getItem(SESSION_ID_KEY) !== null;
}
