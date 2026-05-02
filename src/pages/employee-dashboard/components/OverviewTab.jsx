import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

export default function OverviewTab({ applications, profileCompletion, loading, setActiveTab }) {
  const navigate = useNavigate();

  return (
    <>
      <DashboardSection>
        <OverviewGrid
          applications={applications}
          profileCompletion={profileCompletion}
          navigate={navigate}
        />
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

function OverviewGrid({ applications, profileCompletion, navigate }) {
  return (
    <div className="overview-grid">
      <div className="profile-completion">
        <h3>Profile Completion</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <p className="muted">{profileCompletion}% complete</p>
        <button className="btn-light" onClick={() => navigate('/profile')}>Complete Profile</button>
      </div>
      <div className="quick-stats">
        <h3>Your Opportunities</h3>
        <ul className="quick-list">
          <li><strong>{applications.length} active applications</strong> currently tracked</li>
          <li><strong>{profileCompletion}% profile completion</strong> improves match quality</li>
        </ul>
      </div>
    </div>
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
        <button className="view-all link-button" onClick={onViewAll}>
          View all {applications.length} applications →
        </button>
      )}
    </>
  );
}

function ApplicationCard({ app }) {
  return (
    <div className="application-card">
      <div className="app-header">
        <div>
          <h4>Job #{app.jobId}</h4>
          <p className="muted">Application ID: {app.id}</p>
        </div>
        <span className="status-badge review">{app.status}</span>
      </div>
      <div className="app-footer">
        <span className="muted">{new Date(app.appliedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
