/**
 * Centralized error message utility
 *
 * Converts technical API errors into human-friendly messages
 */

import { AxiosError } from 'axios';

// Context-specific error messages
type ErrorContext =
  | 'login'
  | 'signup'
  | 'logout'
  | 'refresh'
  | 'case_create'
  | 'case_load'
  | 'case_analyze'
  | 'verse_load'
  | 'search'
  | 'general';

// HTTP status code to friendly message mapping
const HTTP_STATUS_MESSAGES: Record<number, Record<ErrorContext, string>> = {
  400: {
    login: 'Please check your email and password format.',
    signup: 'Please check your information and try again.',
    logout: 'Unable to sign out. Please try again.',
    refresh: 'Your session has expired. Please sign in again.',
    case_create: 'Please check your input and try again.',
    case_load: 'Unable to load the consultation.',
    case_analyze: 'Unable to analyze this case. Please try again.',
    verse_load: 'Unable to load the verse.',
    search: 'Please try a different search term.',
    general: 'Please check your input and try again.',
  },
  401: {
    login: 'Invalid email or password. Please try again.',
    signup: 'Unable to create account. Please try again.',
    logout: 'You have been signed out.',
    refresh: 'Your session has expired. Please sign in again.',
    case_create: 'Please sign in to submit a consultation.',
    case_load: 'Please sign in to view this consultation.',
    case_analyze: 'Please sign in to analyze this case.',
    verse_load: 'Please sign in to access this content.',
    search: 'Please sign in to search.',
    general: 'Please sign in to continue.',
  },
  403: {
    login: 'Access denied. Please contact support if this continues.',
    signup: 'Account creation is currently unavailable.',
    logout: 'Unable to sign out. Please try again.',
    refresh: 'Access denied. Please sign in again.',
    case_create: 'You do not have permission to create consultations.',
    case_load: 'You do not have permission to view this consultation.',
    case_analyze: 'You do not have permission to analyze this case.',
    verse_load: 'You do not have permission to access this content.',
    search: 'You do not have permission to search.',
    general: 'You do not have permission to perform this action.',
  },
  404: {
    login: 'Account not found. Please check your email or sign up.',
    signup: 'Unable to complete signup. Please try again.',
    logout: 'Already signed out.',
    refresh: 'Session not found. Please sign in again.',
    case_create: 'Unable to create consultation.',
    case_load: 'Consultation not found.',
    case_analyze: 'Case not found.',
    verse_load: 'Verse not found.',
    search: 'No results found.',
    general: 'The requested item was not found.',
  },
  409: {
    login: 'Account issue detected. Please contact support.',
    signup: 'An account with this email already exists. Please sign in instead.',
    logout: 'Unable to sign out. Please try again.',
    refresh: 'Session conflict. Please sign in again.',
    case_create: 'A similar consultation already exists.',
    case_load: 'Unable to load consultation.',
    case_analyze: 'Analysis already in progress.',
    verse_load: 'Unable to load verse.',
    search: 'Search conflict. Please try again.',
    general: 'A conflict occurred. Please try again.',
  },
  422: {
    login: 'Invalid email or password format.',
    signup: 'Please check your information. Make sure your password meets the requirements.',
    logout: 'Unable to sign out.',
    refresh: 'Invalid session.',
    case_create: 'Please provide more details in your question.',
    case_load: 'Invalid consultation ID.',
    case_analyze: 'Unable to analyze. Please check the case details.',
    verse_load: 'Invalid verse ID.',
    search: 'Invalid search query.',
    general: 'Please check your input and try again.',
  },
  429: {
    login: 'Too many attempts. Please wait a moment and try again.',
    signup: 'Too many attempts. Please wait a moment and try again.',
    logout: 'Please wait a moment before trying again.',
    refresh: 'Too many requests. Please wait a moment.',
    case_create: 'You have submitted too many consultations. Please wait a moment.',
    case_load: 'Too many requests. Please wait a moment.',
    case_analyze: 'Analysis rate limit reached. Please wait a moment.',
    verse_load: 'Too many requests. Please wait a moment.',
    search: 'Too many searches. Please wait a moment.',
    general: 'Too many requests. Please wait a moment and try again.',
  },
  500: {
    login: 'Something went wrong on our end. Please try again later.',
    signup: 'Something went wrong on our end. Please try again later.',
    logout: 'Something went wrong. You have been signed out locally.',
    refresh: 'Something went wrong. Please sign in again.',
    case_create: 'Unable to submit your question right now. Please try again later.',
    case_load: 'Unable to load consultation right now. Please try again later.',
    case_analyze: 'Analysis temporarily unavailable. Please try again later.',
    verse_load: 'Unable to load verse right now. Please try again later.',
    search: 'Search temporarily unavailable. Please try again later.',
    general: 'Something went wrong. Please try again later.',
  },
  502: {
    login: 'Our servers are temporarily unavailable. Please try again later.',
    signup: 'Our servers are temporarily unavailable. Please try again later.',
    logout: 'Our servers are temporarily unavailable.',
    refresh: 'Our servers are temporarily unavailable.',
    case_create: 'Our servers are temporarily unavailable. Please try again later.',
    case_load: 'Our servers are temporarily unavailable. Please try again later.',
    case_analyze: 'Our servers are temporarily unavailable. Please try again later.',
    verse_load: 'Our servers are temporarily unavailable. Please try again later.',
    search: 'Our servers are temporarily unavailable. Please try again later.',
    general: 'Our servers are temporarily unavailable. Please try again later.',
  },
  503: {
    login: 'Service is temporarily unavailable. Please try again later.',
    signup: 'Service is temporarily unavailable. Please try again later.',
    logout: 'Service is temporarily unavailable.',
    refresh: 'Service is temporarily unavailable.',
    case_create: 'Service is temporarily unavailable. Please try again later.',
    case_load: 'Service is temporarily unavailable. Please try again later.',
    case_analyze: 'Service is temporarily unavailable. Please try again later.',
    verse_load: 'Service is temporarily unavailable. Please try again later.',
    search: 'Service is temporarily unavailable. Please try again later.',
    general: 'Service is temporarily unavailable. Please try again later.',
  },
};

