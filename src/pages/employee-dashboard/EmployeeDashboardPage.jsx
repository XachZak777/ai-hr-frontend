import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Tabs } from '../../components/CommonBlocks';
import { listMyApplications } from '../../api/jobs';
import { getCandidate } from '../../api/candidates';
import { getAuthUser, getDisplayName } from '../../utils/authState';
import { notify } from '../../utils/notifications';
import OverviewTab from './components/OverviewTab';
import ResumeTab from './components/ResumeTab';
import ApplicationsTab from './components/ApplicationsTab';
import JobSearchTab from './components/JobSearchTab';
import MessagesTab from './components/MessagesTab';

const dashboardTabs = ['Overview', 'Resume', 'Applications', 'Job Search', 'Messages'];

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [applications, setApplications] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const authUser = getAuthUser();
  const displayName = getDisplayName();
  const firstName = displayName.split(' ')[0] || 'there';

  useEffect(() => {
    const tasks = [listMyApplications({ size: 50 })];
    if (authUser?.profileId) {
      tasks.push(getCandidate(authUser.profileId));
    }
    Promise.allSettled(tasks).then(([appsResult, profileResult]) => {
      if (appsResult.status === 'fulfilled') {
        setApplications(appsResult.value.content ?? []);
      }
      if (profileResult?.status === 'fulfilled') {
        setCandidateProfile(profileResult.value);
      }
    }).finally(() => setLoading(false));
  }, [authUser?.profileId]);

  const profileCompletion = getProfileCompletion(authUser, candidateProfile);

  return (
    <main className="page dashboard">
      <PageTitle
        title={`Welcome back, ${firstName}!`}
        subtitle="Track your applications and manage your career journey"
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
        candidateProfile={candidateProfile}
        profileCompletion={profileCompletion}
        loading={loading}
      />
    </main>
  );
}

function EmployeeTabContent({ activeTab, setActiveTab, applications, candidateProfile, profileCompletion, loading }) {
  if (activeTab === 'Overview') {
    return (
      <OverviewTab
        applications={applications}
        profileCompletion={profileCompletion}
        loading={loading}
        setActiveTab={setActiveTab}
      />
    );
  }
  if (activeTab === 'Resume') return <ResumeTab candidateProfile={candidateProfile} />;
  if (activeTab === 'Applications') return <ApplicationsTab applications={applications} />;
  if (activeTab === 'Job Search') return <JobSearchTab />;
  if (activeTab === 'Messages') return <MessagesTab />;
  return null;
}

function getProfileCompletion(authUser, candidateProfile) {
  let filled = 0;
  let total = 0;

  const userFields = [authUser?.fullName, authUser?.email];
  userFields.forEach((f) => { total++; if (f?.trim()) filled++; });

  if (candidateProfile) {
    const profileFields = [candidateProfile.phone, candidateProfile.location, candidateProfile.linkedinUrl, candidateProfile.resumeUrl];
    const skills = candidateProfile.skills?.length > 0;
    profileFields.forEach((f) => { total++; if (f?.trim()) filled++; });
    total++;
    if (skills) filled++;
  } else {
    total += 5;
  }

  return Math.round((filled / total) * 100);
}
