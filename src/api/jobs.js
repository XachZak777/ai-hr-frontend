import { request, buildQuery } from './client';

// ── Job CRUD ────────────────────────────────────────────────────────────────

/**
 * Recruiter: create a job in DRAFT status.
 * @param {JobRequest} body
 * @returns {Promise<JobResponse>} 201
 */
export function createJob(body) {
  return request('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Recruiter (owner): update a job.
 * @param {number|string} jobId
 * @param {Partial<JobRequest>} body
 * @returns {Promise<JobResponse>}
 */
export function updateJob(jobId, body) {
  return request(`/api/v1/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Recruiter (owner): transition job from DRAFT → OPEN.
 * @returns {Promise<JobResponse>}
 */
export function publishJob(jobId) {
  return request(`/api/v1/jobs/${jobId}/publish`, { method: 'POST' });
}

/**
 * Recruiter (owner): close a job (OPEN → CLOSED).
 * @returns {Promise<null>} 204 No Content
 */
export function closeJob(jobId) {
  return request(`/api/v1/jobs/${jobId}/close`, { method: 'POST' });
}

/**
 * @returns {Promise<JobResponse>}
 */
export function getJob(jobId) {
  return request(`/api/v1/jobs/${jobId}`);
}

/**
 * Public: list all OPEN jobs.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<JobResponse>>}
 */
export function listJobs({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs${buildQuery({ page, size })}`);
}

/**
 * Recruiter: list jobs posted by the authenticated recruiter.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<JobResponse>>}
 */
export function listMyJobs({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs/my${buildQuery({ page, size })}`);
}

/**
 * List all jobs for a specific company.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<JobResponse>>}
 */
export function listJobsByCompany(companyId, { page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs/company/${companyId}${buildQuery({ page, size })}`);
}

// ── Saved Jobs ──────────────────────────────────────────────────────────────

/**
 * Candidate: bookmark a job.
 * @returns {Promise<SavedJobResponse>} 201
 */
export function saveJob(jobId) {
  return request(`/api/v1/jobs/${jobId}/save`, { method: 'POST' });
}

/**
 * Candidate: remove a bookmarked job.
 * @returns {Promise<null>} 204 No Content
 */
export function unsaveJob(jobId) {
  return request(`/api/v1/jobs/${jobId}/save`, { method: 'DELETE' });
}

/**
 * Candidate: list bookmarked jobs.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<SavedJobResponse>>}
 */
export function listSavedJobs({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs/saved${buildQuery({ page, size })}`);
}

// ── Applications ────────────────────────────────────────────────────────────

/**
 * Candidate: submit an application.
 * @param {number|string} jobId
 * @param {{ coverLetter?: string }} body  — cover letter is optional
 * @returns {Promise<ApplicationResponse>} 201
 */
export function applyToJob(jobId, { coverLetter } = {}) {
  return request(`/api/v1/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter }),
  });
}

/**
 * Recruiter (owner): list all applications for a job.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<ApplicationResponse>>}
 */
export function listApplicationsForJob(jobId, { page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs/${jobId}/applications${buildQuery({ page, size })}`);
}

/**
 * Recruiter (owner): update an application's status and/or add notes.
 * @param {number|string} applicationId
 * @param {{ status: ApplicationStatus, recruiterNotes?: string }} body
 *   ApplicationStatus: PENDING | REVIEWED | SHORTLISTED | REJECTED | HIRED
 * @returns {Promise<ApplicationResponse>}
 */
export function updateApplicationStatus(applicationId, { status, recruiterNotes }) {
  return request(`/api/v1/jobs/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, recruiterNotes }),
  });
}

/**
 * Candidate: list the authenticated candidate's own applications.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<ApplicationResponse>>}
 */
export function listMyApplications({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/jobs/applications/my${buildQuery({ page, size })}`);
}
