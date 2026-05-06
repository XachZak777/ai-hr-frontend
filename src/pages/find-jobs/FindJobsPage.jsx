import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FindJobsPage.style.css';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { listJobs, listMyApplications, listSavedJobs, saveJob as apiSaveJob, unsaveJob } from '../../api/jobs';
import { notify } from '../../utils/notifications';

const EXPERIENCE_LABEL = { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' };

function experienceLevelLabel(level) {
  return EXPERIENCE_LABEL[level] ?? 'Mid';
}

function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

function adaptJob(job) {
  return {
    ...job,
    experience: experienceLevelLabel(job.experienceLevel),
    salary: formatSalary(job.salaryMin, job.salaryMax),
  };
}

const experiences = ['Entry', 'Mid', 'Senior', 'Lead'];

const tips = [
  ['Refine Your Search', 'Use specific keywords and filters to find jobs that match your skills'],
  ['Complete Your Profile', 'A complete profile increases your visibility to recruiters and improves matches'],
  ['Save Your Favorites', 'Bookmark jobs to review later or set alerts for similar positions'],
  ['Get Notifications', 'Enable notifications to stay updated on new jobs matching your preferences'],
];

export default function FindJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    Promise.all([
      listJobs({ size: 50 }),
      listMyApplications({ size: 100 }).catch(() => ({ content: [] })),
      listSavedJobs({ size: 100 }).catch(() => ({ content: [] })),
    ])
      .then(([jobsPage, appsPage, savedPage]) => {
        const adapted = (jobsPage.content ?? []).map(adaptJob);
        setJobs(adapted);
        setSelectedJobId(adapted[0]?.id ?? null);
        setAppliedJobIds((appsPage.content ?? []).map((a) => String(a.jobId)));
        setSavedJobIds((savedPage.content ?? []).map((s) => String(s.jobId)));
      })
      .catch(() => notify('Failed to load jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const locations = useMemo(
    () => [...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(q) || (job.location ?? '').toLowerCase().includes(q);
      const matchesLocation = locationFilter === '' || job.location === locationFilter;
      const matchesExperience = experienceFilter === 'all' || job.experience === experienceFilter;
      return matchesSearch && matchesLocation && matchesExperience;
    });
  }, [jobs, searchQuery, locationFilter, experienceFilter]);

  const selectedJob = useMemo(
    () => filteredJobs.find((j) => j.id === selectedJobId) ?? filteredJobs[0],
    [filteredJobs, selectedJobId]
  );

  const handleSaveJob = async (job) => {
    const isSaved = savedJobIds.includes(String(job.id));
    try {
      if (isSaved) {
        await unsaveJob(job.id);
        setSavedJobIds((prev) => prev.filter((id) => id !== String(job.id)));
        notify(`${job.title} removed from saved jobs.`, 'success');
      } else {
        await apiSaveJob(job.id);
        setSavedJobIds((prev) => [...prev, String(job.id)]);
        notify(`${job.title} saved to your jobs.`, 'success');
      }
    } catch {
      notify('Could not update saved jobs.', 'error');
    }
  };

  if (loading) {
    return (
      <main className="page dashboard">
        <PageTitle title="Find Your Next Opportunity" subtitle="Loading available jobs..." />
      </main>
    );
  }

  return (
    <main className="page dashboard">
      <PageTitle title="Find Your Next Opportunity" subtitle="Discover jobs that match your skills and experience" />
      <JobSearchPanel
        searchQuery={searchQuery}
        locationFilter={locationFilter}
        experienceFilter={experienceFilter}
        locations={locations}
        filteredJobs={filteredJobs}
        selectedJob={selectedJob}
        appliedJobIds={appliedJobIds}
        savedJobIds={savedJobIds}
        onSearchChange={setSearchQuery}
        onLocationChange={setLocationFilter}
        onExperienceChange={setExperienceFilter}
        onSelectJob={setSelectedJobId}
        onApply={(job) => navigate(`/apply/${job.id}`, { state: { job } })}
        onSaveJob={handleSaveJob}
      />
      <JobSearchTips />
    </main>
  );
}

