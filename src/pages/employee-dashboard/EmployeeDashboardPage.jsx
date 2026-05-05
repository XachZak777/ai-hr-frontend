import { useEffect, useState } from 'react';
import { PageTitle, Tabs } from '../../components/CommonBlocks';
import { listMyApplications, getJob } from '../../api/jobs';
import { getCandidate } from '../../api/candidates';
import { getAuthUser, getDisplayName } from '../../utils/authState';
import OverviewTab from './components/OverviewTab';
import ResumeTab from './components/ResumeTab';
import ApplicationsTab from './components/ApplicationsTab';

const dashboardTabs = ['Overview', 'Resume', 'Applications'];

export default function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [applications, setApplications] = useState([]);
  const [jobTitleMap, setJobTitleMap] = useState({});
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
    Promise.allSettled(tasks).then(async ([appsResult, profileResult]) => {
      if (appsResult.status === 'fulfilled') {
        const list = appsResult.value.content ?? [];
        setApplications(list);
        const uniqueJobIds = [...new Set(list.map((a) => a.jobId).filter(Boolean))];
        const map = {};
        await Promise.allSettled(
          uniqueJobIds.map((id) => getJob(id).then((j) => { map[id] = j.title; }).catch(() => {}))
        );
        setJobTitleMap(map);
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
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <EmployeeTabContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applications={applications}
        jobTitleMap={jobTitleMap}
        candidateProfile={candidateProfile}
        profileCompletion={profileCompletion}
        loading={loading}
      />
    </main>
  );
}

function EmployeeTabContent({ activeTab, setActiveTab, applications, jobTitleMap, candidateProfile, profileCompletion, loading }) {
  if (activeTab === 'Overview') {
    return (
      <OverviewTab
        applications={applications}
        jobTitleMap={jobTitleMap}
        profileCompletion={profileCompletion}
        loading={loading}
        setActiveTab={setActiveTab}
      />
    );
  }
  if (activeTab === 'Resume') return <ResumeTab candidateProfile={candidateProfile} />;
  if (activeTab === 'Applications') return <ApplicationsTab applications={applications} jobTitleMap={jobTitleMap} />;
  return null;
}

function getProfileCompletion(authUser, candidateProfile) {
  let filled = 0;
  let total = 0;

  [authUser?.fullName, authUser?.email].forEach((f) => { total++; if (f?.trim()) filled++; });

  if (candidateProfile) {
    [candidateProfile.phone, candidateProfile.location, candidateProfile.linkedinUrl, candidateProfile.resumeUrl]
      .forEach((f) => { total++; if (f?.trim()) filled++; });
    total++;
    if (candidateProfile.skills?.length > 0) filled++;
  } else {
    total += 5;
  }

  return Math.round((filled / total) * 100);
}
