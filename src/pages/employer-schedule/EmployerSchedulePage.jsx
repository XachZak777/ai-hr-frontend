import { useEffect, useState } from 'react';
import { DashboardSection, PageTitle, QuickStatsRow } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { listMyJobs, listApplicationsForJob } from '../../api/jobs';
import { scheduleInterview, listInterviewsByJob } from '../../api/interviews';

export default function EmployerSchedulePage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ applicationId: '', scheduledAt: '', durationMinutes: 45 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => setJobs(page.content ?? []))
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!selectedJobId) nextErrors.job = 'Select a job first';
    if (!formData.applicationId) nextErrors.applicationId = 'Select an application';
    if (!formData.scheduledAt) nextErrors.scheduledAt = 'Date and time are required';
    if (!formData.durationMinutes || Number(formData.durationMinutes) < 1) nextErrors.durationMinutes = 'Enter a valid duration';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const selectedApp = applications.find((a) => String(a.id) === String(formData.applicationId));
    if (!selectedApp) { notify('Selected application not found.', 'error'); return; }

    setSubmitting(true);
    try {
      const created = await scheduleInterview({
        applicationId: Number(formData.applicationId),
        candidateId: selectedApp.candidateId,
        jobId: Number(selectedJobId),
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
      });
      setInterviews((prev) => [created, ...prev]);
      setFormData({ applicationId: '', scheduledAt: '', durationMinutes: 45 });
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
                onChange={(e) => updateField('applicationId', e.target.value)}
                className={errors.applicationId ? 'input-error' : ''}
              >
                <option value="">— Select applicant —</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    Application #{app.id} — {app.status}
                  </option>
                ))}
              </select>
              {errors.applicationId && <span className="error-text">{errors.applicationId}</span>}
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
              <InterviewCard key={interview.id} interview={interview} />
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

function InterviewCard({ interview }) {
  const scheduledAt = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString()
    : 'TBD';
  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <h4>Interview #{interview.id}</h4>
          <span className="status-badge review">{interview.status}</span>
        </div>
        <div className="job-details">
          <span className="detail">{scheduledAt}</span>
          {interview.durationMinutes && <span className="detail">{interview.durationMinutes} min</span>}
        </div>
        <p className="muted small">Application #{interview.applicationId}</p>
      </div>
    </article>
  );
}
