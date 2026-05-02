import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { validateRequired, validateMinLength } from '../../utils/validation';
import { createJob, publishJob } from '../../api/jobs';
import { getRecruiter } from '../../api/recruiters';
import { getAuthUser, updateAuthUser } from '../../utils/authState';

const EXPERIENCE_LEVEL = { Entry: 'ENTRY', Mid: 'MID', Senior: 'SENIOR', Lead: 'LEAD' };
const WORK_TYPE = { 'On-Site': 'ON_SITE', Remote: 'REMOTE', Hybrid: 'HYBRID' };

const initialJob = {
  title: '',
  location: '',
  experienceLevel: 'Mid',
  workType: 'On-Site',
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: '',
};

export default function PostNewJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);
  const [errors, setErrors] = useState({});
  const [companyId, setCompanyId] = useState(() => getAuthUser()?.companyId ?? null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companyId) return;
    const authUser = getAuthUser();
    if (!authUser?.profileId) return;

    setLoadingCompany(true);
    getRecruiter(authUser.profileId)
      .then((recruiter) => {
        if (recruiter.companyId) {
          setCompanyId(recruiter.companyId);
          updateAuthUser({ companyId: recruiter.companyId });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCompany(false));
  }, [companyId]);

  const updateField = (field, value) => {
    setJob((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateRequired(job.title)) nextErrors.title = 'Job title is required';
    if (!validateRequired(job.location)) nextErrors.location = 'Location is required';
    if (!validateMinLength(job.description, 30)) {
      nextErrors.description = job.description.trim().length === 0
        ? 'Job description is required'
        : 'Description must be at least 30 characters';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!companyId) {
      notify('Company ID is required. Please complete your recruiter profile first.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createJob({
        companyId,
        title: job.title,
        description: job.description,
        requirements: job.requirements || undefined,
        salaryMin: job.salaryMin ? Number(job.salaryMin) : undefined,
        salaryMax: job.salaryMax ? Number(job.salaryMax) : undefined,
        location: job.location,
        experienceLevel: EXPERIENCE_LEVEL[job.experienceLevel] ?? 'MID',
        workType: WORK_TYPE[job.workType] ?? 'ON_SITE',
      });
      await publishJob(created.id);
      notify(`${job.title} published successfully.`, 'success');
      setJob(initialJob);
      navigate('/employer-dashboard');
    } catch (err) {
      notify(err.message ?? 'Failed to post job.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const salaryPreview = job.salaryMin || job.salaryMax
    ? `$${job.salaryMin || '?'}k – $${job.salaryMax || '?'}k`
    : 'Salary range';

  return (
    <main className="page dashboard">
      <PageTitle
        title="Post New Job"
        subtitle="Create a clear, attractive job post for candidates"
        actions={<button className="btn-light" onClick={() => navigate('/employer-dashboard')}>Back to Dashboard</button>}
      />
      {loadingCompany && <p className="muted">Loading company info...</p>}
      <div className="post-job-layout">
        <DashboardSection title="Job Details">
          <form className="job-form elevated-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <FormInput label="Job Title" value={job.title} onChange={(v) => updateField('title', v)} placeholder="Senior Frontend Developer" error={errors.title} />
              <FormInput label="Location" value={job.location} onChange={(v) => updateField('location', v)} placeholder="Yerevan / Remote" error={errors.location} />
            </div>
            <div className="form-row">
              <FormInput type="number" label="Salary Min (USD)" value={job.salaryMin} onChange={(v) => updateField('salaryMin', v)} placeholder="60000" />
              <FormInput type="number" label="Salary Max (USD)" value={job.salaryMax} onChange={(v) => updateField('salaryMax', v)} placeholder="90000" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Experience Level</label>
                <select value={job.experienceLevel} onChange={(e) => updateField('experienceLevel', e.target.value)}>
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                  <option>Lead</option>
                </select>
              </div>
              <div className="form-group">
                <label>Work Type</label>
                <select value={job.workType} onChange={(e) => updateField('workType', e.target.value)}>
                  <option>On-Site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>
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
              <textarea
                rows="5"
                value={job.requirements}
                onChange={(e) => updateField('requirements', e.target.value)}
                placeholder="List required skills, tools, languages, and expectations..."
              />
            </div>
            <button className="btn-dark" type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Job'}
            </button>
          </form>
        </DashboardSection>
        <DashboardSection title="Live Preview">
          <article className="job-listing-card featured-preview">
            <div className="job-header">
              <div className="job-title-section">
                <h4>{job.title || 'Your job title'}</h4>
              </div>
              <span className="match-badge">New</span>
            </div>
            <div className="job-details">
              <span className="detail">{job.location || 'Location'}</span>
              <span className="detail">{job.experienceLevel}</span>
              <span className="detail">{job.workType}</span>
              <span className="detail">{salaryPreview}/year</span>
            </div>
            <p className="job-description">{job.description || 'A concise job description will appear here as you type.'}</p>
            <p className="muted">{job.requirements || 'Requirements and expectations will appear here.'}</p>
          </article>
        </DashboardSection>
      </div>
    </main>
  );
}

function FormInput({ label, value, onChange, placeholder, error = '', type = 'text' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
