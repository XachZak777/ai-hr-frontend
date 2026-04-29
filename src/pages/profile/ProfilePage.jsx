import { useState } from 'react';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getUserPreferences, getUserProfile, saveUserPreferences, saveUserProfile } from '../../utils/profile';

const roleLabels = {
  admin: 'Administrator',
  employer: 'Employer',
  employee: 'Job Seeker',
};

export default function ProfilePage({ userRole = 'employee' }) {
  const [profile, setProfile] = useState(() => getUserProfile(userRole));
  const [preferences, setPreferences] = useState(() => getUserPreferences(userRole));

  const handleProfileChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handlePreferenceChange = (field) => {
    setPreferences((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveUserProfile(userRole, profile);
    saveUserPreferences(userRole, preferences);
    notify('Profile settings saved.', 'success');
  };

  return (
    <main className="page dashboard">
      <PageTitle title="Profile Settings" subtitle="Manage your account details and preferences" />
      <div className="settings-layout">
        <DashboardSection title="Account">
          <div className="profile-card">
            <div className="avatar large-avatar">{initials(profile.name)}</div>
            <div>
              <h3>{profile.name}</h3>
              <p className="muted">{roleLabels[userRole] || 'User'}</p>
              <p className="muted">{profile.headline}</p>
            </div>
          </div>
        </DashboardSection>
        <DashboardSection title="Personal Information">
          <form className="settings-form" onSubmit={handleSave}>
            <div className="form-row">
              <Field label="Name" value={profile.name} onChange={(value) => handleProfileChange('name', value)} />
              <Field label="Email" type="email" value={profile.email} onChange={(value) => handleProfileChange('email', value)} />
            </div>
            <div className="form-row">
              <Field label="Phone" value={profile.phone} onChange={(value) => handleProfileChange('phone', value)} />
              <Field label="Location" value={profile.location} onChange={(value) => handleProfileChange('location', value)} />
            </div>
            <Field label="Organization / Status" value={profile.organization} onChange={(value) => handleProfileChange('organization', value)} />
            <Field label="Headline" value={profile.headline} onChange={(value) => handleProfileChange('headline', value)} />
            <Field label="LinkedIn / Portfolio" value={profile.linkedin} onChange={(value) => handleProfileChange('linkedin', value)} />
            <Field label="Skills" value={profile.skills} onChange={(value) => handleProfileChange('skills', value)} />
            <div className="form-group">
              <label>Summary</label>
              <textarea rows="4" value={profile.summary} onChange={(e) => handleProfileChange('summary', e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn-dark">Save Profile</button>
          </form>
        </DashboardSection>
        <DashboardSection title="Preferences">
          <div className="preference-list">
            <Preference label="Email updates" checked={preferences.emailUpdates} onChange={() => handlePreferenceChange('emailUpdates')} />
            <Preference label="Application alerts" checked={preferences.applicationAlerts} onChange={() => handlePreferenceChange('applicationAlerts')} />
            <Preference label="Weekly summary" checked={preferences.weeklySummary} onChange={() => handlePreferenceChange('weeklySummary')} />
          </div>
        </DashboardSection>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Preference({ label, checked, onChange }) {
  return (
    <label className="preference-item">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
