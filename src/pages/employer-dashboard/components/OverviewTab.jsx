import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';

const recentApplications = [];

export { recentApplications };

export default function OverviewTab({ jobs, setActiveTab }) {
  return (
    <>
      <DashboardSection title="Recent Job Postings">
        <ActiveJobsTable jobs={jobs} onView={() => setActiveTab('Candidates')} />
      </DashboardSection>
      <DashboardSection title="Recent Applications">
        <RecentApplicationsList />
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

function RecentApplicationsList() {
  const navigate = useNavigate();
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
      {selectedProfile && (
        <CandidateProfilePanel candidate={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </>
  );
}

export function CandidateProfilePanel({ candidate, onClose }) {
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
        <div className="stat-mini"><h4>{candidate.matchScore}</h4><p className="muted">AI Match</p></div>
        <div className="stat-mini"><h4>{candidate.status}</h4><p className="muted">Status</p></div>
        <div className="stat-mini"><h4>{candidate.location}</h4><p className="muted">Location</p></div>
      </div>
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
