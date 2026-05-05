import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { listApplicationsForJob, updateApplicationStatus } from '../../../api/jobs';
import { notify } from '../../../utils/notifications';

const APPLICATION_STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

const STATUS_BADGE = {
  PENDING: '',
  REVIEWED: 'review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  HIRED: 'hired',
};

export default function CandidatesTab({ jobs = [], initialJobId = '' }) {
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialJobId) setSelectedJobId(String(initialJobId));
  }, [initialJobId]);

  useEffect(() => {
    if (!selectedJobId) { setApplications([]); return; }
    setLoading(true);
    listApplicationsForJob(selectedJobId, { size: 50 })
      .then((page) => setApplications(page.content ?? []))
      .catch(() => notify('Failed to load applications.', 'error'))
      .finally(() => setLoading(false));
  }, [selectedJobId]);

  const handleStatusUpdate = async (applicationId, status, recruiterNotes) => {
    try {
      const updated = await updateApplicationStatus(applicationId, { status, recruiterNotes });
      setApplications((prev) =>
        prev.map((a) => a.id === applicationId ? { ...a, status: updated.status ?? status, recruiterNotes: updated.recruiterNotes ?? recruiterNotes } : a)
      );
      notify('Application updated.', 'success');
    } catch {
      notify('Failed to update application.', 'error');
    }
  };

  const selectedJobTitle = jobs.find((j) => String(j.id) === String(selectedJobId))?.title ?? '';

  return (
    <DashboardSection title="Candidate Management">
      <div className="form-group" style={{ maxWidth: 360, marginBottom: 16 }}>
        <label>Filter by Job</label>
        <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
          <option value="">— Select a job —</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.status})
            </option>
          ))}
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
          <h4>No applications yet for {selectedJobTitle || 'this job'}</h4>
          <p className="muted">Share the job posting to attract candidates.</p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <>
          <p className="muted small" style={{ marginBottom: 12 }}>
            {applications.length} application{applications.length !== 1 ? 's' : ''} for {selectedJobTitle}
          </p>
          <div className="applied-jobs-list">
            {applications.map((app) => (
              <CandidateCard
                key={app.id}
                application={app}
                jobId={selectedJobId}
                jobTitle={selectedJobTitle}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </>
      )}
    </DashboardSection>
  );
}

function CandidateCard({ application, jobId, jobTitle, onStatusUpdate }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.recruiterNotes ?? '');
  const [showNotes, setShowNotes] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    await onStatusUpdate(application.id, status, notes || undefined);
    setSaving(false);
    setShowNotes(false);
  };

  const isDirty = status !== application.status || notes !== (application.recruiterNotes ?? '');

  return (
    <article className="applied-job-card candidate-card">
      <div className="candidate-card-main">
        <div className="app-header">
          <div>
            <h4>{application.candidateEmail || 'Applicant'}</h4>
            <p className="muted small">
              Applied {new Date(application.appliedAt ?? application.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`status-badge ${STATUS_BADGE[application.status] ?? ''}`}>
            {application.status}
          </span>
        </div>

        {/* Cover letter toggle */}
        {application.coverLetter && (
          <div style={{ marginTop: 8 }}>
            <button
              className="link-button"
              onClick={() => setShowCover((p) => !p)}
              type="button"
            >
              {showCover ? 'Hide cover letter' : 'Read cover letter'}
            </button>
            {showCover && (
              <blockquote className="cover-letter-text">{application.coverLetter}</blockquote>
            )}
          </div>
        )}

        {/* Existing recruiter notes */}
        {application.recruiterNotes && !showNotes && (
          <p className="muted small" style={{ marginTop: 6 }}>
            Note: {application.recruiterNotes}
          </p>
        )}
      </div>

      <div className="candidate-card-actions">
        {/* Status update */}
        <div className="candidate-status-row">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn-light small"
            onClick={() => setShowNotes((p) => !p)}
            type="button"
          >
            {showNotes ? 'Hide notes' : 'Add note'}
          </button>
        </div>

        {showNotes && (
          <textarea
            className="notes-textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add recruiter notes..."
          />
        )}

        {isDirty && (
          <button
            className="btn-dark small"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Update'}
          </button>
        )}

        {/* Schedule interview shortcut for relevant statuses */}
        {(application.status === 'SHORTLISTED' || application.status === 'REVIEWED') && (
          <button
            className="btn-light small"
            onClick={() =>
              navigate('/employer-schedule', {
                state: {
                  jobId,
                  jobTitle,
                  applicationId: application.id,
                  candidateId: application.candidateId,
                  candidateEmail: application.candidateEmail ?? '',
                },
              })
            }
          >
            Schedule Interview
          </button>
        )}
      </div>
    </article>
  );
}
