import { useState } from 'react';
import { DashboardSection, EventCards, PageTitle, QuickStatsRow } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import TextField from '../../components/ui/TextField';

const initialEvents = [];

const emptyForm = {
  title: '',
  candidateName: '',
  date: '',
  time: '',
  duration: '45',
  meetingType: 'Virtual',
  meetingLocation: ''
};

const interviewStats = [
  { label: 'Scheduled Interviews', count: 0 },
  { label: 'This Week', count: 0 },
  { label: 'Pending Confirmations', count: 0 },
  { label: 'Average Duration', count: '—' }
];

export default function EmployerSchedulePage() {
  const [events, setEvents] = useState(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => setEventForm((current) => ({ ...current, [field]: value }));

  const handleAddEvent = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!eventForm.title.trim()) nextErrors.title = 'Interview title is required';
    if (!eventForm.candidateName.trim()) nextErrors.candidateName = 'Candidate name is required';
    if (!eventForm.date) nextErrors.date = 'Date is required';
    if (!eventForm.time) nextErrors.time = 'Time is required';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newEvent = {
      title: eventForm.title,
      time: `${eventForm.date} · ${eventForm.time} (${eventForm.duration} mins)`,
      metaA: `Candidate: ${eventForm.candidateName}`,
      metaB: eventForm.meetingLocation || eventForm.meetingType,
      status: 'pending',
      primary: eventForm.meetingType === 'Virtual' ? 'Join Meeting' : 'Get Directions'
    };
    setEvents([...events, newEvent]);
    setEventForm(emptyForm);
    setFormErrors({});
    setShowAddEvent(false);
    notify('Interview scheduled successfully.', 'success');
  };

  const handleCancel = () => {
    setShowAddEvent(false);
    setFormErrors({});
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Interview & Meeting Schedule"
        subtitle="Manage your interview schedule and meetings with candidates"
        actions={<button className="btn-dark" onClick={() => setShowAddEvent(!showAddEvent)}>{showAddEvent ? 'Cancel' : '+ Schedule Interview'}</button>}
      />
      <QuickStatsRow items={interviewStats} />
      {showAddEvent && (
        <InterviewForm
          eventForm={eventForm}
          onFieldChange={updateField}
          onSubmit={handleAddEvent}
          onCancel={handleCancel}
          errors={formErrors}
        />
      )}
      <EventCards events={events} />
      <FeedbackSection events={events} />
    </main>
  );
}

function InterviewForm({ eventForm, onFieldChange, onSubmit, onCancel, errors }) {
  return (
    <div className="add-event-form">
      <h3>Schedule Interview</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <TextField label="Interview Title" placeholder="e.g., Interview - Frontend Developer" value={eventForm.title} onChange={(value) => onFieldChange('title', value)} required error={errors.title} />
          <TextField label="Candidate Name" placeholder="Full name" value={eventForm.candidateName} onChange={(value) => onFieldChange('candidateName', value)} required error={errors.candidateName} />
        </div>
        <div className="form-row">
          <TextField type="date" label="Date" value={eventForm.date} onChange={(value) => onFieldChange('date', value)} required error={errors.date} />
          <TextField type="time" label="Time" value={eventForm.time} onChange={(value) => onFieldChange('time', value)} required error={errors.time} />
          <TextField type="number" label="Duration (minutes)" placeholder="45" value={eventForm.duration} onChange={(value) => onFieldChange('duration', value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Meeting Type</label>
            <select value={eventForm.meetingType} onChange={(e) => onFieldChange('meetingType', e.target.value)}>
              <option>Virtual</option>
              <option>In-Person</option>
              <option>Hybrid</option>
            </select>
          </div>
          <TextField
            label="Location / Meeting Link"
            placeholder={eventForm.meetingType === 'Virtual' ? 'Zoom/Teams link' : 'Office address or room'}
            value={eventForm.meetingLocation}
            onChange={(value) => onFieldChange('meetingLocation', value)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-dark">Schedule Interview</button>
          <button type="button" className="btn-light" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function FeedbackSection({ events }) {
  return (
    <DashboardSection title="Interview Scoring & Feedback">
      <div className="interviews-grid">
        {events.map((event) => (
          <div key={`${event.title}-${event.time}`} className="interview-feedback-card">
            <h4>{event.metaA}</h4>
            <p className="muted">{event.title}</p>
            <div className="feedback-section">
              <label>Score (1-10)</label>
              <input type="number" min="1" max="10" placeholder="8" />
            </div>
            <div className="feedback-section">
              <label>Notes</label>
              <textarea placeholder="Add your feedback..." rows="2"></textarea>
            </div>
            <button className="btn-dark" onClick={() => notify(`Feedback saved for ${event.title}.`, 'success')}>Save Feedback</button>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
