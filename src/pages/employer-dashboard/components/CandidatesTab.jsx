import { useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { recentApplications, CandidateProfilePanel } from './OverviewTab';

export default function CandidatesTab() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <DashboardSection title="Candidate Management">
      <div className="candidates-grid">
        {recentApplications.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <div className="candidate-header">
              <h4>{candidate.name}</h4>
              <span className="match-score">{candidate.matchScore}</span>
            </div>
            <p className="muted">{candidate.position}</p>
            <button className="btn-dark" onClick={() => setSelectedProfile(candidate)}>
              View Full Profile
            </button>
          </div>
        ))}
      </div>
      {selectedProfile && (
        <CandidateProfilePanel candidate={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </DashboardSection>
  );
}
