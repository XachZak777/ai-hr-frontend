import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle, StatsRow, Tabs } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';

const dashboardTabs = ['Overview', 'AI Agent', 'Job Posts', 'Candidates', 'Analytics', 'Team'];

const stats = [
  { title: 'Active Jobs', value: '8', note: '+2 this week' },
  { title: 'Total Applications', value: '342', note: '+23 today' },
  { title: 'AI Matches', value: '89', note: '94% accuracy' },
  { title: 'Interviews Scheduled', value: '15', note: 'This week' }
];

const activeJobs = [
  { id: 1, title: 'Senior Frontend Developer', applications: 45, matches: 12, posted: '5 days ago' },
  { id: 2, title: 'Product Manager', applications: 28, matches: 8, posted: '2 weeks ago' },
  { id: 3, title: 'UX Designer', applications: 19, matches: 5, posted: '1 week ago' },
  { id: 4, title: 'Backend Developer', applications: 67, matches: 23, posted: '3 days ago' },
];

const recentApplications = [
  { id: 1, name: 'Davit Hakobyan', position: 'Senior Frontend Developer', matchScore: '94%', status: 'reviewed', email: 'davit.h@example.com', phone: '+374 91 222 118', location: 'Yerevan', experience: '7 years', skills: ['React', 'TypeScript', 'Design Systems', 'Node.js'], summary: 'Frontend lead with strong product instincts and experience building accessible SaaS dashboards.', education: 'BS Computer Science, YSU', availability: '2 weeks' },
  { id: 2, name: 'Anna Grigoryan', position: 'Product Manager', matchScore: '87%', status: 'new', email: 'anna.g@example.com', phone: '+374 99 448 210', location: 'Yerevan', experience: '5 years', skills: ['Roadmaps', 'Analytics', 'B2B SaaS', 'Research'], summary: 'Product manager focused on AI-assisted workflow products and measurable activation improvements.', education: 'MBA, AUA', availability: 'Immediately' },
  { id: 3, name: 'Karen Tonoyan', position: 'UX Designer', matchScore: '91%', status: 'interviewing', email: 'karen.t@example.com', phone: '+374 77 303 919', location: 'Remote', experience: '6 years', skills: ['Figma', 'Research', 'Prototyping', 'Design Strategy'], summary: 'UX designer with a polished portfolio across hiring, fintech, and scheduling products.', education: 'MA Interaction Design', availability: '1 month' },
];

const teamMembers = [
  ['Armen Sarkissian', 'CEO - Admin'],
  ['Gayane Mkrtchyan', 'HR Manager'],
];

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [jobs, setJobs] = useState(activeJobs);
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
        actions={<EmployerActions navigate={navigate} onPostJob={() => setActiveTab('Job Posts')} />}
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <StatsRow items={stats} />
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

function EmployerActions({ navigate, onPostJob }) {
  return (
    <div className="inline-actions">
      <button className="btn-light" onClick={() => navigate('/employer-schedule')}>Schedule</button>
      <button className="btn-dark" onClick={() => navigate('/post-new-job')}>Post New Job</button>
    </div>
  );
}

function EmployerTabContent(props) {
  if (props.activeTab === 'Overview') return <OverviewTab navigate={props.navigate} jobs={props.jobs} setActiveTab={props.setActiveTab} />;
  if (props.activeTab === 'Job Posts') return <JobPostsTab {...props} />;
  if (props.activeTab === 'Candidates') return <CandidatesTab />;
  if (props.activeTab === 'Analytics') return <AnalyticsTab />;
  if (props.activeTab === 'AI Agent') return <AiAgentTab />;
  if (props.activeTab === 'Team') return <TeamTab />;
  return null;
}

function OverviewTab({ navigate, jobs, setActiveTab }) {
  return (
    <>
      <DashboardSection title="Recent Job Postings">
        <ActiveJobsTable jobs={jobs} onView={() => setActiveTab('Candidates')} />
      </DashboardSection>
      <DashboardSection title="Recent Applications">
        <RecentApplicationsList navigate={navigate} />
      </DashboardSection>
    </>
  );
}

