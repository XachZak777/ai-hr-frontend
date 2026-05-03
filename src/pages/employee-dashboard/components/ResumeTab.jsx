import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';
import { getMyCv, updateCv } from '../../../api/candidates';
import { getDisplayName } from '../../../utils/authState';

export default function ResumeTab({ candidateProfile }) {
  const navigate = useNavigate();
  const displayName = getDisplayName();

  return (
    <div className="resume-section">
      <DashboardSection title="Profile Overview">
        <div className="resume-card">
          <h4>Resume</h4>
          <p className="muted">{displayName}'s job seeker profile</p>
          <div className="resume-actions">
            <button className="btn-light" onClick={() => navigate('/profile')}>Edit Profile</button>
          </div>
        </div>
        <div className="profile-sections">
          <div className="section-card">
            <h4>Skills</h4>
            <div className="skills-list">
              {(candidateProfile?.skills ?? []).length > 0
                ? candidateProfile.skills.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)
                : <p className="muted">No skills added yet. <button className="btn-light small" onClick={() => navigate('/profile')}>Add skills</button></p>}
            </div>
          </div>
          <div className="section-card">
            <h4>Contact</h4>
            {candidateProfile?.phone && <p className="muted">{candidateProfile.phone}</p>}
            {candidateProfile?.location && <p className="muted">{candidateProfile.location}</p>}
            {candidateProfile?.resumeUrl && <p className="muted"><a href={candidateProfile.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>}
            {!candidateProfile?.phone && !candidateProfile?.location && (
              <p className="muted">Complete your profile to add contact details.</p>
            )}
          </div>
        </div>
      </DashboardSection>
      <CvEditor />
    </div>
  );
}

