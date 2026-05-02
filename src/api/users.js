import { request, buildQuery } from './client';

/**
 * @returns {Promise<UserResponse>}
 */
export function getUser(id) {
  return request(`/api/v1/users/${id}`);
}

/**
 * @param {number|string} id
 * @param {Partial<UserResponse>} body
 * @returns {Promise<UserResponse>}
 */
export function updateUser(id, body) {
  return request(`/api/v1/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Admin: deactivate a user account.
 * @returns {Promise<null>} 204 No Content
 */
export function deactivateUser(id) {
  return request(`/api/v1/users/${id}/deactivate`, { method: 'PATCH' });
}

/**
 * Admin: paginated list of users with optional filters.
 * @param {{ role?: string, active?: boolean, page?: number, size?: number }} params
 * @returns {Promise<Page<UserResponse>>}
 */
export function listUsers({ role, active, page = 0, size = 20 } = {}) {
  return request(`/api/v1/users${buildQuery({ role, active, page, size })}`);
}
