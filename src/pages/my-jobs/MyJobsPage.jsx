import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle, Tabs } from '../../components/CommonBlocks';
import { getAppliedJobs, removeAppliedJob } from '../../utils/applications';
import { notify } from '../../utils/notifications';
import { getSavedJobs, removeSavedJob } from '../../utils/savedJobs';
import { allJobs } from '../../data/jobs';

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('Applied Jobs');

  useEffect(() => {
    setApplications(getAppliedJobs());
    setSavedJobs(getSavedJobs());
  }, []);

  const handleWithdraw = (applicationId) => {
    setApplications(removeAppliedJob(applicationId));
    notify('Application withdrawn.', 'success');
  };

  const handleRemoveSavedJob = (jobId) => {
    setSavedJobs(removeSavedJob(jobId));
    notify('Saved job removed.', 'success');
  };

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
              {applications.map((application) => (
                <AppliedJobCard key={application.id} application={application} onWithdraw={handleWithdraw} />
              ))}
            </div>
          ) : (
            <EmptyJobsState onFindJobs={() => navigate('/find-jobs')} />
          )}
        </DashboardSection>
      )}
      {activeTab === 'Saved Jobs' && (
        <DashboardSection title="Saved Jobs">
          {savedJobs.length > 0 ? (
            <div className="applied-jobs-list">
              {savedJobs.map((job) => (
                <SavedJobCard key={job.id} job={job} navigate={navigate} onRemove={handleRemoveSavedJob} />
              ))}
            </div>
          ) : (
            <EmptySavedJobsState onFindJobs={() => navigate('/find-jobs')} />
          )}
        </DashboardSection>
      )}
    </main>
  );
}

function SavedJobCard({ job, navigate, onRemove }) {
  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <div>
            <h4>{job.title}</h4>
            <p className="company">{job.company}</p>
          </div>
          <span className="match-score">{job.matchScore}% match</span>
        </div>
        <div className="job-details">
          <span className="detail">📍 {job.location}</span>
          <span className="detail">🎯 {job.experience}</span>
          <span className="detail">💰 {job.salary}/year</span>
        </div>
        <p className="muted">{job.description}</p>
      </div>
      <div className="job-actions">
        <button className="btn-dark small" onClick={() => navigate(`/apply/${job.id}`, { state: { job } })}>Apply</button>
        <button className="btn-light small" onClick={() => onRemove(job.id)}>Remove</button>
      </div>
    </article>
  );
}

function AppliedJobCard({ application, onWithdraw }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const jobDescription = application.description || allJobs.find((job) => String(job.id) === String(application.jobId || application.id))?.description;

  return (
    <article className="applied-job-card">
      <div>
        <div className="app-header">
          <div>
            <h4>{application.jobTitle}</h4>
            <p className="company">{application.company}</p>
          </div>
          <span className="status-badge review">{application.status}</span>
        </div>
        <div className="job-details">
          <span className="detail">📍 {application.location}</span>
          <span className="detail">🎯 {application.experience}</span>
          <span className="detail">💰 {application.salary}/year</span>
        </div>
        {jobDescription && <p className="job-description">{jobDescription}</p>}
        <p className="muted">Applied on {application.appliedAt}</p>
        <p className="muted">CV: {application.cvName}</p>
      </div>
      <div className="job-actions">
        <button className="btn-light small" onClick={() => notify(`Application details for ${application.jobTitle}.`)}>Details</button>
        {showConfirm ? (
          <div className="confirm-actions">
            <span className="muted small">Withdraw?</span>
            <button className="btn-light small" onClick={() => setShowConfirm(false)}>Cancel</button>
            <button className="btn-dark small" onClick={() => onWithdraw(application.id)}>Confirm</button>
          </div>
        ) : (
          <button className="btn-light small" onClick={() => setShowConfirm(true)}>Withdraw</button>
        )}
      </div>
    </article>
  );
}

function EmptyJobsState({ onFindJobs }) {
  return (
    <div className="empty-state">
      <h4>No applied jobs yet</h4>
      <p className="muted">When you apply for a job, it will appear here with its application status.</p>
      <button className="btn-dark" onClick={onFindJobs}>Browse Jobs</button>
    </div>
  );
}

function EmptySavedJobsState({ onFindJobs }) {
  return (
    <div className="empty-state">
      <h4>No saved jobs yet</h4>
      <p className="muted">Save jobs from Find Jobs to compare and apply later.</p>
      <button className="btn-dark" onClick={onFindJobs}>Browse Jobs</button>
    </div>
  );
}
