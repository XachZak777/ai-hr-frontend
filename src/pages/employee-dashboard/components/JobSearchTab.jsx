import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { allJobs } from '../../../data/jobs';

export default function JobSearchTab({ profile }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(profile.location || '');
  const [experience, setExperience] = useState('all');

  const filteredJobs = allJobs.filter((job) => {
    const search = query.toLowerCase();
    const matchesQuery = !query || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search);
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesExperience = experience === 'all' || job.experience === experience;
    return matchesQuery && matchesLocation && matchesExperience;
  });

  return (
    <DashboardSection title="Find Your Next Opportunity">
      <div className="job-search-form">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Job title or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select value={experience} onChange={(e) => setExperience(e.target.value)}>
            <option value="all">Experience Level</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
          <button className="btn-dark" onClick={() => navigate('/find-jobs')}>Search Jobs</button>
        </div>
        <div className="search-results">
          <h4>Latest Matches</h4>
          {filteredJobs.map((job) => (
            <div key={job.id} className="search-result-item">
              <div>
                <h5>{job.title}</h5>
                <p className="company">{job.company}</p>
                <p className="muted">Salary: {job.salary}/year</p>
              </div>
              <button
                className="btn-dark"
                onClick={() => navigate(`/apply/${job.id}`, { state: { job } })}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}
