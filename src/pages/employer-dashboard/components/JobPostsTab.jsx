import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { closeJob } from '../../../api/jobs';

const EXPERIENCE_LABEL = { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' };

function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

export default function JobPostsTab({ jobs, onJobPosted }) {
  const navigate = useNavigate();

  return (
    <DashboardSection title="Manage Job Posts">
      <div className="jobs-management">
        <button className="btn-dark" onClick={() => navigate('/post-new-job')}>+ Post New Job</button>
        <PostedJobsList jobs={jobs} />
      </div>
    </DashboardSection>
  );
}

function PostedJobsList({ jobs }) {
  const [closedIds, setClosedIds] = useState([]);

  const handleClose = async (job) => {
    try {
      await closeJob(job.id);
      setClosedIds((prev) => [...prev, job.id]);
      notify(`${job.title} closed.`, 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to close job.', 'error');
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
    <div className="jobs-list">
      <h4>Your Posted Jobs</h4>
      {jobs.map((job) => {
        const isClosed = closedIds.includes(job.id) || job.status === 'CLOSED';
        return (
          <div key={job.id} className="job-item">
            <h5>{job.title}</h5>
            <p className="muted">
              {EXPERIENCE_LABEL[job.experienceLevel] ?? ''} · {job.location ?? ''} · {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
            <p className="muted small">Status: {isClosed ? 'CLOSED' : job.status} · Posted {new Date(job.createdAt).toLocaleDateString()}</p>
            <div className="job-actions">
              {!isClosed && (
                <button className="btn-light small" onClick={() => handleClose(job)}>Close</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
