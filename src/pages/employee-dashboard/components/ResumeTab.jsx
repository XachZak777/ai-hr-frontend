import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';

export default function ResumeTab({ profile }) {
  const navigate = useNavigate();

  return (
    <DashboardSection title="My Resume & Profile">
      <div className="resume-section">
        <ResumeCard profile={profile} navigate={navigate} />
        <ProfileSections profile={profile} navigate={navigate} />
      </div>
    </DashboardSection>
  );
}

function ResumeCard({ profile, navigate }) {
  return (
    <div className="resume-card">
      <h4>📄 Resume</h4>
      <p className="muted">{profile.name}'s job seeker profile</p>
      <div className="resume-actions">
        <button className="btn-light" onClick={() => navigate('/profile')}>View</button>
        <button className="btn-light" onClick={() => navigate('/profile')}>Update</button>
        <button className="btn-light" onClick={() => notify('Profile export prepared.', 'success')}>Download</button>
      </div>
    </div>
  );
}

function ProfileSections({ profile, navigate }) {
  const skills = profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean);

  return (
    <div className="profile-sections">
      <div className="section-card">
        <h4>Professional Summary</h4>
        <p className="muted">{profile.summary || 'No summary added. This helps employers understand your background better.'}</p>
        <button className="btn-light" onClick={() => navigate('/profile')}>Edit Summary</button>
      </div>
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
        <p className="muted">{profile.email}</p>
        <p className="muted">{profile.phone}</p>
        <p className="muted">{profile.location}</p>
      </div>
    </div>
  );
}
