import { request, buildQuery } from './client';

/**
 * Create a new company. Recruiters can create a company they will manage.
 * @param {CompanyDto} body
 * @returns {Promise<CompanyDto>}
 */
export function createCompany(body) {
  return request('/api/v1/companies', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @returns {Promise<CompanyDto>}
 */
export function getCompany(id) {
  return request(`/api/v1/companies/${id}`);
}

/**
 * Admin: update a company.
 * @param {number|string} id
 * @param {Partial<CompanyDto>} body
 * @returns {Promise<CompanyDto>}
 */
export function updateCompany(id, body) {
  return request(`/api/v1/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * SUPER_ADMIN: permanently delete a company.
 * @returns {Promise<null>} 204 No Content
 */
export function deleteCompany(id) {
  return request(`/api/v1/companies/${id}`, { method: 'DELETE' });
}

/**
 * Get the company owned by the authenticated recruiter.
 * @returns {Promise<CompanyDto>}
 */
export function getMyCompany() {
  return request('/api/v1/companies/my');
}

/**
 * Paginated list of all companies.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<CompanyDto>>}
 */
export function listCompanies({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/companies${buildQuery({ page, size })}`);
}
