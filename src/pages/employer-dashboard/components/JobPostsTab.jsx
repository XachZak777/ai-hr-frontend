import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { publishJob, closeJob } from '../../../api/jobs';

const EXPERIENCE_LABEL = { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' };

function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

export default function JobPostsTab({ jobs, onJobsChange, onViewApplicants }) {
  const navigate = useNavigate();

  return (
    <DashboardSection title="Manage Job Posts">
      <div style={{ marginBottom: 20 }}>
        <button className="btn-dark" onClick={() => navigate('/post-new-job')}>+ Post New Job</button>
      </div>
      <PostedJobsList
        jobs={jobs}
        onJobsChange={onJobsChange}
        onViewApplicants={onViewApplicants}
      />
    </DashboardSection>
  );
}

function PostedJobsList({ jobs, onJobsChange, onViewApplicants }) {
  const navigate = useNavigate();
  const [busyIds, setBusyIds] = useState(new Set());

  const setJobBusy = (id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      busy ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handlePublish = async (job) => {
    setJobBusy(job.id, true);
    try {
      const updated = await publishJob(job.id);
      onJobsChange((prev) => prev.map((j) => j.id === job.id ? { ...j, status: updated.status ?? 'OPEN' } : j));
      notify(`${job.title} is now published and accepting applications.`, 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to publish job.', 'error');
    } finally {
      setJobBusy(job.id, false);
    }
  };

  const handleClose = async (job) => {
    setJobBusy(job.id, true);
    try {
      await closeJob(job.id);
      onJobsChange((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'CLOSED' } : j));
      notify(`${job.title} has been closed.`, 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to close job.', 'error');
    } finally {
      setJobBusy(job.id, false);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <h4>No jobs posted yet</h4>
        <p className="muted">Use the button above to post your first job.</p>
      </div>
    );
  }

  return (
    <div>
      {jobs.map((job) => {
        const busy = busyIds.has(job.id);
        const isDraft = job.status === 'DRAFT';
        const isOpen = job.status === 'OPEN';
        const isClosed = job.status === 'CLOSED';
        const experience = EXPERIENCE_LABEL[job.experienceLevel] ?? '';
        const salary = formatSalary(job.salaryMin, job.salaryMax);

        return (
          <div key={job.id} className="job-item">
            <div className="job-item-header">
              <div>
                <h5>{job.title}</h5>
                <p className="muted">
                  {[experience, job.location, salary].filter(Boolean).join(' · ')}
                </p>
                <p className="muted small">
                  <span className={`status-badge ${isOpen ? 'review' : ''}`}>{job.status}</span>
                  {' '}· Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="job-actions">
              {isDraft && (
                <button
                  className="btn-dark small"
                  onClick={() => handlePublish(job)}
                  disabled={busy}
                >
                  {busy ? 'Publishing...' : 'Publish'}
                </button>
              )}
              {isOpen && (
                <>
                  <button
                    className="btn-light small"
                    onClick={() => onViewApplicants(job.id)}
                  >
                    View Applicants
                  </button>
                  <button
                    className="btn-light small"
                    onClick={() => navigate('/employer-schedule', { state: { jobId: job.id, jobTitle: job.title } })}
                  >
                    Schedule Interview
                  </button>
                  <button
                    className="btn-light small"
                    onClick={() => handleClose(job)}
                    disabled={busy}
                  >
                    {busy ? '...' : 'Close'}
                  </button>
                </>
              )}
              {isClosed && (
                <span className="muted small">Closed — no further actions</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
