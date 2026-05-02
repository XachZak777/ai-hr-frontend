import { request, tokenStore } from './client';

/**
 * Register a new user. Stores the returned token pair automatically.
 * @param {{ email: string, fullName: string, password: string, role: 'CANDIDATE'|'RECRUITER'|'ADMIN' }} body
 * @returns {Promise<AuthResponse>}
 */
export async function register({ email, fullName, password, role }) {
  const data = await request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, fullName, password, role }),
  });
  tokenStore.set(data);
  return data;
}

/**
 * Sign in an existing user. Stores the returned token pair automatically.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<AuthResponse>}
 */
export async function login({ email, password }) {
  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  tokenStore.set(data);
  return data;
}

/**
 * Revoke the current refresh token server-side and clear local tokens.
 * Safe to call even if the request fails (tokens are cleared regardless).
 */
export async function logout() {
  try {
    await request('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenStore.getRefresh() }),
    });
  } finally {
    tokenStore.clear();
  }
}
