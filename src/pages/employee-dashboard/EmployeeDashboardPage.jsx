import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Tabs } from '../../components/CommonBlocks';
import { getAppliedJobs } from '../../utils/applications';
import { getUserProfile } from '../../utils/profile';
import { allJobs } from '../../data/jobs';
import OverviewTab from './components/OverviewTab';
import ResumeTab from './components/ResumeTab';
import ApplicationsTab from './components/ApplicationsTab';
import JobSearchTab from './components/JobSearchTab';
import MessagesTab from './components/MessagesTab';

const dashboardTabs = ['Overview', 'Resume', 'Applications', 'Job Search', 'Messages'];

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const profile = getUserProfile('employee');
  const applications = getAppliedJobs();
  const profileCompletion = getProfileCompletion(profile);
  const recommendedJobs = getRecommendedJobs(profile);
  const stats = getEmployeeStats(applications, profileCompletion);
  const firstName = profile.name.split(' ')[0] || 'there';

  return (
    <main className="page dashboard">
      <PageTitle
        title={`Welcome back, ${firstName}!`}
        subtitle={profile.headline || 'Track your applications and manage your career journey'}
        actions={
          <div className="inline-actions">
            <button className="btn-light" onClick={() => navigate('/employee-schedule')}>My Schedule</button>
            <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Find Jobs</button>
            <button className="btn-light" onClick={() => navigate('/my-jobs')}>My Jobs</button>
          </div>
        }
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <EmployeeTabContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applications={applications}
        profile={profile}
        profileCompletion={profileCompletion}
        recommendedJobs={recommendedJobs}
      />
    </main>
  );
}

function EmployeeTabContent({ activeTab, setActiveTab, applications, profile, profileCompletion, recommendedJobs }) {
  if (activeTab === 'Overview') {
    return (
      <OverviewTab
        applications={applications}
        profileCompletion={profileCompletion}
        recommendedJobs={recommendedJobs}
        setActiveTab={setActiveTab}
      />
    );
  }
  if (activeTab === 'Resume') return <ResumeTab profile={profile} />;
  if (activeTab === 'Applications') return <ApplicationsTab applications={applications} />;
  if (activeTab === 'Job Search') return <JobSearchTab profile={profile} />;
  if (activeTab === 'Messages') return <MessagesTab />;
  return null;
}

function getEmployeeStats(applications, profileCompletion) {
  return [
    { title: 'Applications Sent', value: String(applications.length), note: applications.length > 0 ? 'Tracked in My Jobs' : 'Start applying' },
    { title: 'Profile Completion', value: `${profileCompletion}%`, note: profileCompletion === 100 ? 'complete' : 'keep improving' },
    { title: 'Interview Invites', value: String(applications.filter((app) => app.status === 'Interview').length), note: 'This month' },
    { title: 'Match Score', value: `${getAverageMatch(applications)}%`, note: 'Average' },
  ];
}

function getAverageMatch(applications) {
  const matches = applications.map((app) => Number(app.matchScore)).filter(Boolean);
  if (matches.length === 0) return 91;
  return Math.round(matches.reduce((total, score) => total + score, 0) / matches.length);
}

function getProfileCompletion(profile) {
  const fields = ['name', 'email', 'phone', 'location', 'headline', 'linkedin', 'skills', 'summary'];
  const completed = fields.filter((field) => String(profile[field] || '').trim()).length;
  return Math.round((completed / fields.length) * 100);
}

function getRecommendedJobs(profile) {
  const skills = profile.skills.toLowerCase();
  return [...allJobs]
    .map((job) => ({
      ...job,
      position: job.title,
      matchScore: skills.includes('react') && job.title.toLowerCase().includes('react') ? 96 : job.matchScore,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}
