import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardSection, PageTitle, QuickStatsRow } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { listMyJobs, listApplicationsForJob } from '../../api/jobs';
import { scheduleInterview, listInterviewsByJob } from '../../api/interviews';

export default function EmployerSchedulePage() {
  const { state: navState } = useLocation();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    candidateEmail: '',
    scheduledAt: '',
    durationMinutes: 45,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => {
        const list = page.content ?? [];
        setJobs(list);
        // Pre-select job if navigated from CandidatesTab or JobPostsTab
        if (navState?.jobId) {
          setSelectedJobId(String(navState.jobId));
          if (navState.applicationId || navState.candidateEmail) {
            setFormData((prev) => ({
              ...prev,
              applicationId: navState.applicationId ? String(navState.applicationId) : prev.applicationId,
              candidateEmail: navState.candidateEmail ?? prev.candidateEmail,
            }));
            setShowForm(true);
          }
        }
      })
      .catch(() => notify('Failed to load jobs.', 'error'));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setApplications([]); setInterviews([]); return; }
    setLoadingData(true);
    Promise.all([
      listApplicationsForJob(selectedJobId, { size: 50 }),
      listInterviewsByJob(selectedJobId, { size: 50 }),
    ])
      .then(([appsPage, interviewsPage]) => {
        setApplications(appsPage.content ?? []);
        setInterviews(interviewsPage.content ?? []);
      })
      .catch(() => notify('Failed to load interview data.', 'error'))
      .finally(() => setLoadingData(false));
  }, [selectedJobId]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleApplicationSelect = (applicationId) => {
    updateField('applicationId', applicationId);
    const app = applications.find((a) => String(a.id) === String(applicationId));
    if (app?.candidateEmail) {
      setFormData((prev) => ({ ...prev, applicationId, candidateEmail: app.candidateEmail }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!selectedJobId) nextErrors.job = 'Select a job first';
    if (!formData.applicationId) nextErrors.applicationId = 'Select an application';
    if (!formData.candidateEmail.trim()) nextErrors.candidateEmail = 'Candidate email is required';
    if (!formData.scheduledAt) nextErrors.scheduledAt = 'Date and time are required';
    if (!formData.durationMinutes || Number(formData.durationMinutes) < 1) nextErrors.durationMinutes = 'Enter a valid duration';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const selectedApp = applications.find((a) => String(a.id) === String(formData.applicationId));
    if (!selectedApp) { notify('Selected application not found.', 'error'); return; }

    const selectedJob = jobs.find((j) => String(j.id) === String(selectedJobId));

    setSubmitting(true);
    try {
      const created = await scheduleInterview(
        {
          applicationId: Number(formData.applicationId),
          candidateId: selectedApp.candidateId,
          candidateEmail: formData.candidateEmail.trim(),
          jobId: Number(selectedJobId),
          scheduledAt: new Date(formData.scheduledAt).toISOString().replace(/\.\d{3}Z$/, ''),
          durationMinutes: Number(formData.durationMinutes),
        },
        selectedJob?.title,
      );
      setInterviews((prev) => [created, ...prev]);
      setFormData({ applicationId: '', candidateEmail: '', scheduledAt: '', durationMinutes: 45 });
      setShowForm(false);
      setErrors({});
      notify('Interview scheduled successfully.', 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to schedule interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: 'Total Interviews', count: interviews.length },
    { label: 'Upcoming', count: interviews.filter((i) => i.status !== 'COMPLETED' && i.status !== 'CANCELLED').length },
    { label: 'Completed', count: interviews.filter((i) => i.status === 'COMPLETED').length },
    { label: 'Applications', count: applications.length },
  ];

  return (
    <main className="page dashboard">
      <PageTitle
        title="Interview Schedule"
        subtitle="Manage and schedule interviews for your job posts"
        actions={
          <button className="btn-dark" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cancel' : '+ Schedule Interview'}
          </button>
        }
      />
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 16 }}>
        <label>Select Job</label>
        <select
          value={selectedJobId}
          onChange={(e) => { setSelectedJobId(e.target.value); setShowForm(false); setErrors({}); }}
        >
          <option value="">— Choose a job —</option>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </select>
        {errors.job && <span className="error-text">{errors.job}</span>}
      </div>

      {selectedJobId && <QuickStatsRow items={stats} />}

      {showForm && (
        <DashboardSection title="Schedule Interview">
          <form className="settings-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Application</label>
              <select
                value={formData.applicationId}
                onChange={(e) => handleApplicationSelect(e.target.value)}
                className={errors.applicationId ? 'input-error' : ''}
              >
                <option value="">— Select applicant —</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidateEmail || `Applicant ${app.id}`} — {app.status}
                  </option>
                ))}
              </select>
              {errors.applicationId && <span className="error-text">{errors.applicationId}</span>}
            </div>
            <div className="form-group">
              <label>Candidate Email</label>
              <input
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => updateField('candidateEmail', e.target.value)}
                placeholder="candidate@example.com"
                className={errors.candidateEmail ? 'input-error' : ''}
              />
              {errors.candidateEmail && <span className="error-text">{errors.candidateEmail}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => updateField('scheduledAt', e.target.value)}
                  className={errors.scheduledAt ? 'input-error' : ''}
                />
                {errors.scheduledAt && <span className="error-text">{errors.scheduledAt}</span>}
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.durationMinutes}
                  onChange={(e) => updateField('durationMinutes', e.target.value)}
                  className={errors.durationMinutes ? 'input-error' : ''}
                />
                {errors.durationMinutes && <span className="error-text">{errors.durationMinutes}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-dark" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button type="button" className="btn-light" onClick={() => { setShowForm(false); setErrors({}); }}>
                Cancel
              </button>
            </div>
          </form>
        </DashboardSection>
      )}

      {loadingData && <p className="muted">Loading...</p>}

      {!loadingData && selectedJobId && interviews.length > 0 && (
        <DashboardSection title="Scheduled Interviews">
          <div className="applied-jobs-list">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                jobTitle={jobs.find((j) => String(j.id) === String(selectedJobId))?.title}
                applications={applications}
              />
            ))}
          </div>
        </DashboardSection>
      )}

      {!loadingData && selectedJobId && interviews.length === 0 && !showForm && (
        <div className="empty-state">
          <h4>No interviews scheduled for this job</h4>
          <p className="muted">Use the button above to schedule an interview with an applicant.</p>
        </div>
      )}

      {!selectedJobId && (
        <div className="empty-state">
          <h4>Select a job to manage interviews</h4>
          <p className="muted">Choose one of your posted jobs to view or schedule interviews.</p>
        </div>
      )}
    </main>
  );
}

const INTERVIEW_STATUS_BADGE = {
  SCHEDULED: 'new',
  IN_PROGRESS: 'interviewing',
  COMPLETED: 'active',
  CANCELLED: 'rejected',
};

function InterviewCard({ interview, jobTitle, applications }) {
  const scheduledAt = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString()
    : 'TBD';
  const candidateEmail = applications.find((a) => String(a.id) === String(interview.applicationId))?.candidateEmail;
  const badgeClass = INTERVIEW_STATUS_BADGE[interview.status] ?? '';

  return (
    <article className="applied-job-card">
      <div className="app-header">
        <div>
          <h4>{jobTitle ?? 'Interview'}</h4>
          {candidateEmail && <p className="muted small">{candidateEmail}</p>}
        </div>
        <span className={`status-badge ${badgeClass}`}>{interview.status}</span>
      </div>
      <div className="job-details">
        <span className="detail">{scheduledAt}</span>
        {interview.durationMinutes && <span className="detail">{interview.durationMinutes} min</span>}
      </div>
    </article>
  );
}
