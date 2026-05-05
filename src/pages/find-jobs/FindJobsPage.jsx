import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FindJobsPage.style.css';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { allJobs } from '../../data/jobs';
import { getAppliedJobs } from '../../utils/applications';
import { notify } from '../../utils/notifications';
import { saveJob } from '../../utils/savedJobs';

const locations = ['Yerevan', 'Remote'];
const experiences = ['Junior', 'Mid', 'Senior'];

const tips = [
  ['🔍 Refine Your Search', 'Use specific keywords and filters to find jobs that match your skills'],
  ['⭐ Complete Your Profile', 'A complete profile increases your visibility to recruiters and improves matches'],
  ['💾 Save Your Favorites', 'Bookmark jobs to review later or set alerts for similar positions'],
  ['📧 Get Notifications', 'Enable notifications to stay updated on new jobs matching your preferences'],
];

export default function FindJobsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState(allJobs[0]?.id);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    setAppliedJobIds(getAppliedJobs().map((application) => String(application.jobId || application.id)));
  }, []);

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === '' || job.location === locationFilter;
    const matchesExperience = experienceFilter === 'all' || job.experience === experienceFilter;
    return matchesSearch && matchesLocation && matchesExperience;
  });

  const selectedJob = filteredJobs.find((job) => job.id === selectedJobId) || filteredJobs[0] || allJobs[0];

  return (
    <main className="page dashboard">
      <PageTitle title="Find Your Next Opportunity" subtitle="Discover jobs that match your skills and experience" />
      <JobSearchPanel
        searchQuery={searchQuery}
        locationFilter={locationFilter}
        experienceFilter={experienceFilter}
        filteredJobs={filteredJobs}
        selectedJob={selectedJob}
        appliedJobIds={appliedJobIds}
        onSearchChange={setSearchQuery}
        onLocationChange={setLocationFilter}
        onExperienceChange={setExperienceFilter}
        onSelectJob={setSelectedJobId}
        onApply={(job) => navigate(`/apply/${job.id}`, { state: { job } })}
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
        <SelectedJobDescription job={props.selectedJob} isApplied={props.appliedJobIds.includes(String(props.selectedJob?.id))} onApply={props.onApply} />
      </aside>
      <div className="job-search-form">
        <div className="search-summary">
          <p className="muted">{props.filteredJobs.length} jobs found</p>
        </div>
        <JobResults jobs={props.filteredJobs} selectedJobId={props.selectedJob?.id} appliedJobIds={props.appliedJobIds} onSelectJob={props.onSelectJob} onApply={props.onApply} />
      </div>
    </div>
  );
}

function SearchFilters({ searchQuery, locationFilter, experienceFilter, onSearchChange, onLocationChange, onExperienceChange }) {
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
        {isApplied && <span className="applied-check">✓ Applied</span>}
      </div>
      <p className="company">{job.company}</p>
      <p className="muted">{job.description}</p>
      <div className="job-details stacked">
        <span className="detail">📍 {job.location}</span>
        <span className="detail">🎯 {job.experience}</span>
        <span className="detail">💰 {job.salary}/year</span>
      </div>
      <button className="btn-dark full" disabled={isApplied} onClick={() => onApply(job)}>{isApplied ? 'Already Applied' : 'Apply to This Job'}</button>
    </div>
  );
}

function JobResults({ jobs, selectedJobId, appliedJobIds, onSelectJob, onApply }) {
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
          onSelectJob={onSelectJob}
          onApply={onApply}
        />
      ))}
    </div>
  );
}

function JobListingCard({ job, isSelected, isApplied, onSelectJob, onApply }) {
  return (
    <div className={`job-listing-card ${isSelected ? 'selected' : ''} ${isApplied ? 'applied' : ''}`} onClick={() => onSelectJob(job.id)}>
      <div className="job-header">
        <div className="job-title-section">
          <h4>{job.title}</h4>
          <p className="company">{job.company}</p>
        </div>
        {isApplied && <span className="applied-checkbox" aria-label="Applied">✓</span>}
        <span className="match-badge">
          <span className="match-score">{job.matchScore}%</span>
          <p className="muted small">Match</p>
        </span>
      </div>
      <div className="job-details">
        <span className="detail">📍 {job.location}</span>
        <span className="detail">🎯 {job.experience}</span>
        <span className="detail">💰 {job.salary}/year</span>
      </div>
      <p className="job-description">{job.description}</p>
      <div className="job-tags">
        <span className="tag-skill">{experienceLabel(job.experience)}</span>
        <span className="tag-skill">Full-time</span>
      </div>
      <div className="job-footer">
        <button className="btn-dark" disabled={isApplied} onClick={(e) => { e.stopPropagation(); onApply(job); }}>{isApplied ? 'Applied' : 'Apply Now'}</button>
        <button className="btn-light" onClick={(e) => { e.stopPropagation(); saveJob(job); notify(`${job.title} saved to your jobs.`, 'success'); }}>Save Job</button>
      </div>
    </div>
  );
}

function experienceLabel(experience) {
  if (experience === 'Senior') return 'Leadership';
  if (experience === 'Mid') return 'Growth';
  return 'Learning';
}

function JobSearchTips() {
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
}
