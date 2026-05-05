import { request, buildQuery } from './client';

/**
 * Create a candidate profile for the authenticated user.
 * @param {CandidateDto} body
 * @returns {Promise<CandidateDto>}
 */
export function createCandidate(body) {
  return request('/api/v1/candidates', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @returns {Promise<CandidateDto>}
 */
export function getCandidate(id) {
  return request(`/api/v1/candidates/${id}`);
}

/**
 * Get the candidate profile for the authenticated user.
 * @returns {Promise<CandidateDto>}
 */
export function getMyCandidate() {
  return request('/api/v1/candidates/me');
}

/**
 * @param {number|string} id
 * @param {Partial<CandidateDto>} body
 * @returns {Promise<CandidateDto>}
 */
export function updateCandidate(id, body) {
  return request(`/api/v1/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Recruiter / Admin: search candidates by skills and/or location.
 * @param {{ skills?: string[], location?: string, page?: number, size?: number }} params
 * @returns {Promise<Page<CandidateDto>>}
 */
export function listCandidates({ skills, location, page = 0, size = 20 } = {}) {
  return request(`/api/v1/candidates${buildQuery({
    skills: skills?.length ? skills.join(',') : undefined,
    location: location || undefined,
    page,
    size,
  })}`);
}

// ── CV ─────────────────────────────────────────────────────────────────────

/**
 * Create or fully replace the authenticated candidate's structured CV.
 * @param {{ summary?: string, workExperiences?: object[], educations?: object[], certifications?: object[], languages?: object[] }} body
 * @returns {Promise<CvResponse>}
 */
export function updateCv(body) {
  return request('/api/v1/candidates/cv', { method: 'PUT', body: JSON.stringify(body) });
}

/**
 * @returns {Promise<CvResponse>}
 */
export function getMyCv() {
  return request('/api/v1/candidates/cv');
}

/**
 * Recruiter / Admin: fetch CV by candidate profile ID.
 * @returns {Promise<CvResponse>}
 */
export function getCvByCandidate(candidateProfileId) {
  return request(`/api/v1/candidates/cv/${candidateProfileId}`);
}

/**
 * Recruiter / Admin: fetch CV by candidate auth user ID.
 * @returns {Promise<CvResponse>}
 */
export function getCvByUserId(candidateUserId) {
  return request(`/api/v1/candidates/cv/user/${candidateUserId}`);
}