function ActiveJobsTable({ jobs, onView }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Applications</th>
            <th>AI Matches</th>
            <th>Posted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="bold">{job.title}</td>
              <td>{job.applications}</td>
              <td className="accent">{job.matches}</td>
              <td className="muted">{job.posted}</td>
              <td><button className="btn-light small" onClick={onView}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentApplicationsList({ navigate }) {
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <>
      <div className="applications-list">
        {recentApplications.map((app) => (
          <div key={app.id} className="application-card">
            <div className="app-header">
              <h4>{app.name}</h4>
              <span className={`status-badge ${app.status}`}>{app.status}</span>
            </div>
            <p className="muted">{app.position}</p>
            <div className="app-footer">
              <p className="match-score">Match: <span className="accent">{app.matchScore}</span></p>
              <div className="inline-actions">
                <button className="btn-light small" onClick={() => setSelectedProfile(app)}>View Profile</button>
                <button className="btn-dark small" onClick={() => navigate('/employer-schedule')}>Schedule Interview</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedProfile && <CandidateProfilePanel candidate={selectedProfile} onClose={() => setSelectedProfile(null)} />}
    </>
  );
}

function JobPostsTab({ jobs, setJobs, jobTitle, jobDescription, setJobTitle, setJobDescription, onPostJob }) {
  return (
    <DashboardSection title="Manage Job Posts">
      <div className="jobs-management">
        <JobPostForm
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          setJobTitle={setJobTitle}
          setJobDescription={setJobDescription}
          onSubmit={onPostJob}
        />
        <PostedJobsList jobs={jobs} setJobs={setJobs} setJobTitle={setJobTitle} />
      </div>
    </DashboardSection>
  );
}

function JobPostForm({ jobTitle, jobDescription, setJobTitle, setJobDescription, onSubmit }) {
  return (
    <div className="job-form">
      <h4>Post New Job</h4>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" placeholder="e.g., Senior Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Job Description</label>
          <textarea placeholder="Enter job description, requirements, and benefits..." rows="6" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required></textarea>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input type="text" placeholder="Yerevan, Armenia" />
          </div>
          <div className="form-group">
            <label>Salary Range</label>
            <input type="text" placeholder="$50k - $80k" />
          </div>
        </div>
        <button type="submit" className="btn-dark">Post Job</button>
      </form>
    </div>
  );
}

function PostedJobsList({ jobs, setJobs, setJobTitle }) {
  const closeJob = (job) => {
    setJobs((current) => current.filter((item) => item.id !== job.id));
    notify(`${job.title} job closed.`, 'success');
  };

  return (
    <div className="jobs-list">
      <h4>Your Posted Jobs</h4>
      {jobs.map((job) => (
        <div key={job.id} className="job-item">
          <h5>{job.title}</h5>
          <p className="muted">Applications: {job.applications} | Matches: {job.matches}</p>
          <div className="job-actions">
            <button className="btn-light small" onClick={() => setJobTitle(job.title)}>Edit</button>
            <button className="btn-light small" onClick={() => notify(`${job.applications} applications for ${job.title}.`)}>View Applications</button>
            <button className="btn-light small" onClick={() => closeJob(job)}>Close</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidatesTab() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <DashboardSection title="Candidate Management">
      <div className="candidates-grid">
        {recentApplications.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <div className="candidate-header">
              <h4>{candidate.name}</h4>
              <span className="match-score">{candidate.matchScore}</span>
            </div>
            <p className="muted">{candidate.position}</p>
            <button className="btn-dark" onClick={() => setSelectedProfile(candidate)}>View Full Profile</button>
          </div>
        ))}
      </div>
      {selectedProfile && <CandidateProfilePanel candidate={selectedProfile} onClose={() => setSelectedProfile(null)} />}
    </DashboardSection>
  );
}

function CandidateProfilePanel({ candidate, onClose }) {
  return (
    <div className="details-panel">
      <div className="row-between">
        <div>
          <h4>{candidate.name}</h4>
          <p className="muted">{candidate.position}</p>
        </div>
        <button className="btn-light small" onClick={onClose}>Close</button>
      </div>
      <div className="grid-3">
        <div className="stat-mini">
          <h4>{candidate.matchScore}</h4>
          <p className="muted">AI Match</p>
        </div>
        <div className="stat-mini">
          <h4>{candidate.status}</h4>
          <p className="muted">Status</p>
        </div>
        <div className="stat-mini">
          <h4>Yerevan</h4>
          <p className="muted">Location</p>
        </div>
      </div>
      <p className="muted">Strong technical fit with relevant experience and active availability.</p>
      <div className="candidate-profile-grid">
        <div>
          <h5>Contact</h5>
          <p className="muted">{candidate.email}</p>
          <p className="muted">{candidate.phone}</p>
        </div>
        <div>
          <h5>Experience</h5>
          <p className="muted">{candidate.experience}</p>
          <p className="muted">Available: {candidate.availability}</p>
        </div>
        <div>
          <h5>Education</h5>
          <p className="muted">{candidate.education}</p>
        </div>
      </div>
      <div>
        <h5>Professional Summary</h5>
        <p>{candidate.summary}</p>
      </div>
      <div className="skills-list">
        {candidate.skills?.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const charts = ['📊 Application Trends', '📈 Hiring Funnel', '🎯 Match Quality Distribution', '⏱️ Time-to-Hire Metrics'];
  return (
    <DashboardSection title="Analytics & Insights">
      <div className="analytics-grid">
        {charts.map((chart) => <div key={chart} className="chart-placeholder"><p>{chart}</p></div>)}
      </div>
    </DashboardSection>
  );
}

function AiAgentTab() {
  return (
    <DashboardSection title="AI Agent Configuration">
      <div className="settings-form">
        <div className="form-group">
          <label>AI Agent Name</label>
          <input type="text" defaultValue="HireAI Assistant" />
        </div>
        <div className="form-group">
          <label>Matching Algorithm Strength</label>
          <select>
            <option>Conservative (High Quality Matches)</option>
            <option>Balanced</option>
            <option>Aggressive (More Candidates)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            Enable AI Agent
          </label>
        </div>
        <button className="btn-dark" onClick={() => notify('AI Agent settings saved successfully.', 'success')}>Save Settings</button>
      </div>
    </DashboardSection>
  );
}

function TeamTab() {
  const [members, setMembers] = useState(teamMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const addMember = () => {
    if (!newMemberName || !newMemberRole) {
      notify('Enter team member name and role.', 'error');
      return;
    }

    setMembers((current) => [...current, [newMemberName, newMemberRole]]);
    setNewMemberName('');
    setNewMemberRole('');
    setShowAddMember(false);
    notify('Team member added.', 'success');
  };

  return (
    <DashboardSection title="Team Members">
      <div className="team-grid">
        {members.map(([name, role]) => (
          <div key={name} className="team-member">
            <h4>{name}</h4>
            <p className="muted">{role}</p>
            <button className="btn-light small" onClick={() => setMembers((current) => current.filter(([memberName]) => memberName !== name))}>Remove</button>
          </div>
        ))}
        <div className="team-member plus-member">
          <button className="btn-dark" onClick={() => setShowAddMember(true)}>+ Add Team Member</button>
        </div>
      </div>
      {showAddMember && (
        <div className="details-panel">
          <h4>Add Team Member</h4>
          <div className="form-row">
            <input placeholder="Full name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
            <input placeholder="Role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} />
          </div>
          <div className="inline-actions">
            <button className="btn-dark" onClick={addMember}>Add</button>
            <button className="btn-light" onClick={() => setShowAddMember(false)}>Cancel</button>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
