import { useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { validateRequired, validateMinLength } from '../../../utils/validation';

export default function JobPostsTab({ jobs, setJobs, jobTitle, jobDescription, setJobTitle, setJobDescription, onPostJob }) {
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
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateRequired(jobTitle)) nextErrors.jobTitle = 'Job title is required';
    if (!validateMinLength(jobDescription, 30)) {
      nextErrors.jobDescription = jobDescription.trim().length === 0
        ? 'Job description is required'
        : 'Description must be at least 30 characters';
    }
    if (!validateRequired(location)) nextErrors.location = 'Location is required';
    if (!validateRequired(salary)) nextErrors.salary = 'Salary range is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(e);
    setLocation('');
    setSalary('');
    setErrors({});
  };

  return (
    <div className="job-form">
      <h4>Post New Job</h4>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            placeholder="e.g., Senior Developer"
            value={jobTitle}
            onChange={(e) => { setJobTitle(e.target.value); if (errors.jobTitle) setErrors((v) => ({ ...v, jobTitle: '' })); }}
            className={errors.jobTitle ? 'input-error' : ''}
          />
          {errors.jobTitle && <span className="error-text">{errors.jobTitle}</span>}
        </div>
        <div className="form-group">
          <label>Job Description</label>
          <textarea
            placeholder="Enter job description, requirements, and benefits..."
            rows="6"
            value={jobDescription}
            onChange={(e) => { setJobDescription(e.target.value); if (errors.jobDescription) setErrors((v) => ({ ...v, jobDescription: '' })); }}
            className={errors.jobDescription ? 'input-error' : ''}
          />
          {errors.jobDescription && <span className="error-text">{errors.jobDescription}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Yerevan, Armenia"
              value={location}
              onChange={(e) => { setLocation(e.target.value); if (errors.location) setErrors((v) => ({ ...v, location: '' })); }}
              className={errors.location ? 'input-error' : ''}
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>
          <div className="form-group">
            <label>Salary Range</label>
            <input
              type="text"
              placeholder="$50k - $80k"
              value={salary}
              onChange={(e) => { setSalary(e.target.value); if (errors.salary) setErrors((v) => ({ ...v, salary: '' })); }}
              className={errors.salary ? 'input-error' : ''}
            />
            {errors.salary && <span className="error-text">{errors.salary}</span>}
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
