import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { validateRequired, validateMinLength } from '../../utils/validation';

const initialJob = {
  title: '',
  company: '',
  location: '',
  experience: 'Mid',
  salary: '',
  description: '',
  requirements: '',
};

export default function PostNewJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setJob((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateRequired(job.title)) nextErrors.title = 'Job title is required';
    if (!validateRequired(job.company)) nextErrors.company = 'Company name is required';
    if (!validateRequired(job.location)) nextErrors.location = 'Location is required';
    if (!validateRequired(job.salary)) nextErrors.salary = 'Salary range is required';
    if (!validateMinLength(job.description, 30)) {
      nextErrors.description = job.description.trim().length === 0
        ? 'Job description is required'
        : 'Description must be at least 30 characters';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    notify(`${job.title} was posted successfully.`, 'success');
    setErrors({});
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
          <form className="job-form elevated-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <FormInput label="Job Title" value={job.title} onChange={(value) => updateField('title', value)} placeholder="Senior Frontend Developer" error={errors.title} />
              <FormInput label="Company" value={job.company} onChange={(value) => updateField('company', value)} placeholder="Company name" error={errors.company} />
            </div>
            <div className="form-row">
              <FormInput label="Location" value={job.location} onChange={(value) => updateField('location', value)} placeholder="Yerevan / Remote" error={errors.location} />
              <FormInput label="Salary Range" value={job.salary} onChange={(value) => updateField('salary', value)} placeholder="$50k - $80k" error={errors.salary} />
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
              <textarea
                rows="7"
                value={job.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the role, impact, team, and main responsibilities..."
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
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

function FormInput({ label, value, onChange, placeholder, error = '' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={error ? 'input-error' : ''} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
