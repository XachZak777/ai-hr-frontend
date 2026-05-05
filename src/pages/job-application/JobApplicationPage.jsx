import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { saveAppliedJob } from '../../utils/applications';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';
import { validateEmail, validatePhone } from '../../utils/validation';
import { allJobs } from '../../data/jobs';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  coverLetter: '',
  cv: null,
};

export default function JobApplicationPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { state } = useLocation();
  const [formData, setFormData] = useState(() => {
    const profile = getUserProfile('employee');
    return {
      ...initialFormData,
      fullName: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      linkedin: profile.linkedin || '',
      coverLetter: profile.summary || '',
    };
  });
  const [errors, setErrors] = useState({});

  const job = useMemo(() => {
    return state?.job || allJobs.find((item) => String(item.id) === jobId);
  }, [jobId, state]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateApplication(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    saveAppliedJob(createApplicationRecord(job, formData, jobId));
    notify(`Application submitted for ${job?.title || 'this job'}.`, 'success');
    navigate('/my-jobs');
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Apply for Job"
        subtitle="Fill in your information and upload your CV"
        actions={<button className="btn-light" onClick={() => navigate('/find-jobs')}>Back to Jobs</button>}
      />
      <div className="application-layout">
        <JobSummary job={job} />
        <ApplicationForm
          formData={formData}
          errors={errors}
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

  return (
    <DashboardSection title="Selected Job">
      <div className="job-application-summary">
        <h4>{job.title}</h4>
        <p className="company">{job.company}</p>
        <div className="job-details">
          <span className="detail">📍 {job.location}</span>
          <span className="detail">🎯 {job.experience}</span>
          <span className="detail">💰 {job.salary}/year</span>
        </div>
        <p className="muted">{job.description}</p>
        <span className="match-score">{job.matchScore}% match</span>
      </div>
    </DashboardSection>
  );
}

function ApplicationForm({ formData, errors, onChange, onSubmit, onCancel }) {
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
          <textarea name="coverLetter" placeholder="Tell the employer why you are a strong fit..." rows="5" value={formData.coverLetter} onChange={onChange}></textarea>
        </div>
        <div className="form-group">
          <label>Upload CV</label>
          <input name="cv" type="file" accept=".pdf,.doc,.docx" onChange={onChange} className={errors.cv ? 'input-error' : ''} />
          {formData.cv && <span className="file-name">{formData.cv.name}</span>}
          {errors.cv && <span className="error-text">{errors.cv}</span>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-dark">Submit Application</button>
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
  if (!formData.cv) nextErrors.cv = 'Please upload your CV';

  return nextErrors;
}

function createApplicationRecord(job, formData, jobId) {
  const submittedJob = job || {};

  return {
    id: String(submittedJob.id || jobId || Date.now()),
    jobId: submittedJob.id || jobId,
    jobTitle: submittedJob.title || 'Selected Job',
    company: submittedJob.company || 'Company',
    description: submittedJob.description || 'Job description was not provided.',
    location: submittedJob.location || formData.location,
    experience: submittedJob.experience || 'Not specified',
    salary: submittedJob.salary || 'Not specified',
    matchScore: submittedJob.matchScore || null,
    status: 'Submitted',
    applicantName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    cvName: formData.cv?.name || 'Uploaded CV',
    appliedAt: new Date().toLocaleDateString(),
  };
}
