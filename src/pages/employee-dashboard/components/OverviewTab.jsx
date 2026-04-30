import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { saveJob } from '../../../utils/savedJobs';
import { allJobs } from '../../../data/jobs';

export default function OverviewTab({ applications, profileCompletion, recommendedJobs, setActiveTab }) {
  const navigate = useNavigate();

  return (
    <>
      <DashboardSection>
        <OverviewGrid applications={applications} profileCompletion={profileCompletion} navigate={navigate} />
      </DashboardSection>
      <DashboardSection title="Recent Applications">
        <RecentApplications applications={applications} onViewAll={() => setActiveTab('Applications')} />
      </DashboardSection>
      <DashboardSection title="Recommended Positions for You">
        <RecommendedJobs jobs={recommendedJobs} navigate={navigate} />
      </DashboardSection>
    </>
  );
}

function OverviewGrid({ applications, profileCompletion, navigate }) {
  const activeApplications = applications.filter((app) => app.status !== 'Withdrawn').length;

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
          <li>👷 <strong>{activeApplications} active applications</strong> currently tracked</li>
          <li>🎯 <strong>{allJobs.length} job matches</strong> available today</li>
          <li>💬 <strong>2 messages</strong> from recruiters</li>
          <li>⭐ <strong>{profileCompletion}% profile completion</strong> improves match quality</li>
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
          <h4>{app.company}</h4>
          <p className="muted">{app.jobTitle}</p>
        </div>
        <span className="status-badge review">{app.status}</span>
      </div>
      <div className="app-footer">
        <span className="accent">{app.matchScore ? `Match: ${app.matchScore}%` : 'Application submitted'}</span>
        <span className="muted">{app.appliedAt}</span>
      </div>
    </div>
  );
}

function RecommendedJobs({ jobs, navigate }) {
  return (
    <div className="recommended-jobs">
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="job-info">
            <h4>{job.position}</h4>
            <p className="company">{job.company}</p>
            <p className="salary">{job.salary}/year</p>
          </div>
          <div className="job-actions">
            <span className="match-score">{job.matchScore} match</span>
            <button className="btn-dark" onClick={() => applyToJob(job, navigate)}>Apply Now</button>
            <button className="btn-light" onClick={() => { saveJob(job); notify(`${job.position} saved to your jobs.`, 'success'); }}>Save</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function applyToJob(job, navigate) {
  const fullJob = allJobs.find((item) => item.id === job.id) || {
    id: job.id,
    title: job.position,
    company: job.company,
    location: 'Yerevan',
    experience: 'Mid',
    salary: job.salary,
    matchScore: Number.parseInt(job.matchScore, 10) || 90,
    description: 'Complete your application for this recommended position.',
  };
  navigate(`/apply/${fullJob.id}`, { state: { job: fullJob } });
}
