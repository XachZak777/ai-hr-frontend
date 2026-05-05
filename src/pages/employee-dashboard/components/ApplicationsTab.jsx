import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

const STATUS_BADGE = {
  PENDING: '',
  REVIEWED: 'review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  HIRED: 'hired',
};

export default function ApplicationsTab({ applications, jobTitleMap = {} }) {
  const navigate = useNavigate();

  if (applications.length === 0) {
    return (
      <DashboardSection title="My Applications">
        <div className="empty-state">
          <h4>No applications yet</h4>
          <p className="muted">Browse open positions and submit your first application.</p>
          <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Find Jobs</button>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="My Applications">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="bold">{jobTitleMap[app.jobId] ?? '—'}</td>
                <td>
                  <span className={`status-badge ${STATUS_BADGE[app.status] ?? ''}`}>
                    {app.status}
                  </span>
                </td>
                <td className="muted">{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td className="muted">{new Date(app.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardSection>
  );
}
