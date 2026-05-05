import { DashboardSection } from '../../../components/CommonBlocks';

export default function OverviewTab({ jobs, loading, setActiveTab }) {
  const activeJobs = jobs.filter((j) => j.status === 'OPEN');
  const draftJobs = jobs.filter((j) => j.status === 'DRAFT');

  return (
    <>
      <DashboardSection title="Job Overview">
        <ul className="quick-list">
          <li><strong>{activeJobs.length} open</strong> — accepting applications</li>
          <li><strong>{draftJobs.length} draft</strong> — not yet published</li>
          <li><strong>{jobs.length} total</strong> jobs posted</li>
        </ul>
      </DashboardSection>

      <DashboardSection title="Recent Job Postings">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <ActiveJobsTable jobs={jobs.slice(0, 5)} onManage={() => setActiveTab('Job Posts')} />
        )}
      </DashboardSection>
    </>
  );
}

function ActiveJobsTable({ jobs, onManage }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <h4>No jobs posted yet</h4>
        <p className="muted">Go to Job Posts to create your first posting.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Status</th>
              <th>Location</th>
              <th>Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="bold">{job.title}</td>
                <td>
                  <span className={`status-badge ${job.status === 'OPEN' ? 'review' : ''}`}>
                    {job.status}
                  </span>
                </td>
                <td className="muted">{job.location ?? '—'}</td>
                <td className="muted">{new Date(job.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="view-all link-button" onClick={onManage}>
        Manage all jobs →
      </button>
    </>
  );
}