function CvEditor() {
  const [cv, setCv] = useState({
    summary: '',
    workExperiences: [],
    educations: [],
    certifications: [],
    languages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyCv()
      .then((data) => {
        if (data) {
          setCv({
            summary: data.summary ?? '',
            workExperiences: data.workExperiences ?? [],
            educations: data.educations ?? [],
            certifications: data.certifications ?? [],
            languages: data.languages ?? [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCv(cv);
      notify('CV saved successfully.', 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to save CV.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addEntry = (section, entry) =>
    setCv((prev) => ({ ...prev, [section]: [...prev[section], entry] }));
  const removeEntry = (section, idx) =>
    setCv((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));

  if (loading) {
    return (
      <DashboardSection title="CV Editor">
        <p className="muted">Loading CV...</p>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="CV Editor">
      <div className="form-group">
        <label>Professional Summary</label>
        <textarea
          rows="4"
          value={cv.summary}
          onChange={(e) => setCv((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="A brief overview of your professional background and goals..."
        />
      </div>

      <WorkExperienceSection
        items={cv.workExperiences}
        onAdd={(entry) => addEntry('workExperiences', entry)}
        onRemove={(idx) => removeEntry('workExperiences', idx)}
      />
      <EducationSection
        items={cv.educations}
        onAdd={(entry) => addEntry('educations', entry)}
        onRemove={(idx) => removeEntry('educations', idx)}
      />
      <CertificationSection
        items={cv.certifications}
        onAdd={(entry) => addEntry('certifications', entry)}
        onRemove={(idx) => removeEntry('certifications', idx)}
      />
      <LanguageSection
        items={cv.languages}
        onAdd={(entry) => addEntry('languages', entry)}
        onRemove={(idx) => removeEntry('languages', idx)}
      />

      <button className="btn-dark" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving CV...' : 'Save CV'}
      </button>
    </DashboardSection>
  );
}

function WorkExperienceSection({ items, onAdd, onRemove }) {
  const empty = { company: '', title: '', startDate: '', endDate: '', current: false, description: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const set = (field, value) => setForm((v) => ({ ...v, [field]: value }));

  const handleAdd = () => {
    const next = {};
    if (!form.company.trim()) next.company = 'Company is required';
    if (!form.title.trim()) next.title = 'Job title is required';
    if (!form.startDate) next.startDate = 'Start date is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({ ...form, endDate: form.current ? null : (form.endDate || null) });
    setForm(empty);
    setErrors({});
    setOpen(false);
  };

  return (
    <div className="cv-section">
      <div className="cv-section-header">
        <h4>Work Experience</h4>
        <button className="btn-light small" onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : '+ Add'}</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="cv-entry">
          <div>
            <strong>{item.title}</strong> at {item.company}
            <p className="muted small">{item.startDate} – {item.current ? 'Present' : (item.endDate ?? '')}</p>
            {item.description && <p className="muted">{item.description}</p>}
          </div>
          <button className="btn-light small" onClick={() => onRemove(idx)}>Remove</button>
        </div>
      ))}
      {open && (
        <div className="cv-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" className={errors.company ? 'input-error' : ''} />
              {errors.company && <span className="error-text">{errors.company}</span>}
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Your title" className={errors.title ? 'input-error' : ''} />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={errors.startDate ? 'input-error' : ''} />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} disabled={form.current} />
            </div>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.current} onChange={(e) => set('current', e.target.checked)} />
            Currently working here
          </label>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Key responsibilities and achievements..." />
          </div>
          <button className="btn-dark small" onClick={handleAdd}>Add Experience</button>
        </div>
      )}
    </div>
  );
}

function EducationSection({ items, onAdd, onRemove }) {
  const empty = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const set = (field, value) => setForm((v) => ({ ...v, [field]: value }));

  const handleAdd = () => {
    const next = {};
    if (!form.institution.trim()) next.institution = 'Institution is required';
    if (!form.degree.trim()) next.degree = 'Degree is required';
    if (!form.startDate) next.startDate = 'Start date is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({ ...form, endDate: form.endDate || null });
    setForm(empty);
    setErrors({});
    setOpen(false);
  };

  return (
    <div className="cv-section">
      <div className="cv-section-header">
        <h4>Education</h4>
        <button className="btn-light small" onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : '+ Add'}</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="cv-entry">
          <div>
            <strong>{item.degree}</strong> — {item.institution}
            {item.fieldOfStudy && <span className="muted"> · {item.fieldOfStudy}</span>}
            <p className="muted small">{item.startDate} – {item.endDate ?? 'Present'}</p>
          </div>
          <button className="btn-light small" onClick={() => onRemove(idx)}>Remove</button>
        </div>
      ))}
      {open && (
        <div className="cv-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Institution</label>
              <input value={form.institution} onChange={(e) => set('institution', e.target.value)} placeholder="University or school" className={errors.institution ? 'input-error' : ''} />
              {errors.institution && <span className="error-text">{errors.institution}</span>}
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input value={form.degree} onChange={(e) => set('degree', e.target.value)} placeholder="e.g., Bachelor of Science" className={errors.degree ? 'input-error' : ''} />
              {errors.degree && <span className="error-text">{errors.degree}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Field of Study</label>
            <input value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} placeholder="e.g., Computer Science" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={errors.startDate ? 'input-error' : ''} />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <button className="btn-dark small" onClick={handleAdd}>Add Education</button>
        </div>
      )}
    </div>
  );
}

function CertificationSection({ items, onAdd, onRemove }) {
  const empty = { name: '', issuingOrg: '', issuedDate: '', expiryDate: '', credentialUrl: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const set = (field, value) => setForm((v) => ({ ...v, [field]: value }));

  const handleAdd = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Certification name is required';
    if (!form.issuingOrg.trim()) next.issuingOrg = 'Issuing organization is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({ ...form, issuedDate: form.issuedDate || null, expiryDate: form.expiryDate || null });
    setForm(empty);
    setErrors({});
    setOpen(false);
  };

  return (
    <div className="cv-section">
      <div className="cv-section-header">
        <h4>Certifications</h4>
        <button className="btn-light small" onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : '+ Add'}</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="cv-entry">
          <div>
            <strong>{item.name}</strong> — {item.issuingOrg}
            {item.issuedDate && <p className="muted small">Issued: {item.issuedDate}</p>}
            {item.credentialUrl && <p className="muted small"><a href={item.credentialUrl} target="_blank" rel="noopener noreferrer">View credential</a></p>}
          </div>
          <button className="btn-light small" onClick={() => onRemove(idx)}>Remove</button>
        </div>
      ))}
      {open && (
        <div className="cv-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Certification Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., AWS Solutions Architect" className={errors.name ? 'input-error' : ''} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Issuing Organization</label>
              <input value={form.issuingOrg} onChange={(e) => set('issuingOrg', e.target.value)} placeholder="e.g., Amazon Web Services" className={errors.issuingOrg ? 'input-error' : ''} />
              {errors.issuingOrg && <span className="error-text">{errors.issuingOrg}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={form.issuedDate} onChange={(e) => set('issuedDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Credential URL</label>
            <input type="url" value={form.credentialUrl} onChange={(e) => set('credentialUrl', e.target.value)} placeholder="https://..." />
          </div>
          <button className="btn-dark small" onClick={handleAdd}>Add Certification</button>
        </div>
      )}
    </div>
  );
}

function LanguageSection({ items, onAdd, onRemove }) {
  const PROFICIENCY = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Native'];
  const empty = { language: '', proficiency: 'Intermediate' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const set = (field, value) => setForm((v) => ({ ...v, [field]: value }));

  const handleAdd = () => {
    const next = {};
    if (!form.language.trim()) next.language = 'Language is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({ ...form });
    setForm(empty);
    setErrors({});
    setOpen(false);
  };

  return (
    <div className="cv-section">
      <div className="cv-section-header">
        <h4>Languages</h4>
        <button className="btn-light small" onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : '+ Add'}</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="cv-entry">
          <div>
            <strong>{item.language}</strong>
            <span className="muted"> — {item.proficiency}</span>
          </div>
          <button className="btn-light small" onClick={() => onRemove(idx)}>Remove</button>
        </div>
      ))}
      {open && (
        <div className="cv-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Language</label>
              <input value={form.language} onChange={(e) => set('language', e.target.value)} placeholder="e.g., English, Armenian" className={errors.language ? 'input-error' : ''} />
              {errors.language && <span className="error-text">{errors.language}</span>}
            </div>
            <div className="form-group">
              <label>Proficiency</label>
              <select value={form.proficiency} onChange={(e) => set('proficiency', e.target.value)}>
                {PROFICIENCY.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-dark small" onClick={handleAdd}>Add Language</button>
        </div>
      )}
    </div>
  );
}
