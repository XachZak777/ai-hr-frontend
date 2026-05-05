import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

export default function ApplicationsTab({ applications }) {
  const navigate = useNavigate();

  if (applications.length === 0) {
    return (
      <DashboardSection title="All Applications">
        <div className="empty-state">
          <h4>No applications yet</h4>
          <p className="muted">Browse matching jobs and submit your first application.</p>
          <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Find Jobs</button>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="All Applications">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Match</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="bold">{app.company}</td>
                <td>{app.jobTitle}</td>
                <td className="accent">{app.matchScore ? `${app.matchScore}%` : '-'}</td>
                <td><span className="status-badge review">{app.status}</span></td>
                <td className="muted">{app.appliedAt}</td>
                <td>
                  <button className="btn-light small" onClick={() => navigate('/my-jobs')}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardSection>
  );
}
