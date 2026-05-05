import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/CommonBlocks';
import { listMyJobs } from '../../api/jobs';
import { getDisplayName } from '../../utils/authState';
import { notify } from '../../utils/notifications';
import OverviewTab from './components/OverviewTab';

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayName = getDisplayName();

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => setJobs(page.content ?? []))
      .catch(() => notify('Failed to load your jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page dashboard">
      <PageTitle
        title="Employer Dashboard"
        subtitle={`Welcome, ${displayName}`}
      />
      <OverviewTab
        jobs={jobs}
        loading={loading}
        setActiveTab={(tab) => {
          if (tab === 'Job Posts') navigate('/employer-jobs');
          else if (tab === 'Candidates') navigate('/employer-candidates');
        }}
      />
    </main>
  );
}
