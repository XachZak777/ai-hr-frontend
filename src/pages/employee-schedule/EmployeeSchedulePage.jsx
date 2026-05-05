import { useState } from 'react';
import { DashboardSection, EventCards, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import TextField from '../../components/ui/TextField';

const initialEvents = [];

const emptyForm = { title: '', company: '', position: '', date: '', time: '', duration: '45', location: '' };

const checklistItems = [
  ['Research company background and culture', true],
  ['Review job description and requirements', true],
  ['Prepare examples of past projects and achievements', false],
  ['Prepare questions to ask the interviewer', false],
  ['Test your internet connection and equipment', false],
  ['Prepare professional attire', false],
];

const tips = [
  ['Before the Interview', ['Research the company thoroughly', 'Practice your elevator pitch', 'Prepare specific examples', 'Test your tech setup (for virtual)']],
  ['During the Interview', ['Make eye contact and smile', 'Listen carefully to questions', 'Provide detailed examples (STAR method)', 'Ask thoughtful questions']],
  ['After the Interview', ['Send a thank you email within 24h', 'Reference specific points discussed', 'Reiterate your interest', 'Stay professional and patient']],
];

export default function EmployeeSchedulePage() {
  const [events, setEvents] = useState(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const upcomingEvents = events.filter((event) => event.status !== 'rejected');

  const updateField = (field, value) => setEventForm((current) => ({ ...current, [field]: value }));

  const handleAddEvent = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!eventForm.title.trim()) nextErrors.title = 'Interview title is required';
    if (!eventForm.date) nextErrors.date = 'Date is required';
    if (!eventForm.time) nextErrors.time = 'Time is required';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newEvent = {
      title: eventForm.title,
      time: `${eventForm.date} · ${eventForm.time} (${eventForm.duration} mins)`,
      metaA: `${eventForm.company || 'Company'} - ${eventForm.position || 'Position'}`,
      metaB: eventForm.location || 'Virtual Meeting',
      status: 'scheduled',
      primary: 'Join Meeting'
    };
    setEvents([...events, newEvent]);
    setEventForm(emptyForm);
    setFormErrors({});
    setShowAddEvent(false);
    notify('Interview added to your schedule.', 'success');
  };

  const handleCancel = () => {
    setShowAddEvent(false);
    setFormErrors({});
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="My Interview Schedule"
        subtitle="View your upcoming interviews and assessments"
        actions={<button className="btn-dark" onClick={() => setShowAddEvent(!showAddEvent)}>{showAddEvent ? 'Cancel' : '+ Add Event'}</button>}
      />
      <InterviewStats events={events} upcomingCount={upcomingEvents.length} />
      {showAddEvent && (
        <EmployeeEventForm
          eventForm={eventForm}
          onFieldChange={updateField}
          onSubmit={handleAddEvent}
          onCancel={handleCancel}
          errors={formErrors}
        />
      )}
      <EventCards events={events} />
      <ChecklistSection />
      <TipsSection />
    </main>
  );
}

function InterviewStats({ events, upcomingCount }) {
  const stats = [
    ['Upcoming interviews', upcomingCount],
    ['Confirmed', events.filter((event) => event.status === 'confirmed').length],
    ['Pending confirmation', events.filter((event) => event.status === 'pending' || event.status === 'scheduled').length],
  ];

  return (
    <div className="interview-stats">
      {stats.map(([label, count]) => (
        <div key={label} className="stat-mini">
          <h4>{count}</h4>
          <p className="muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function EmployeeEventForm({ eventForm, onFieldChange, onSubmit, onCancel, errors }) {
  return (
    <div className="add-event-form">
      <h3>Add Interview to Schedule</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <TextField label="Interview Title" placeholder="e.g., Interview - Senior Developer" value={eventForm.title} onChange={(value) => onFieldChange('title', value)} required error={errors.title} />
        </div>
        <div className="form-row">
          <TextField label="Company Name" placeholder="e.g., Tech Armenia" value={eventForm.company} onChange={(value) => onFieldChange('company', value)} />
          <TextField label="Position" placeholder="e.g., Frontend Developer" value={eventForm.position} onChange={(value) => onFieldChange('position', value)} />
        </div>
        <div className="form-row">
          <TextField type="date" label="Date" value={eventForm.date} onChange={(value) => onFieldChange('date', value)} required error={errors.date} />
          <TextField type="time" label="Time" value={eventForm.time} onChange={(value) => onFieldChange('time', value)} required error={errors.time} />
          <TextField type="number" label="Duration (minutes)" placeholder="45" value={eventForm.duration} onChange={(value) => onFieldChange('duration', value)} />
        </div>
        <TextField label="Location / Meeting Details" placeholder="Virtual Meeting, Office address, or meeting link" value={eventForm.location} onChange={(value) => onFieldChange('location', value)} />
        <div className="form-actions">
          <button type="submit" className="btn-dark">Add to Schedule</button>
          <button type="button" className="btn-light" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function ChecklistSection() {
  return (
    <DashboardSection title="Interview Preparation Checklist">
      <div className="checklist">
        {checklistItems.map(([label, checked]) => (
          <label key={label} className="checklist-item">
            <input type="checkbox" defaultChecked={checked} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </DashboardSection>
  );
}

function TipsSection() {
  return (
    <DashboardSection title="Interview Tips & Resources">
      <div className="tips-grid">
        {tips.map(([title, items]) => (
          <div key={title} className="tip-card">
            <h4>{title}</h4>
            <ul className="tips-list">
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
