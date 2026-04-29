import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle, StatsRow, Tabs } from '../../components/CommonBlocks';
import { getAppliedJobs } from '../../utils/applications';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';
import { saveJob } from '../../utils/savedJobs';
import { allJobs } from '../find-jobs/FindJobsPage';

const dashboardTabs = ['Overview', 'Resume', 'Applications', 'Job Search', 'Messages'];

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const profile = getUserProfile('employee');
  const applications = getAppliedJobs();
  const recommendedJobs = getRecommendedJobs(profile);
  const profileCompletion = getProfileCompletion(profile);
  const stats = getEmployeeStats(applications, profileCompletion);
  const firstName = profile.name.split(' ')[0] || 'there';

  return (
    <main className="page dashboard">
      <PageTitle
        title={`Welcome back, ${firstName}!`}
        subtitle={profile.headline || 'Track your applications and manage your career journey'}
        actions={<EmployeeActions navigate={navigate} />}
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <StatsRow items={stats} />
      <EmployeeTabContent
        activeTab={activeTab}
        applications={applications}
        profile={profile}
        profileCompletion={profileCompletion}
        recommendedJobs={recommendedJobs}
        setActiveTab={setActiveTab}
        navigate={navigate}
      />
    </main>
  );
}

function EmployeeActions({ navigate }) {
  return (
    <div className="inline-actions">
      <button className="btn-light" onClick={() => navigate('/employee-schedule')}>My Schedule</button>
      <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Find Jobs</button>
      <button className="btn-light" onClick={() => navigate('/my-jobs')}>My Jobs</button>
    </div>
  );
}

function EmployeeTabContent({ activeTab, applications, profile, profileCompletion, recommendedJobs, setActiveTab, navigate }) {
  if (activeTab === 'Overview') return <OverviewTab applications={applications} profileCompletion={profileCompletion} recommendedJobs={recommendedJobs} setActiveTab={setActiveTab} navigate={navigate} />;
  if (activeTab === 'Resume') return <ResumeTab profile={profile} navigate={navigate} />;
  if (activeTab === 'Applications') return <ApplicationsTab applications={applications} navigate={navigate} />;
  if (activeTab === 'Job Search') return <JobSearchTab navigate={navigate} profile={profile} />;
  if (activeTab === 'Messages') return <MessagesTab />;
  return null;
}

function OverviewTab({ applications, profileCompletion, recommendedJobs, setActiveTab, navigate }) {
  return (
    <>
      <DashboardSection>
        <OverviewGrid applications={applications} profileCompletion={profileCompletion} navigate={navigate} />
      </DashboardSection>
      <DashboardSection title="Recent Applications">
        <RecentApplications applications={applications} onViewAll={() => setActiveTab('Applications')} />
      </DashboardSection>
      <DashboardSection title="Recommended Positions for You">
        <RecommendedJobs jobs={recommendedJobs} navigate={navigate} />
      </DashboardSection>
    </>
  );
}

function OverviewGrid({ applications, profileCompletion, navigate }) {
  const activeApplications = applications.filter((app) => app.status !== 'Withdrawn').length;

  return (
    <div className="overview-grid">
      <div className="profile-completion">
        <h3>Profile Completion</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <p className="muted">{profileCompletion}% complete</p>
        <button className="btn-light" onClick={() => navigate('/profile')}>Complete Profile</button>
      </div>
      <div className="quick-stats">
        <h3>Your Opportunities</h3>
        <ul className="quick-list">
          <li>👷 <strong>{activeApplications} active applications</strong> currently tracked</li>
          <li>🎯 <strong>{allJobs.length} job matches</strong> available today</li>
          <li>💬 <strong>2 messages</strong> from recruiters</li>
          <li>⭐ <strong>{profileCompletion}% profile completion</strong> improves match quality</li>
        </ul>
      </div>
    </div>
  );
}

function RecentApplications({ applications, onViewAll }) {
  if (applications.length === 0) {
    return (
      <div className="empty-state compact-empty">
        <h4>No applications yet</h4>
        <p className="muted">Apply to a job and it will appear here automatically.</p>
      </div>
    );
  }

  return (
    <>
      <div className="applications-list">
        {applications.slice(0, 3).map((app) => <ApplicationCard key={app.id} app={app} />)}
      </div>
      {applications.length > 3 && (
        <button className="view-all link-button" onClick={onViewAll}>View all {applications.length} applications →</button>
      )}
    </>
  );
}

function ApplicationCard({ app }) {
  return (
    <div className="application-card">
      <div className="app-header">
        <div>
          <h4>{app.company}</h4>
          <p className="muted">{app.jobTitle}</p>
        </div>
        <span className="status-badge review">{app.status}</span>
      </div>
      <div className="app-footer">
        <span className="accent">{app.matchScore ? `Match: ${app.matchScore}%` : 'Application submitted'}</span>
        <span className="muted">{app.appliedAt}</span>
      </div>
    </div>
  );
}