function JobSearchPanel(props) {
  return (
    <div className="job-search-shell">
      <aside className="job-left-panel">
        <h3>Search Jobs</h3>
        <SearchFilters {...props} />
        <SelectedJobDescription
          job={props.selectedJob}
          isApplied={props.appliedJobIds.includes(String(props.selectedJob?.id))}
          onApply={props.onApply}
        />
      </aside>
      <div className="job-search-form">
        <div className="search-summary">
          <p className="muted">{props.filteredJobs.length} jobs found</p>
        </div>
        <JobResults
          jobs={props.filteredJobs}
          selectedJobId={props.selectedJob?.id}
          appliedJobIds={props.appliedJobIds}
          savedJobIds={props.savedJobIds}
          onSelectJob={props.onSelectJob}
          onApply={props.onApply}
          onSaveJob={props.onSaveJob}
        />
      </div>
    </div>
  );
}

function SearchFilters({ searchQuery, locationFilter, experienceFilter, locations, onSearchChange, onLocationChange, onExperienceChange }) {
  return (
    <div className="search-inputs">
      <input type="text" placeholder="Job title or keyword..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
      <select value={locationFilter} onChange={(e) => onLocationChange(e.target.value)}>
        <option value="">All Locations</option>
        {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <select value={experienceFilter} onChange={(e) => onExperienceChange(e.target.value)}>
        <option value="all">All Levels</option>
        {experiences.map((exp) => <option key={exp} value={exp}>{exp}</option>)}
      </select>
    </div>
  );
}

function SelectedJobDescription({ job, isApplied, onApply }) {
  if (!job) return null;

  return (
    <div className="selected-job-description">
      <div className="row-between">
        <h4>{job.title}</h4>
        {isApplied && <span className="applied-check">Applied</span>}
      </div>
      <div className="job-details stacked">
        <span className="detail">{job.location}</span>
        <span className="detail">{job.experience}</span>
        <span className="detail">{job.salary}/year</span>
      </div>
      <p className="muted">{job.description}</p>
      <button className="btn-dark full" disabled={isApplied} onClick={() => onApply(job)}>
        {isApplied ? 'Already Applied' : 'Apply to This Job'}
      </button>
    </div>
  );
}

function JobResults({ jobs, selectedJobId, appliedJobIds, savedJobIds, onSelectJob, onApply, onSaveJob }) {
  if (jobs.length === 0) {
    return (
      <div className="no-results">
        <p>No jobs found matching your criteria. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="job-listings">
      {jobs.map((job) => (
        <JobListingCard
          key={job.id}
          job={job}
          isSelected={job.id === selectedJobId}
          isApplied={appliedJobIds.includes(String(job.id))}
          isSaved={savedJobIds.includes(String(job.id))}
          onSelectJob={onSelectJob}
          onApply={onApply}
          onSaveJob={onSaveJob}
        />
      ))}
    </div>
  );
}

function JobListingCard({ job, isSelected, isApplied, isSaved, onSelectJob, onApply, onSaveJob }) {
  return (
    <div
      className={`job-listing-card ${isSelected ? 'selected' : ''} ${isApplied ? 'applied' : ''}`}
      onClick={() => onSelectJob(job.id)}
    >
      <div className="job-header">
        <div className="job-title-section">
          <h4>{job.title}</h4>
        </div>
        {isApplied && <span className="applied-checkbox" aria-label="Applied">Applied</span>}
      </div>
      <div className="job-details">
        <span className="detail">{job.location}</span>
        <span className="detail">{job.experience}</span>
        <span className="detail">{job.salary}/year</span>
      </div>
      <p className="job-description">{job.description}</p>
      <div className="job-tags">
        <span className="tag-skill">{job.experience}</span>
        <span className="tag-skill">Full-time</span>
      </div>
      <div className="job-footer">
        <button className="btn-dark" disabled={isApplied} onClick={(e) => { e.stopPropagation(); onApply(job); }}>
          {isApplied ? 'Applied' : 'Apply Now'}
        </button>
        <button className="btn-light" onClick={(e) => { e.stopPropagation(); onSaveJob(job); }}>
          {isSaved ? 'Saved' : 'Save Job'}
        </button>
      </div>
    </div>
  );
}

const JobSearchTips = memo(function JobSearchTips() {
  return (
    <DashboardSection title="Job Search Tips">
      <div className="tips-grid">
        {tips.map(([title, description]) => (
          <div key={title} className="tip-card">
            <h4>{title}</h4>
            <p className="muted">{description}</p>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
});
