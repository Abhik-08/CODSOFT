/**
 * Centralized API Layer — Production-Ready
 * Student Grade Calculator (GradeIQ)
 *
 * Responsibilities:
 *  - Environment-aware base URL resolution
 *  - Request timeout via AbortController
 *  - Automatic JWT attachment
 *  - Normalised error wrapping (ApiError)
 *  - 401 / 403 → token expiry flow
 *  - Network error detection
 *  - Transient failure retry (503 / network)
 */

// ── Base URL ──────────────────────────────────────────────────────────────
//
// Dev:  VITE_API_URL is intentionally empty; Vite's proxy rewrites /api →
//       localhost:8080 automatically (see vite.config.js).
//
// Prod: Set VITE_API_URL to the deployed backend origin before `npm run build`.
//       Example: https://api.gradeiq.yourdomain.com
//
const _envApiUrl = import.meta.env.VITE_API_URL?.trim();
const BASE_URL = _envApiUrl || '';          // empty string → relative URL (proxy or same-origin)
const API_BASE = `${BASE_URL}/api`;

// ── Config ────────────────────────────────────────────────────────────────
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000;
const MAX_RETRIES        = 1;   // retry once on transient failures
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns true if the navigator reports no network connectivity.
 */
function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── ApiError ──────────────────────────────────────────────────────────────

/**
 * Normalised error thrown by all API calls.
 *
 * Properties:
 *   message          — human-readable description
 *   status           — HTTP status code (0 = network / timeout)
 *   errorType        — short machine-readable category string
 *   validationErrors — field-level validation map from Spring Boot (or null)
 *   isNetworkError   — true when no HTTP response was received
 *   isAuthError      — true when status is 401 or 403
 */
export class ApiError extends Error {
  constructor(message, status = 0, errorType = 'Unknown Error', validationErrors = null) {
    super(message);
    this.name             = 'ApiError';
    this.status           = status;
    this.errorType        = errorType;
    this.validationErrors = validationErrors;
    this.isNetworkError   = status === 0;
    this.isAuthError      = status === 401 || status === 403;
  }
}

// ── Token helpers ─────────────────────────────────────────────────────────

const TOKEN_KEY = 'gradeiq_jwt_token';

function getToken()         { return localStorage.getItem(TOKEN_KEY); }
function clearToken()       { localStorage.removeItem(TOKEN_KEY); }

/**
 * Dispatch auth-expired event so App.jsx can redirect to login without
 * needing a direct coupling to the API layer.
 */
function dispatchAuthExpired() {
  globalThis.dispatchEvent(new Event('auth-expired'));
}

// ── Core fetch wrapper ────────────────────────────────────────────────────

/**
 * apiFetch — wraps the native fetch API with:
 *  - Timeout via AbortController
 *  - JWT injection
 *  - Structured error parsing
 *  - Auth-expiry event dispatch on 401/403
 *
 * @param {string} endpoint  — path after /api, e.g. '/auth/login'
 * @param {RequestInit} options — standard fetch options
 * @param {number} timeoutMs — per-request timeout override
 */

/**
 * Handles network/timeout errors thrown by fetch().
 * Always throws an ApiError — never returns.
 */
function handleFetchError(err, timeoutMs) {
  if (err.name === 'AbortError') {
    throw new ApiError(
      `Request timed out after ${timeoutMs / 1000}s. The server may be unavailable — please try again.`,
      0,
      'Request Timeout'
    );
  }
  const hint = import.meta.env.DEV
    ? ' Make sure the Spring Boot backend is running on port 8080.'
    : ' Please try again later or contact support if the issue persists.';
  throw new ApiError(`Unable to reach the server.${hint}`, 0, 'Network Error');
}

/**
 * Parses an HTTP error response and throws the appropriate ApiError.
 * Always throws — never returns.
 *
 * @param {Response} response
 * @param {object|null} data — parsed JSON body (may be null)
 * @param {string|null} token — current JWT (used to distinguish 403 scenarios)
 */
/**
 * Parses an HTTP error response and throws the appropriate ApiError.
 * Always throws — never returns.
 *
 * @param {Response} response
 * @param {object|null} data — parsed JSON body (may be null)
 * @param {string|null} token — current JWT (used to distinguish 403 scenarios)
 * @param {string} endpoint — current API endpoint being called
 */
function handleHttpError(response, data, token, endpoint = '') {
  const { status } = response;
  const isAuthEndpoint = endpoint.includes('/auth/');

  if (status === 401 && !isAuthEndpoint) {
    clearToken();
    dispatchAuthExpired();
    throw new ApiError('Your session is invalid or has expired. Please sign in again.', 401, 'Unauthorized');
  }

  if (status === 401 && isAuthEndpoint) {
    const errorMsg = data?.message || 'Invalid email or password';
    throw new ApiError(errorMsg, 401, 'Unauthorized');
  }

  if (status === 403 && token) {
    clearToken();
    dispatchAuthExpired();
    throw new ApiError('Your session has expired. Please sign in again.', 403, 'Session Expired');
  }

  const validationErrors = data?.errors || null;
  const errorMsg  = data?.message || `Request failed (${status})`;
  const errorType = data?.error   || 'Server Error';
  throw new ApiError(errorMsg, status, errorType, validationErrors);
}
/**
 * Attempts to parse the response body as JSON.
 * Returns null on any failure — never throws.
 */
async function parseJsonBody(response) {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (isOffline()) {
    throw new ApiError('No internet connection. Please check your network and try again.', 0, 'Network Offline');
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  // Read token and sanitize common invalid stored values ('null' / 'undefined')
  const rawToken = getToken();
  const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;
  if (!token && rawToken) {
    // If an invalid sentinel string was stored, clear it to avoid sending
    // "Bearer null" which results in confusing 401s on the server.
    clearToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Ensure fetch sends credentials for same-origin requests (helps with some
  // proxy setups). Do not override if caller explicitly set credentials.
  if (!options.credentials) {
    options.credentials = 'same-origin';
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    handleFetchError(err, timeoutMs); // always throws
  }

  const data = await parseJsonBody(response);

  if (!response.ok) {
    handleHttpError(response, data, token, endpoint); // always throws
  }

  return data;
}



// ── Retry wrapper ─────────────────────────────────────────────────────────

/**
 * Wraps apiFetch with a single retry on transient server/network failures.
 * Auth errors (401/403) and validation errors (400/422) are NOT retried.
 */
async function apiFetchWithRetry(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await apiFetch(endpoint, options, timeoutMs);
    } catch (err) {
      lastError = err;
      const shouldRetry =
        attempt < MAX_RETRIES &&
        (err.isNetworkError || RETRYABLE_STATUSES.has(err.status));
      if (!shouldRetry) break;
      // Back-off: 800 ms before retry
      await sleep(800);
    }
  }
  throw lastError;
}

// ── Public API methods ────────────────────────────────────────────────────

/**
 * Register a new user account.
 */
export async function register(username, email, password) {
  return apiFetchWithRetry('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * Authenticate with email + password, returns { token, message }.
 */
export async function login(email, password) {
  return apiFetchWithRetry('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Calculate grades for a student (JWT-protected).
 * Subjects are mapped from the frontend { name, marks } shape to the
 * backend DTO shape { subjectName, marks }.
 */
export async function calculateGrade(studentName, subjects) {
  const requestSubjects = subjects.map((s) => ({
    subjectName: s.name.trim(),
    marks: Number.parseInt(s.marks, 10),
  }));

  return apiFetchWithRetry('/grade/calculate', {
    method: 'POST',
    body: JSON.stringify({ studentName, subjects: requestSubjects }),
  });
}
