import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Tabs } from '../../components/CommonBlocks';
import { listMyJobs } from '../../api/jobs';
import { getDisplayName } from '../../utils/authState';
import { notify } from '../../utils/notifications';
import OverviewTab from './components/OverviewTab';
import JobPostsTab from './components/JobPostsTab';
import CandidatesTab from './components/CandidatesTab';
import AnalyticsTab from './components/AnalyticsTab';
import AiAgentTab from './components/AiAgentTab';
import TeamTab from './components/TeamTab';

const dashboardTabs = ['Overview', 'AI Agent', 'Job Posts', 'Candidates', 'Analytics', 'Team'];

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayName = getDisplayName();

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => setJobs(page.content ?? []))
      .catch(() => notify('Failed to load your jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleJobPosted = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Employer Dashboard"
        subtitle={`Welcome, ${displayName}`}
        actions={
          <div className="inline-actions">
            <button className="btn-light" onClick={() => navigate('/employer-schedule')}>Schedule</button>
            <button className="btn-dark" onClick={() => navigate('/post-new-job')}>Post New Job</button>
          </div>
        }
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <EmployerTabContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigate={navigate}
        jobs={jobs}
        loading={loading}
        onJobPosted={handleJobPosted}
      />
    </main>
  );
}

function EmployerTabContent({ activeTab, setActiveTab, navigate, jobs, loading, onJobPosted }) {
  if (activeTab === 'Overview') return <OverviewTab jobs={jobs} loading={loading} setActiveTab={setActiveTab} />;
  if (activeTab === 'Job Posts') return <JobPostsTab jobs={jobs} onJobPosted={onJobPosted} />;
  if (activeTab === 'Candidates') return <CandidatesTab jobs={jobs} />;
  if (activeTab === 'Analytics') return <AnalyticsTab />;
  if (activeTab === 'AI Agent') return <AiAgentTab />;
  if (activeTab === 'Team') return <TeamTab />;
  return null;
}
