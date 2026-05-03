import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { validateRequired, validateMinLength } from '../../utils/validation';
import { createJob, publishJob } from '../../api/jobs';
import { getRecruiter, createRecruiter, updateRecruiter } from '../../api/recruiters';
import { createCompany } from '../../api/companies';
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
  requiredSkills: '',
};

const initialCompanyForm = { companyName: '', industry: '', website: '', positionTitle: '' };

export default function PostNewJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);
  const [errors, setErrors] = useState({});
  const [companyId, setCompanyId] = useState(() => getAuthUser()?.companyId ?? null);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [companyErrors, setCompanyErrors] = useState({});
  const [creatingCompany, setCreatingCompany] = useState(false);

  useEffect(() => {
    if (companyId) return;
    const authUser = getAuthUser();
    if (!authUser?.profileId) return;

    setLoadingCompany(true);
    getRecruiter(authUser.profileId)
      .then((recruiter) => {
        setRecruiterProfile(recruiter);
        if (recruiter.positionTitle) {
          setCompanyForm((prev) => ({ ...prev, positionTitle: recruiter.positionTitle }));
        }
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

  const updateCompanyField = (field, value) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
    if (companyErrors[field]) setCompanyErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateRequired(companyForm.companyName)) nextErrors.companyName = 'Company name is required';
    if (!validateRequired(companyForm.industry)) nextErrors.industry = 'Industry is required';
    if (!validateRequired(companyForm.positionTitle)) nextErrors.positionTitle = 'Your position title is required';
    setCompanyErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setCreatingCompany(true);
    try {
      const company = await createCompany({
        companyName: companyForm.companyName.trim(),
        industry: companyForm.industry.trim(),
        website: companyForm.website.trim() || undefined,
      });

      const authUser = getAuthUser();
      const positionTitle = companyForm.positionTitle.trim();

      if (authUser?.profileId) {
        await updateRecruiter(authUser.profileId, {
          companyId: company.id,
          positionTitle: recruiterProfile?.positionTitle || positionTitle,
          department: recruiterProfile?.department,
        });
      } else {
        const recruiter = await createRecruiter({ companyId: company.id, positionTitle });
        updateAuthUser({ profileId: recruiter.id });
      }

      setCompanyId(company.id);
      updateAuthUser({ companyId: company.id });
      notify(`Company "${company.companyName}" created successfully.`, 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to create company.', 'error');
    } finally {
      setCreatingCompany(false);
    }
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

    const requiredSkills = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

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
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
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

  const skillsPreview = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <main className="page dashboard">
      <PageTitle
        title="Post New Job"
        subtitle="Create a clear, attractive job post for candidates"
        actions={<button className="btn-light" onClick={() => navigate('/employer-dashboard')}>Back to Dashboard</button>}
      />

      {loadingCompany && <p className="muted">Loading company info...</p>}

      {!loadingCompany && !companyId && (
        <DashboardSection title="Set Up Your Company">
          <p className="muted">You need a company profile before posting jobs. Fill in the details below.</p>
          <form className="settings-form" onSubmit={handleCreateCompany} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={(e) => updateCompanyField('companyName', e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className={companyErrors.companyName ? 'input-error' : ''}
                />
                {companyErrors.companyName && <span className="error-text">{companyErrors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(e) => updateCompanyField('industry', e.target.value)}
                  placeholder="e.g., Technology, Finance"
                  className={companyErrors.industry ? 'input-error' : ''}
                />
                {companyErrors.industry && <span className="error-text">{companyErrors.industry}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Your Position Title</label>
                <input
                  type="text"
                  value={companyForm.positionTitle}
                  onChange={(e) => updateCompanyField('positionTitle', e.target.value)}
                  placeholder="e.g., Hiring Manager, HR Director"
                  className={companyErrors.positionTitle ? 'input-error' : ''}
                />
                {companyErrors.positionTitle && <span className="error-text">{companyErrors.positionTitle}</span>}
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) => updateCompanyField('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
            <button type="submit" className="btn-dark" disabled={creatingCompany}>
              {creatingCompany ? 'Creating...' : 'Create Company & Continue'}
            </button>
          </form>
        </DashboardSection>
      )}

      {companyId && (
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
                <label>Required Skills</label>
                <input
                  type="text"
                  value={job.requiredSkills}
                  onChange={(e) => updateField('requiredSkills', e.target.value)}
                  placeholder="e.g., React, Node.js, TypeScript (comma-separated)"
                />
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
              {skillsPreview.length > 0 && (
                <div className="job-tags">
                  {skillsPreview.map((skill) => <span key={skill} className="tag-skill">{skill}</span>)}
                </div>
              )}
              <p className="job-description">{job.description || 'A concise job description will appear here as you type.'}</p>
              <p className="muted">{job.requirements || 'Requirements and expectations will appear here.'}</p>
            </article>
          </DashboardSection>
        </div>
      )}
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
