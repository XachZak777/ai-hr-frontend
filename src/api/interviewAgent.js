import { request } from './client';

/**
 * Retrieve full interview context: status, candidate profile snapshot,
 * transcript, and final decision (when complete).
 * @param {string|number} interviewId
 * @returns {Promise<InterviewContextDto>}
 */
export function getInterviewContext(interviewId) {
  return request(`/api/v1/agent/interviews/${interviewId}`);
}

/**
 * Initiate the interview — triggers the AI greeting turn.
 * Context must be in READY state; transitions it to IN_PROGRESS.
 * @param {string|number} interviewId
 * @returns {Promise<AgentMessageResponse>}
 */
export function startInterview(interviewId) {
  return request(`/api/v1/agent/interviews/${interviewId}/start`, {
    method: 'POST',
  });
}

/**
 * Submit a candidate answer and receive the AI's next question
 * or the final decision when the interview is complete.
 * @param {string|number} interviewId
 * @param {string} message  candidate's answer text
 * @returns {Promise<AgentMessageResponse>}
 *   AgentMessageResponse: { reply, complete, decision? }
 *   decision: { score, recommendation: 'HIRE'|'CONSIDER'|'REJECT', feedback, decidedAt }
 */
export function sendInterviewMessage(interviewId, message) {
  return request(`/api/v1/agent/interviews/${interviewId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Retrieve a formatted text summary of the candidate's profile
 * as compiled by the agent during context initialization.
 * @param {string|number} interviewId
 * @returns {Promise<string>}
 */
export function getCandidateSummary(interviewId) {
  return request(`/api/v1/agent/interviews/${interviewId}/candidate-summary`);
}
