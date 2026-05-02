import { request, buildQuery } from './client';

/**
 * SUPER_ADMIN: create a new admin account.
 * @param {AdminDto} body
 * @returns {Promise<AdminDto>}
 */
export function createAdmin(body) {
  return request('/api/v1/admins', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @returns {Promise<AdminDto>}
 */
export function getAdmin(id) {
  return request(`/api/v1/admins/${id}`);
}

/**
 * @param {number|string} id
 * @param {Partial<AdminDto>} body
 * @returns {Promise<AdminDto>}
 */
export function updateAdmin(id, body) {
  return request(`/api/v1/admins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * SUPER_ADMIN: paginated list of all admins.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<AdminDto>>}
 */
export function listAdmins({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/admins${buildQuery({ page, size })}`);
}
