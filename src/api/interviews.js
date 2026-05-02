import { request, buildQuery } from './client';

/**
 * Recruiter / Admin: schedule an AI-driven interview for an application.
 * @param {ScheduleInterviewRequest} body
 * @returns {Promise<InterviewDto>} 201
 */
export function scheduleInterview(body) {
  return request('/api/v1/interviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @returns {Promise<InterviewDto>}
 */
export function getInterview(id) {
  return request(`/api/v1/interviews/${id}`);
}

/**
 * Retrieve the full message history for an interview (candidate answers + AI turns).
 * @returns {Promise<InterviewMessageDto[]>}
 */
export function getInterviewMessages(id) {
  return request(`/api/v1/interviews/${id}/messages`);
}

/**
 * Candidate: submit an answer to the current AI question.
 * Returns the next AI question, or final score + feedback when complete.
 * @param {number|string} id  interview ID
 * @param {string} answer
 * @returns {Promise<AiTurnResponse>}
 *   AiTurnResponse: { aiMessage, interviewComplete, score, feedback }
 *   When interviewComplete is true, score (0–100) and feedback are populated.
 */
export function answerInterview(id, answer) {
  return request(`/api/v1/interviews/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
}

/**
 * Candidate: list the authenticated candidate's own interviews.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<InterviewDto>>}
 */
export function listMyInterviews({ page = 0, size = 20 } = {}) {
  return request(`/api/v1/interviews/my${buildQuery({ page, size })}`);
}

/**
 * Recruiter / Admin: list all interviews for a specific job.
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<Page<InterviewDto>>}
 */
export function listInterviewsByJob(jobId, { page = 0, size = 20 } = {}) {
  return request(`/api/v1/interviews/job/${jobId}${buildQuery({ page, size })}`);
}
