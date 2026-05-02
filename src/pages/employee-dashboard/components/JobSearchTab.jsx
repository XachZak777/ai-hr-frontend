import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

export default function JobSearchTab() {
  const navigate = useNavigate();

  return (
    <DashboardSection title="Find Your Next Opportunity">
      <div className="empty-state">
        <h4>Ready to find your next role?</h4>
        <p className="muted">Browse all open positions and apply directly.</p>
        <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Browse Jobs</button>
      </div>
    </DashboardSection>
  );
}
