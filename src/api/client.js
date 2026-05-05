const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ACCESS_KEY = 'hireai_access_token';
const REFRESH_KEY = 'hireai_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set({ accessToken, refreshToken }) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Deduplicates concurrent 401s — only one refresh call in-flight at a time
let pendingRefresh = null;

async function doRefresh() {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokenStore.getRefresh() }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('refresh_failed');
      return res.json();
    })
    .then((data) => tokenStore.set(data))
    .finally(() => { pendingRefresh = null; });
  return pendingRefresh;
}

export async function request(path, { headers: extra = {}, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = tokenStore.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Let the browser set the correct multipart boundary for file uploads
  if (options.body instanceof FormData) delete headers['Content-Type'];

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && tokenStore.getRefresh()) {
    try {
      await doRefresh();
      headers['Authorization'] = `Bearer ${tokenStore.getAccess()}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch {
      tokenStore.clear();
      // Notify the app that the session expired without forcing a hard navigation
      window.dispatchEvent(new CustomEvent('hireai:session-expired'));
      throw Object.assign(new Error('Session expired. Please sign in again.'), { status: 401 });
    }
  }

  return handleResponse(res);
}

const USER_MESSAGES = {
  400: 'Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested item could not be found.',
  409: 'This action conflicts with existing data.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again.',
  503: 'Service temporarily unavailable. Please try again shortly.',
};

function extractMessage(body, status) {
  const raw = body?.detail ?? body?.message;
  if (typeof raw === 'string' && raw.length > 0 && raw.length <= 160 && !/^HTTP \d/.test(raw) && status < 500) {
    return raw;
  }
  return USER_MESSAGES[status] ?? 'An unexpected error occurred. Please try again.';
}

async function handleResponse(res) {
  if (res.status === 204) return null;
  const isJson = res.headers.get('Content-Type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = extractMessage(typeof body === 'object' ? body : {}, res.status);
    throw Object.assign(new Error(message), { status: res.status });
  }
  return body;
}

/**
 * Builds a query string from a flat object, omitting null / undefined / empty-string values.
 * Returns the string with a leading "?" or "" if no params are set.
 */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
