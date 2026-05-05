import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

export default function OverviewTab({ applications, profileCompletion, loading, setActiveTab }) {
  const navigate = useNavigate();

  return (
    <>
      <DashboardSection>
        <div className="overview-grid">
          <div className="profile-completion">
            <h3>Profile Completion</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="muted">{profileCompletion}% complete</p>
            <button className="btn-light" onClick={() => navigate('/profile')}>Complete Profile</button>
          </div>
          <div className="quick-stats">
            <h3>Activity</h3>
            <ul className="quick-list">
              <li><strong>{applications.length}</strong> active application{applications.length !== 1 ? 's' : ''}</li>
              <li><strong>{applications.filter((a) => a.status === 'SHORTLISTED').length}</strong> shortlisted</li>
              <li><strong>{applications.filter((a) => a.status === 'HIRED').length}</strong> hired</li>
            </ul>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Recent Applications">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <RecentApplications applications={applications} onViewAll={() => setActiveTab('Applications')} />
        )}
      </DashboardSection>
    </>
  );
}

function RecentApplications({ applications, onViewAll }) {
  if (applications.length === 0) {
    return (
      <div className="empty-state compact-empty">
        <h4>No applications yet</h4>
        <p className="muted">Apply to a job and it will appear here automatically.</p>
      </div>
    );
  }

  return (
    <>
      <div className="applications-list">
        {applications.slice(0, 3).map((app) => <ApplicationCard key={app.id} app={app} />)}
      </div>
      {applications.length > 3 && (
        <button className="view-all link-button" style={{ marginTop: 12 }} onClick={onViewAll}>
          View all {applications.length} applications →
        </button>
      )}
    </>
  );
}

const STATUS_BADGE = {
  PENDING: '',
  REVIEWED: 'review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  HIRED: 'hired',
};

function ApplicationCard({ app }) {
  return (
    <div className="application-card">
      <div className="app-header">
        <div>
          <h4>Job #{app.jobId}</h4>
          <p className="muted small">{new Date(app.appliedAt).toLocaleDateString()}</p>
        </div>
        <span className={`status-badge ${STATUS_BADGE[app.status] ?? ''}`}>{app.status}</span>
      </div>
    </div>
  );
}
