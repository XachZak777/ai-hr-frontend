import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';

export default function OverviewTab({ jobs, loading, setActiveTab }) {
  const activeJobs = jobs.filter((j) => j.status === 'OPEN');
  const draftJobs = jobs.filter((j) => j.status === 'DRAFT');

  return (
    <>
      <DashboardSection title="Job Overview">
        <div className="overview-grid">
          <div className="quick-stats">
            <ul className="quick-list">
              <li><strong>{activeJobs.length} open jobs</strong> accepting applications</li>
              <li><strong>{draftJobs.length} draft jobs</strong> not yet published</li>
              <li><strong>{jobs.length} total jobs</strong> posted</li>
            </ul>
          </div>
        </div>
      </DashboardSection>
      <DashboardSection title="Recent Job Postings">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <ActiveJobsTable jobs={jobs.slice(0, 5)} onView={() => setActiveTab('Job Posts')} />
        )}
      </DashboardSection>
    </>
  );
}

function ActiveJobsTable({ jobs, onView }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <h4>No jobs posted yet</h4>
        <p className="muted">Post your first job to start receiving applications.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Status</th>
            <th>Location</th>
            <th>Posted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="bold">{job.title}</td>
              <td><span className={`status-badge ${job.status === 'OPEN' ? 'review' : ''}`}>{job.status}</span></td>
              <td className="muted">{job.location ?? '—'}</td>
              <td className="muted">{new Date(job.createdAt).toLocaleDateString()}</td>
              <td><button className="btn-light small" onClick={onView}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      {candidate.summary && (
        <div>
          <h5>Professional Summary</h5>
          <p>{candidate.summary}</p>
        </div>
      )}
      <div className="skills-list">
        {candidate.skills?.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
      </div>
    </div>
  );
}
