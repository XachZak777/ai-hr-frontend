import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle, Tabs } from '../../components/CommonBlocks';
import { listMyApplications, listSavedJobs, unsaveJob, getJob } from '../../api/jobs';
import { notify } from '../../utils/notifications';

const EXPERIENCE_LABEL = { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' };

function experienceLevelLabel(level) {
  return EXPERIENCE_LABEL[level] ?? '';
}

function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobMap, setJobMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Applied Jobs');

  useEffect(() => {
    Promise.all([
      listMyApplications({ size: 50 }),
      listSavedJobs({ size: 50 }),
    ])
      .then(async ([appsPage, savedPage]) => {
        const apps = appsPage.content ?? [];
        const saved = savedPage.content ?? [];
        setApplications(apps);
        setSavedJobs(saved);
        const allJobIds = [...new Set([...apps.map((a) => a.jobId), ...saved.map((s) => s.jobId)])];
        const jobResults = await Promise.allSettled(allJobIds.map((id) => getJob(id)));
        const map = {};
        allJobIds.forEach((id, idx) => {
          if (jobResults[idx].status === 'fulfilled') map[id] = jobResults[idx].value;
        });
        setJobMap(map);
      })
      .catch(() => notify('Failed to load jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveSavedJob = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
      notify('Saved job removed.', 'success');
    } catch {
      notify('Failed to remove saved job.', 'error');
    }
  };

  if (loading) {
    return (
      <main className="page dashboard">
        <PageTitle title="My Jobs" subtitle="Loading..." />
      </main>
    );
  }

  return (
    <main className="page dashboard">
      <PageTitle
        title="My Jobs"
        subtitle="Track jobs you have applied to"
        actions={<button className="btn-dark" onClick={() => navigate('/find-jobs')}>Find More Jobs</button>}
      />
      <Tabs tabs={['Applied Jobs', 'Saved Jobs']} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'Applied Jobs' && (
        <DashboardSection title="Applied Jobs">
          {applications.length > 0 ? (
            <div className="applied-jobs-list">
              {applications.map((app) => (
                <AppliedJobCard key={app.id} application={app} job={jobMap[app.jobId]} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No applied jobs yet"
              message="When you apply for a job, it will appear here with its application status."
              onAction={() => navigate('/find-jobs')}
              actionLabel="Browse Jobs"
            />
          )}
        </DashboardSection>
      )}
      {activeTab === 'Saved Jobs' && (
        <DashboardSection title="Saved Jobs">
          {savedJobs.length > 0 ? (
            <div className="applied-jobs-list">
              {savedJobs.map((saved) => (
                <SavedJobCard
                  key={saved.id}
                  saved={saved}
                  job={jobMap[saved.jobId]}
                  navigate={navigate}
                  onRemove={handleRemoveSavedJob}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved jobs yet"
              message="Save jobs from Find Jobs to compare and apply later."
              onAction={() => navigate('/find-jobs')}
              actionLabel="Browse Jobs"
            />
          )}
        </DashboardSection>
      )}
    </main>
  );
}

function SavedJobCard({ saved, job, navigate, onRemove }) {
  const title = job?.title ?? 'Job listing';
  const location = job?.location ?? '';
  const experience = experienceLevelLabel(job?.experienceLevel);
  const salary = formatSalary(job?.salaryMin, job?.salaryMax);

  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <h4>{title}</h4>
        </div>
        <div className="job-details">
          {location && <span className="detail">{location}</span>}
          {experience && <span className="detail">{experience}</span>}
          <span className="detail">{salary}/year</span>
        </div>
        {job?.description && <p className="muted">{job.description}</p>}
        <p className="muted small">Saved {new Date(saved.savedAt).toLocaleDateString()}</p>
      </div>
      <div className="job-actions">
        <button className="btn-dark small" onClick={() => navigate(`/apply/${saved.jobId}`, { state: { job } })}>Apply</button>
        <button className="btn-light small" onClick={() => onRemove(saved.jobId)}>Remove</button>
      </div>
    </article>
  );
}

function AppliedJobCard({ application, job }) {
  const [showWithdrawInfo, setShowWithdrawInfo] = useState(false);
  const title = job?.title ?? 'Job listing';
  const location = job?.location ?? '';
  const experience = experienceLevelLabel(job?.experienceLevel);
  const salary = formatSalary(job?.salaryMin, job?.salaryMax);

  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <h4>{title}</h4>
          <span className="status-badge review">{application.status}</span>
        </div>
        <div className="job-details">
          {location && <span className="detail">{location}</span>}
          {experience && <span className="detail">{experience}</span>}
          <span className="detail">{salary}/year</span>
        </div>
        {job?.description && <p className="job-description">{job.description}</p>}
        <p className="muted">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
        {application.recruiterNotes && <p className="muted">Note: {application.recruiterNotes}</p>}
      </div>
      <div className="job-actions">
        {showWithdrawInfo ? (
          <div className="confirm-actions">
            <span className="muted small">Contact support to withdraw applications.</span>
            <button className="btn-light small" onClick={() => setShowWithdrawInfo(false)}>Close</button>
          </div>
        ) : (
          <button className="btn-light small" onClick={() => setShowWithdrawInfo(true)}>Withdraw</button>
        )}
      </div>
    </article>
  );
}

function EmptyState({ title, message, onAction, actionLabel }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p className="muted">{message}</p>
      <button className="btn-dark" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}
