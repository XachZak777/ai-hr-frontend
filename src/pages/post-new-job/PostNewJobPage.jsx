import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';

const initialJob = {
  title: '',
  company: 'HireAI Partner',
  location: 'Yerevan',
  experience: 'Mid',
  salary: '',
  description: '',
  requirements: '',
};

export default function PostNewJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);

  const updateField = (field, value) => {
    setJob((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!job.title.trim() || !job.description.trim() || !job.salary.trim()) {
      notify('Please add a title, salary, and job description.', 'error');
      return;
    }

    notify(`${job.title} was posted successfully.`, 'success');
    setJob(initialJob);
    navigate('/employer-dashboard');
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Post New Job"
        subtitle="Create a clear, attractive job post for candidates"
        actions={<button className="btn-light" onClick={() => navigate('/employer-dashboard')}>Back to Dashboard</button>}
      />
      <div className="post-job-layout">
        <DashboardSection title="Job Details">
          <form className="job-form elevated-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <FormInput label="Job Title" value={job.title} onChange={(value) => updateField('title', value)} placeholder="Senior Frontend Developer" />
              <FormInput label="Company" value={job.company} onChange={(value) => updateField('company', value)} placeholder="Company name" />
            </div>
            <div className="form-row">
              <FormInput label="Location" value={job.location} onChange={(value) => updateField('location', value)} placeholder="Yerevan / Remote" />
              <FormInput label="Salary Range" value={job.salary} onChange={(value) => updateField('salary', value)} placeholder="$50k - $80k" />
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select value={job.experience} onChange={(e) => updateField('experience', e.target.value)}>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea rows="7" value={job.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe the role, impact, team, and main responsibilities..." />
            </div>
            <div className="form-group">
              <label>Requirements</label>
              <textarea rows="5" value={job.requirements} onChange={(e) => updateField('requirements', e.target.value)} placeholder="List required skills, tools, languages, and expectations..." />
            </div>
            <button className="btn-dark" type="submit">Publish Job</button>
          </form>
        </DashboardSection>
        <DashboardSection title="Live Preview">
          <article className="job-listing-card featured-preview">
            <div className="job-header">
              <div className="job-title-section">
                <h4>{job.title || 'Your job title'}</h4>
                <p className="company">{job.company || 'Company name'}</p>
              </div>
              <span className="match-badge">New</span>
            </div>
            <div className="job-details">
              <span className="detail">📍 {job.location || 'Location'}</span>
              <span className="detail">🎯 {job.experience}</span>
              <span className="detail">💰 {job.salary || 'Salary range'}/year</span>
            </div>
            <p className="job-description">{job.description || 'A concise job description will appear here as you type.'}</p>
            <p className="muted">{job.requirements || 'Requirements and expectations will appear here.'}</p>
          </article>
        </DashboardSection>
      </div>
    </main>
  );
}

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
