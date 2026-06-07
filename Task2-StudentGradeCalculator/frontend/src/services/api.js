/**
 * Centralized API Layer
 * Student Grade Calculator (GradeIQ)
 */

const _envApiUrl = import.meta.env.VITE_API_URL?.trim();
const BASE_URL = _envApiUrl || '';          // empty string → relative URL (proxy or same-origin)
const API_BASE = `${BASE_URL}/api`;

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000;
const MAX_RETRIES        = 1;   // retry once on transient failures
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {
  constructor(message, status = 0, errorType = 'Unknown Error', validationErrors = null) {
    super(message);
    this.name             = 'ApiError';
    this.status           = status;
    this.errorType        = errorType;
    this.validationErrors = validationErrors;
    this.isNetworkError   = status === 0;
  }
}

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

function handleHttpError(response, data) {
  const { status } = response;
  const validationErrors = data?.errors || null;
  const errorMsg  = data?.message || `Request failed (${status})`;
  const errorType = data?.error   || 'Server Error';
  throw new ApiError(errorMsg, status, errorType, validationErrors);
}

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

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...options.headers,
  };

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
    handleHttpError(response, data); // always throws
  }

  return data;
}

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
      await sleep(800);
    }
  }
  throw lastError;
}

/**
 * Calculate grades for a student.
 */
export async function calculateGrade(studentName, subjects) {
  const requestSubjects = subjects.map((s) => ({
    subjectName: s.name.trim(),
    marks: s.incomplete ? null : Number.parseInt(s.marks, 10),
    incomplete: s.incomplete || false,
  }));

  return apiFetchWithRetry('/grade/calculate', {
    method: 'POST',
    body: JSON.stringify({ studentName, subjects: requestSubjects }),
  });
}