function RecommendedJobs({ jobs, navigate }) {
  return (
    <div className="recommended-jobs">
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="job-info">
            <h4>{job.position}</h4>
            <p className="company">{job.company}</p>
            <p className="salary">{job.salary}/year</p>
          </div>
          <div className="job-actions">
            <span className="match-score">{job.matchScore} match</span>
            <button className="btn-dark" onClick={() => applyToJob(job, navigate)}>Apply Now</button>
            <button className="btn-light" onClick={() => { saveJob(job); notify(`${job.title} saved to your jobs.`, 'success'); }}>Save</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResumeTab({ profile, navigate }) {
  return (
    <DashboardSection title="My Resume & Profile">
      <div className="resume-section">
        <ResumeCard profile={profile} navigate={navigate} />
        <ProfileSections profile={profile} navigate={navigate} />
      </div>
    </DashboardSection>
  );
}

function ResumeCard({ profile, navigate }) {
  return (
    <div className="resume-card">
      <h4>📄 Resume</h4>
      <p className="muted">{profile.name}'s job seeker profile</p>
      <div className="resume-actions">
        <button className="btn-light" onClick={() => navigate('/profile')}>View</button>
        <button className="btn-light" onClick={() => navigate('/profile')}>Update</button>
        <button className="btn-light" onClick={() => notify('Profile export prepared.', 'success')}>Download</button>
      </div>
    </div>
  );
}

function ProfileSections({ profile, navigate }) {
  const skills = profile.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="profile-sections">
      <div className="section-card">
        <h4>Professional Summary</h4>
        <p className="muted">{profile.summary || 'No summary added. This helps employers understand your background better.'}</p>
        <button className="btn-light" onClick={() => navigate('/profile')}>Edit Summary</button>
      </div>
      <div className="section-card">
        <h4>Skills</h4>
        <div className="skills-list">
          {skills.length > 0 ? skills.map((skill) => <span key={skill} className="skill-tag">{skill}</span>) : <p className="muted">No skills added yet.</p>}
          <button className="btn-light small" onClick={() => navigate('/profile')}>+ Add Skill</button>
        </div>
      </div>
      <div className="section-card">
        <h4>Contact</h4>
        <p className="muted">{profile.email}</p>
        <p className="muted">{profile.phone}</p>
        <p className="muted">{profile.location}</p>
      </div>
    </div>
  );
}

function ApplicationsTab({ applications, navigate }) {
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
                <td><button className="btn-light small" onClick={() => navigate('/my-jobs')}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardSection>
  );
}

function JobSearchTab({ navigate, profile }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(profile.location || '');
  const [experience, setExperience] = useState('all');
  const filteredJobs = allJobs.filter((job) => {
    const search = query.toLowerCase();
    const matchesQuery = !query || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search);
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesExperience = experience === 'all' || job.experience === experience;
    return matchesQuery && matchesLocation && matchesExperience;
  });

  return (
    <DashboardSection title="Find Your Next Opportunity">
      <div className="job-search-form">
        <div className="search-inputs">
          <input type="text" placeholder="Job title or keyword..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <input type="text" placeholder="Location..." value={location} onChange={(event) => setLocation(event.target.value)} />
          <select value={experience} onChange={(event) => setExperience(event.target.value)}>
            <option value="all">Experience Level</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
          <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Search Jobs</button>
        </div>
        <div className="search-results">
          <h4>Latest Matches for Frontend Developer</h4>
          {filteredJobs.map((job) => (
            <div key={job.id} className="search-result-item">
              <div>
                <h5>{job.title}</h5>
                <p className="company">{job.company}</p>
                <p className="muted">Salary: {job.salary}/year</p>
              </div>
              <button className="btn-dark" onClick={() => applyToJob(job, navigate)}>Apply</button>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}

function MessagesTab() {
  const [replyTo, setReplyTo] = useState('');
  const [replyText, setReplyText] = useState('');
  const messages = [
    ['Tech Armenia Recruiter', '2 hours ago', 'Great news! We\'d like to invite you to our final interview round...'],
    ['Innovation Hub HR', '1 day ago', 'Thank you for your interest. We\'re reviewing your application...'],
  ];

  return (
    <DashboardSection title="Messages">
      <div className="messages-container">
        {messages.map(([sender, time, message]) => (
          <div key={sender} className="message-item">
            <div className="message-header">
              <h4>{sender}</h4>
              <span className="time">{time}</span>
            </div>
            <p className="message-content">{message}</p>
            {replyTo === sender ? (
              <div className="reply-box">
                <textarea rows="2" value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write a reply..." />
                <div className="inline-actions">
                  <button className="btn-dark small" onClick={() => { setReplyTo(''); setReplyText(''); notify(`Reply sent to ${sender}.`, 'success'); }}>Send</button>
                  <button className="btn-light small" onClick={() => setReplyTo('')}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn-light" onClick={() => setReplyTo(sender)}>Reply</button>
            )}
          </div>
        ))}
      </div>
    </DashboardSection>
  );
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

function applyToJob(job, navigate) {
  const fullJob = allJobs.find((item) => item.id === job.id) || {
    id: job.id,
    title: job.position,
    company: job.company,
    location: 'Yerevan',
    experience: 'Mid',
    salary: job.salary,
    matchScore: Number.parseInt(job.matchScore, 10) || 90,
    description: 'Complete your application for this recommended position.',
  };

  navigate(`/apply/${fullJob.id}`, { state: { job: fullJob } });
}
