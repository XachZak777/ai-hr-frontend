import { DashboardSection } from '../../../components/CommonBlocks';

export default function CandidatesTab() {
  return (
    <DashboardSection title="Candidate Management">
      <div className="empty-state">
        <h4>No candidates yet</h4>
        <p className="muted">Candidates who apply to your jobs will appear here.</p>
      </div>
    </DashboardSection>
  );
}
