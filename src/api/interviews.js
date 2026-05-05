import { request, buildQuery } from './client';

/**
 * Recruiter: schedule an AI-driven interview for an application.
 * @param {ScheduleInterviewRequest} body — must include candidateEmail (auth user email)
 * @param {string} [jobTitle] — appended as ?jobTitle= query param
 * @returns {Promise<InterviewDto>} 201
 */
export function scheduleInterview(body, jobTitle) {
  const qs = jobTitle ? `?jobTitle=${encodeURIComponent(jobTitle)}` : '';
  return request(`/api/v1/interviews${qs}`, {
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
 * Candidate: start a scheduled text interview — transitions it to IN_PROGRESS.
 * @param {number|string} id
 * @returns {Promise<AiTurnResponse>} { aiMessage, interviewComplete, score, feedback }
 */
export function startInterview(id) {
  return request(`/api/v1/interviews/${id}/start`, { method: 'POST' });
}

/**
 * Candidate: submit a text answer to the current AI question.
 * @param {number|string} id
 * @param {string} answer
 * @param {string} [jobTitle] — appended as ?jobTitle= query param
 * @returns {Promise<AiTurnResponse>} { aiMessage, interviewComplete, score, feedback }
 */
export function answerInterview(id, answer, jobTitle) {
  const qs = jobTitle ? `?jobTitle=${encodeURIComponent(jobTitle)}` : '';
  return request(`/api/v1/interviews/${id}/answer${qs}`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
}

/**
 * Candidate: start a scheduled voice interview.
 * Returns the initial AI audio as base64 along with the text transcript.
 * @param {number|string} id
 * @returns {Promise<VoiceTurnResponse>}
 *   { aiMessage, audioBase64, audioContentType, interviewComplete, score, feedback, transcript }
 */
export function startVoiceInterview(id) {
  return request(`/api/v1/interviews/${id}/voice/start`, { method: 'POST' });
}

/**
 * Candidate: submit an audio answer for a voice interview.
 * Sends multipart/form-data with the audio blob; receives the next AI audio + message.
 * @param {number|string} id
 * @param {Blob} audioBlob — recorded audio from MediaRecorder
 * @param {string} [jobTitle] — appended as ?jobTitle= query param
 * @returns {Promise<VoiceTurnResponse>}
 */
export function answerVoiceInterview(id, audioBlob, jobTitle) {
  const form = new FormData();
  form.append('audio', audioBlob, 'answer.webm');
  const qs = jobTitle ? `?jobTitle=${encodeURIComponent(jobTitle)}` : '';
  return request(`/api/v1/interviews/${id}/voice/answer${qs}`, {
    method: 'POST',
    body: form,
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
