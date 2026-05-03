import { useEffect, useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { listApplicationsForJob, updateApplicationStatus } from '../../../api/jobs';
import { notify } from '../../../utils/notifications';

const APPLICATION_STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

export default function CandidatesTab({ jobs = [] }) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedJobId) { setApplications([]); return; }
    setLoading(true);
    listApplicationsForJob(selectedJobId, { size: 50 })
      .then((page) => setApplications(page.content ?? []))
      .catch(() => notify('Failed to load applications.', 'error'))
      .finally(() => setLoading(false));
  }, [selectedJobId]);

  const handleStatusChange = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, { status });
      setApplications((prev) => prev.map((a) => a.id === applicationId ? { ...a, status } : a));
      notify('Application status updated.', 'success');
    } catch {
      notify('Failed to update status.', 'error');
    }
  };

  return (
    <DashboardSection title="Candidate Management">
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 16 }}>
        <label>Filter by Job</label>
        <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
          <option value="">— Select a job —</option>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </select>
      </div>
      {loading && <p className="muted">Loading candidates...</p>}
      {!loading && !selectedJobId && (
        <div className="empty-state">
          <h4>Select a job to view candidates</h4>
          <p className="muted">Candidates who apply to your jobs will appear here.</p>
        </div>
      )}
      {!loading && selectedJobId && applications.length === 0 && (
        <div className="empty-state">
          <h4>No applications yet</h4>
          <p className="muted">Candidates who apply to this job will appear here.</p>
        </div>
      )}
      {!loading && applications.length > 0 && (
        <div className="applied-jobs-list">
          {applications.map((app) => (
            <CandidateCard key={app.id} application={app} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function CandidateCard({ application, onStatusChange }) {
  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <h4>Application #{application.id}</h4>
          <span className="status-badge review">{application.status}</span>
        </div>
        <p className="muted small">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
        {application.recruiterNotes && <p className="muted">Note: {application.recruiterNotes}</p>}
      </div>
      <div className="job-actions">
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value)}
        >
          {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </article>
  );
}
