import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { getDisplayName } from '../../../utils/authState';

export default function ResumeTab({ candidateProfile }) {
  const navigate = useNavigate();
  const displayName = getDisplayName();

  return (
    <DashboardSection title="My Resume & Profile">
      <div className="resume-section">
        <ResumeCard displayName={displayName} navigate={navigate} />
        <ProfileSections profile={candidateProfile} navigate={navigate} />
      </div>
    </DashboardSection>
  );
}

function ResumeCard({ displayName, navigate }) {
  return (
    <div className="resume-card">
      <h4>📄 Resume</h4>
      <p className="muted">{displayName}'s job seeker profile</p>
      <div className="resume-actions">
        <button className="btn-light" onClick={() => navigate('/profile')}>View</button>
        <button className="btn-light" onClick={() => navigate('/profile')}>Update</button>
        <button className="btn-light" onClick={() => notify('Profile export prepared.', 'success')}>Download</button>
      </div>
    </div>
  );
}

function ProfileSections({ profile, navigate }) {
  const skills = profile?.skills ?? [];

  return (
    <div className="profile-sections">
      <div className="section-card">
        <h4>Skills</h4>
        <div className="skills-list">
          {skills.length > 0
            ? skills.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)
            : <p className="muted">No skills added yet.</p>}
          <button className="btn-light small" onClick={() => navigate('/profile')}>+ Add Skill</button>
        </div>
      </div>
      <div className="section-card">
        <h4>Contact</h4>
        {profile?.phone && <p className="muted">{profile.phone}</p>}
        {profile?.location && <p className="muted">{profile.location}</p>}
        {!profile?.phone && !profile?.location && (
          <p className="muted">Complete your profile to add contact details.</p>
        )}
      </div>
    </div>
  );
}