// Network error messages
const NETWORK_ERROR_MESSAGES: Record<ErrorContext, string> = {
  login: 'Unable to connect. Please check your internet connection and try again.',
  signup: 'Unable to connect. Please check your internet connection and try again.',
  logout: 'Unable to connect. You have been signed out locally.',
  refresh: 'Unable to connect. Please check your internet connection.',
  case_create: 'Unable to connect. Please check your internet connection and try again.',
  case_load: 'Unable to connect. Please check your internet connection.',
  case_analyze: 'Unable to connect. Please check your internet connection.',
  verse_load: 'Unable to connect. Please check your internet connection.',
  search: 'Unable to connect. Please check your internet connection.',
  general: 'Unable to connect. Please check your internet connection.',
};

// Timeout error messages
const TIMEOUT_ERROR_MESSAGES: Record<ErrorContext, string> = {
  login: 'The request took too long. Please try again.',
  signup: 'The request took too long. Please try again.',
  logout: 'The request took too long. You have been signed out locally.',
  refresh: 'The request took too long. Please sign in again.',
  case_create: 'Submission is taking longer than expected. Please try again.',
  case_load: 'Loading is taking too long. Please refresh the page.',
  case_analyze: 'Analysis is taking longer than expected. Please check back shortly.',
  verse_load: 'Loading is taking too long. Please refresh the page.',
  search: 'Search is taking too long. Please try again.',
  general: 'The request took too long. Please try again.',
};

// Default fallback messages per context
const DEFAULT_ERROR_MESSAGES: Record<ErrorContext, string> = {
  login: 'Unable to sign in. Please try again.',
  signup: 'Unable to create account. Please try again.',
  logout: 'Unable to sign out. Please try again.',
  refresh: 'Session error. Please sign in again.',
  case_create: 'Unable to submit your question. Please try again.',
  case_load: 'Unable to load consultation. Please try again.',
  case_analyze: 'Unable to analyze case. Please try again.',
  verse_load: 'Unable to load verse. Please try again.',
  search: 'Search failed. Please try again.',
  general: 'Something went wrong. Please try again.',
};

