import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Tabs } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';
import OverviewTab from './components/OverviewTab';
import JobPostsTab from './components/JobPostsTab';
import CandidatesTab from './components/CandidatesTab';
import AnalyticsTab from './components/AnalyticsTab';
import AiAgentTab from './components/AiAgentTab';
import TeamTab from './components/TeamTab';

const dashboardTabs = ['Overview', 'AI Agent', 'Job Posts', 'Candidates', 'Analytics', 'Team'];

const initialJobs = [];

const stats = [
  { title: 'Active Jobs', value: '0', note: '' },
  { title: 'Total Applications', value: '0', note: '' },
  { title: 'AI Matches', value: '0', note: '' },
  { title: 'Interviews Scheduled', value: '0', note: '' },
];

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [jobs, setJobs] = useState(initialJobs);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const profile = getUserProfile('employer');

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      notify('Please fill in all job details.', 'error');
      return;
    }
    setJobs((current) => [
      { id: Date.now(), title: jobTitle, applications: 0, matches: 0, posted: 'Just now' },
      ...current,
    ]);
    notify(`Job "${jobTitle}" posted successfully.`, 'success');
    setJobTitle('');
    setJobDescription('');
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Employer Dashboard"
        subtitle={`Welcome, ${profile.name}`}
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
        setJobs={setJobs}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        setJobTitle={setJobTitle}
        setJobDescription={setJobDescription}
        onPostJob={handlePostJob}
      />
    </main>
  );
}

function EmployerTabContent(props) {
  const { activeTab, setActiveTab, jobs, setJobs, jobTitle, jobDescription, setJobTitle, setJobDescription, onPostJob } = props;

  if (activeTab === 'Overview') return <OverviewTab jobs={jobs} setActiveTab={setActiveTab} />;
  if (activeTab === 'Job Posts') return <JobPostsTab jobs={jobs} setJobs={setJobs} jobTitle={jobTitle} jobDescription={jobDescription} setJobTitle={setJobTitle} setJobDescription={setJobDescription} onPostJob={onPostJob} />;
  if (activeTab === 'Candidates') return <CandidatesTab />;
  if (activeTab === 'Analytics') return <AnalyticsTab />;
  if (activeTab === 'AI Agent') return <AiAgentTab />;
  if (activeTab === 'Team') return <TeamTab />;
  return null;
}
