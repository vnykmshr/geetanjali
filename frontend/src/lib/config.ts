/**
 * Frontend configuration - centralized environment variables
 *
 * All environment-dependent values should be defined here.
 * In production (Docker), use relative paths - nginx proxies /api/ to backend.
 * In development, use localhost:8000 for direct backend access.
 */

// API configuration
export const API_BASE_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');

export const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX || '/api/v1';

// Site URL for SEO and canonical links
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://geetanjaliapp.com';
