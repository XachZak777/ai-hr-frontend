const SAVED_JOBS_KEY = 'hireai_saved_jobs';

export function getSavedJobs() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveJob(job) {
  const savedJobs = getSavedJobs();
  const nextJobs = [job, ...savedJobs.filter((item) => item.id !== job.id)];
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(nextJobs));
  return nextJobs;
}

export function removeSavedJob(jobId) {
  const nextJobs = getSavedJobs().filter((item) => item.id !== jobId);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(nextJobs));
  return nextJobs;
}
