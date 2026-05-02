import { useEffect, useState } from 'react';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import './ProfilePage.style.css';
import { notify } from '../../utils/notifications';
import { validateEmail, validatePhone, validateUrl, validateRequired } from '../../utils/validation';
import { getUser, updateUser } from '../../api/users';
import { getCandidate, updateCandidate, createCandidate } from '../../api/candidates';
import { getRecruiter, updateRecruiter, createRecruiter } from '../../api/recruiters';
import { getAuthUser, updateAuthUser } from '../../utils/authState';

const roleLabels = {
  admin: 'Administrator',
  employer: 'Employer',
  employee: 'Job Seeker',
};

const emptyUserForm = { fullName: '', email: '' };
const emptyCandidateForm = { phone: '', location: '', linkedinUrl: '', skills: '' };
const emptyRecruiterForm = { positionTitle: '', department: '' };

export default function ProfilePage({ userRole = 'employee' }) {
  const authUser = getAuthUser();
  const [userForm, setUserForm] = useState({ fullName: authUser?.fullName ?? '', email: authUser?.email ?? '' });
  const [roleProfile, setRoleProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUser?.profileId) return;
    const fetcher = userRole === 'employee' ? getCandidate : getRecruiter;
    fetcher(authUser.profileId)
      .then((profile) => setRoleProfile(profile))
      .catch(() => {});
  }, [authUser?.profileId, userRole]);

  const handleUserChange = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleRoleChange = (field, value) => {
    setRoleProfile((prev) => ({ ...(prev ?? {}), [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateRequired(userForm.fullName)) nextErrors.fullName = 'Name is required';
    if (userForm.email && !validateEmail(userForm.email)) nextErrors.email = 'Enter a valid email address';
    if (roleProfile?.phone && !validatePhone(roleProfile.phone)) nextErrors.phone = 'Enter a valid phone number';
    if (roleProfile?.linkedinUrl && !validateUrl(roleProfile.linkedinUrl)) nextErrors.linkedinUrl = 'Enter a valid URL starting with https://';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await updateUser(authUser.userId, { fullName: userForm.fullName, email: userForm.email });
      updateAuthUser({ fullName: userForm.fullName, email: userForm.email });

      if (userRole === 'employee' || userRole === 'employer') {
        const profileBody = userRole === 'employee'
          ? { phone: roleProfile?.phone, location: roleProfile?.location, linkedinUrl: roleProfile?.linkedinUrl, skills: parseSkills(roleProfile?.skills) }
          : { positionTitle: roleProfile?.positionTitle, department: roleProfile?.department };

        if (authUser.profileId) {
          const updater = userRole === 'employee' ? updateCandidate : updateRecruiter;
          await updater(authUser.profileId, profileBody);
        } else {
          const creator = userRole === 'employee' ? createCandidate : createRecruiter;
          const created = await creator(profileBody);
          updateAuthUser({ profileId: created.id });
        }
      }

      notify('Profile settings saved.', 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page dashboard">
      <PageTitle title="Profile Settings" subtitle="Manage your account details and preferences" />
      <div className="settings-layout">
        <DashboardSection title="Account">
          <div className="profile-card">
            <div className="avatar large-avatar">{initials(userForm.fullName)}</div>
            <div>
              <h3>{userForm.fullName || 'Your Name'}</h3>
              <p className="muted">{roleLabels[userRole] || 'User'}</p>
            </div>
          </div>
        </DashboardSection>
        <DashboardSection title="Personal Information">
          <form className="settings-form" onSubmit={handleSave} noValidate>
            <div className="form-row">
              <Field label="Full Name" value={userForm.fullName} onChange={(v) => handleUserChange('fullName', v)} error={errors.fullName} />
              <Field label="Email" type="email" value={userForm.email} onChange={(v) => handleUserChange('email', v)} error={errors.email} />
            </div>
            {userRole === 'employee' && (
              <CandidateFields profile={roleProfile} errors={errors} onChange={handleRoleChange} />
            )}
            {userRole === 'employer' && (
              <RecruiterFields profile={roleProfile} onChange={handleRoleChange} />
            )}
            <button type="submit" className="btn-dark" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </DashboardSection>
      </div>
    </main>
  );
}

function CandidateFields({ profile, errors, onChange }) {
  return (
    <>
      <div className="form-row">
        <Field label="Phone" value={profile?.phone ?? ''} onChange={(v) => onChange('phone', v)} error={errors.phone} />
        <Field label="Location" value={profile?.location ?? ''} onChange={(v) => onChange('location', v)} />
      </div>
      <Field label="LinkedIn / Portfolio" value={profile?.linkedinUrl ?? ''} onChange={(v) => onChange('linkedinUrl', v)} error={errors.linkedinUrl} />
      <Field label="Skills (comma separated)" value={Array.isArray(profile?.skills) ? profile.skills.join(', ') : (profile?.skills ?? '')} onChange={(v) => onChange('skills', v)} />
    </>
  );
}

function RecruiterFields({ profile, onChange }) {
  return (
    <div className="form-row">
      <Field label="Position Title" value={profile?.positionTitle ?? ''} onChange={(v) => onChange('positionTitle', v)} />
      <Field label="Department" value={profile?.department ?? ''} onChange={(v) => onChange('department', v)} />
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', error = '' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={error ? 'input-error' : ''} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
}

function parseSkills(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}
