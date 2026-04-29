const APPLICATIONS_KEY = 'hireai_applied_jobs';

export function getAppliedJobs() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveAppliedJob(application) {
  const currentApplications = getAppliedJobs();
  const nextApplications = [
    application,
    ...currentApplications.filter((item) => item.id !== application.id),
  ];

  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(nextApplications));
  return nextApplications;
}

export function removeAppliedJob(applicationId) {
  const nextApplications = getAppliedJobs().filter((item) => item.id !== applicationId);
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(nextApplications));
  return nextApplications;
}
