import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { validateEmail, validatePhone } from '../../utils/validation';
import { applyToJob, getJob } from '../../api/jobs';
import { getAuthUser } from '../../utils/authState';

const EXPERIENCE_LABEL = { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' };

function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

export default function JobApplicationPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { state } = useLocation();
  const [job, setJob] = useState(state?.job ?? null);
  const [formData, setFormData] = useState(() => {
    const authUser = getAuthUser();
    return {
      fullName: authUser?.fullName ?? '',
      email: authUser?.email ?? '',
      phone: '',
      location: '',
      linkedin: '',
      coverLetter: '',
    };
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!job && jobId) {
      getJob(jobId).then(setJob).catch(() => {});
    }
  }, [job, jobId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((current) => ({ ...current, [name]: files ? files[0] : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateApplication(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await applyToJob(jobId, { coverLetter: formData.coverLetter || undefined });
      notify(`Application submitted for ${job?.title ?? 'this job'}.`, 'success');
      navigate('/my-jobs');
    } catch (err) {
      notify(err.message ?? 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Apply for Job"
        subtitle="Fill in your information to apply for this position"
        actions={<button className="btn-light" onClick={() => navigate('/find-jobs')}>Back to Jobs</button>}
      />
      <div className="application-layout">
        <JobSummary job={job} />
        <ApplicationForm
          formData={formData}
          errors={errors}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/find-jobs')}
        />
      </div>
    </main>
  );
}

function JobSummary({ job }) {
  if (!job) {
    return (
      <DashboardSection title="Selected Job">
        <p className="muted">Job details were not found. You can still complete the application form.</p>
      </DashboardSection>
    );
  }

  const experience = EXPERIENCE_LABEL[job.experienceLevel] ?? '';
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <DashboardSection title="Selected Job">
      <div className="job-application-summary">
        <h4>{job.title}</h4>
        <div className="job-details">
          {job.location && <span className="detail">{job.location}</span>}
          {experience && <span className="detail">{experience}</span>}
          <span className="detail">{salary}/year</span>
        </div>
        <p className="muted">{job.description}</p>
      </div>
    </DashboardSection>
  );
}

function ApplicationForm({ formData, errors, submitting, onChange, onSubmit, onCancel }) {
  return (
    <DashboardSection title="Your Information">
      <form className="application-form" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <FormField name="fullName" label="Full Name" placeholder="Your full name" value={formData.fullName} error={errors.fullName} onChange={onChange} />
          <FormField name="email" type="email" label="Email" placeholder="you@example.com" value={formData.email} error={errors.email} onChange={onChange} />
        </div>
        <div className="form-row">
          <FormField name="phone" label="Phone Number" placeholder="+374..." value={formData.phone} error={errors.phone} onChange={onChange} />
          <FormField name="location" label="Location" placeholder="Yerevan, Armenia" value={formData.location} error={errors.location} onChange={onChange} />
        </div>
        <FormField name="linkedin" label="LinkedIn / Portfolio" placeholder="https://..." value={formData.linkedin} onChange={onChange} />
        <div className="form-group">
          <label>Cover Letter</label>
          <textarea
            name="coverLetter"
            placeholder="Tell the employer why you are a strong fit..."
            rows="5"
            value={formData.coverLetter}
            onChange={onChange}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-dark" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
          <button type="button" className="btn-light" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </DashboardSection>
  );
}

function FormField({ name, label, value, error, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} className={error ? 'input-error' : ''} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function validateApplication(formData) {
  const nextErrors = {};
  if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required';
  if (!validateEmail(formData.email)) nextErrors.email = 'Please enter a valid email address';
  if (!formData.phone.trim()) {
    nextErrors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    nextErrors.phone = 'Enter a valid phone number';
  }
  if (!formData.location.trim()) nextErrors.location = 'Location is required';
  return nextErrors;
}