/**
 * Patterns to detect if a message is already user-friendly
 * (typically from backend validation or custom error handling)
 */
function isAlreadyFriendly(message: string): boolean {
  const technicalPatterns = [
    /^Request failed with status code \d+$/i,
    /^Network Error$/i,
    /^timeout of \d+ms exceeded$/i,
    /^ECONNREFUSED$/i,
    /^ENOTFOUND$/i,
    /^ETIMEDOUT$/i,
    /^ERR_/i,
    /^[A-Z_]+_ERROR$/,
    /^\d{3}$/,
    /^Internal Server Error$/i,
    /^Bad Request$/i,
    /^Unauthorized$/i,
    /^Forbidden$/i,
    /^Not Found$/i,
    /^Service Unavailable$/i,
    // Technical LLM/backend errors
    /LLM unavailable/i,
    /Anthropic/i,
    /Ollama/i,
    /OpenAI/i,
    /API key/i,
    /rate limit/i,
    /token limit/i,
    /context length/i,
    /JSON parse/i,
    /database error/i,
    /connection refused/i,
    /pipeline failed/i,
  ];

  return !technicalPatterns.some(pattern => pattern.test(message.trim()));
}

/**
 * Get a user-friendly error message from any error
 *
 * @param error - The error object (can be AxiosError, Error, or unknown)
 * @param context - The context in which the error occurred
 * @returns A human-friendly error message
 */
export function getErrorMessage(error: unknown, context: ErrorContext = 'general'): string {
  // Handle null/undefined
  if (!error) {
    return DEFAULT_ERROR_MESSAGES[context];
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    // Check for backend-provided detail message first
    const backendMessage = error.response?.data?.detail;
    if (backendMessage && typeof backendMessage === 'string' && isAlreadyFriendly(backendMessage)) {
      return backendMessage;
    }

    // Handle validation errors (array of details)
    if (Array.isArray(error.response?.data?.detail)) {
      const validationErrors = error.response?.data?.detail;
      if (validationErrors.length > 0 && validationErrors[0].msg) {
        return validationErrors[0].msg;
      }
    }

    // Network error (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return TIMEOUT_ERROR_MESSAGES[context];
      }
      return NETWORK_ERROR_MESSAGES[context];
    }

    // HTTP status code based message
    const status = error.response.status;
    if (HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status][context];
    }

    // Generic server error for unknown 5xx
    if (status >= 500) {
      return HTTP_STATUS_MESSAGES[500][context];
    }

    // Generic client error for unknown 4xx
    if (status >= 400) {
      return DEFAULT_ERROR_MESSAGES[context];
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check if the message is already user-friendly
    if (isAlreadyFriendly(error.message)) {
      return error.message;
    }
    return DEFAULT_ERROR_MESSAGES[context];
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (isAlreadyFriendly(error)) {
      return error;
    }
    return DEFAULT_ERROR_MESSAGES[context];
  }

  // Fallback for unknown error types
  return DEFAULT_ERROR_MESSAGES[context];
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError<{ detail?: string | Array<{ msg: string }> }> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Convenience functions for specific contexts
 */
export const errorMessages = {
  login: (error: unknown) => getErrorMessage(error, 'login'),
  signup: (error: unknown) => getErrorMessage(error, 'signup'),
  logout: (error: unknown) => getErrorMessage(error, 'logout'),
  caseCreate: (error: unknown) => getErrorMessage(error, 'case_create'),
  caseLoad: (error: unknown) => getErrorMessage(error, 'case_load'),
  caseAnalyze: (error: unknown) => getErrorMessage(error, 'case_analyze'),
  verseLoad: (error: unknown) => getErrorMessage(error, 'verse_load'),
  search: (error: unknown) => getErrorMessage(error, 'search'),
  general: (error: unknown) => getErrorMessage(error, 'general'),
};

export default errorMessages;
