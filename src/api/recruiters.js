import { request, buildQuery } from './client';

/**
 * Create a recruiter profile for the authenticated user.
 * @param {RecruiterDto} body
 * @returns {Promise<RecruiterDto>}
 */
export function createRecruiter(body) {
  return request('/api/v1/recruiters', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @returns {Promise<RecruiterDto>}
 */
export function getRecruiter(id) {
  return request(`/api/v1/recruiters/${id}`);
}

/**
 * @param {number|string} id
 * @param {Partial<RecruiterDto>} body
 * @returns {Promise<RecruiterDto>}
 */
export function updateRecruiter(id, body) {
  return request(`/api/v1/recruiters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Get the recruiter profile for the authenticated user.
 * @returns {Promise<RecruiterDto>}
 */
export function getMyRecruiter() {
  return request('/api/v1/recruiters/me');
}

/**
 * Get a recruiter profile by auth user ID.
 * @param {number|string} userId
 * @returns {Promise<RecruiterDto>}
 */
export function getRecruiterByUserId(userId) {
  return request(`/api/v1/recruiters/user/${userId}`);
}

/**
 * Admin: list recruiters, optionally filtered by company.
 * @param {{ companyId?: number, page?: number, size?: number }} params
 * @returns {Promise<Page<RecruiterDto>>}
 */
export function listRecruiters({ companyId, page = 0, size = 20 } = {}) {
  return request(`/api/v1/recruiters${buildQuery({ companyId, page, size })}`);
}
