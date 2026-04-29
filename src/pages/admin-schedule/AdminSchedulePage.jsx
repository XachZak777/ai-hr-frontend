import { useState } from 'react';
import { DashboardSection, EventCards, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';

const initialEvents = [
  { title: 'System Review Meeting', time: '2024-01-15 · 10:00 AM (60 mins)', metaA: 'Participants: Tech Team, HR Team', metaB: 'Conference Room A', status: 'confirmed', primary: 'Get Directions' },
  { title: 'Client Onboarding - Tech Armenia', time: '2024-01-16 · 2:00 PM (90 mins)', metaA: 'Participants: Armen Sarkissian, Gayane Mkrtchyan', metaB: 'Virtual Meeting', status: 'pending', primary: 'Join Meeting' },
  { title: 'Platform Maintenance Window', time: '2024-01-17 · 11:00 PM (2 hours)', metaA: 'All systems will be down for updates', metaB: 'Scheduled maintenance', status: 'confirmed', primary: 'View Details' },
];

const emptyForm = { title: '', date: '', time: '', duration: '60', participants: '', location: '', description: '' };

const activities = [
  ['System Review', 'Tomorrow at 10:00 AM'],
  ['Client Onboarding', 'Tomorrow at 2:00 PM'],
  ['Platform Maintenance', 'In 2 days at 11:00 PM'],
];

export default function AdminSchedulePage() {
  const [events, setEvents] = useState(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState(emptyForm);

  const updateField = (field, value) => setEventForm((current) => ({ ...current, [field]: value }));

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = {
      title: eventForm.title,
      time: `${eventForm.date} · ${eventForm.time} (${eventForm.duration} mins)`,
      metaA: `Participants: ${eventForm.participants}`,
      metaB: eventForm.location,
      status: 'pending',
      primary: 'View Details'
    };
    setEvents([...events, newEvent]);
    setEventForm(emptyForm);
    setShowAddEvent(false);
    notify('Event added successfully.', 'success');
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Administrative Schedule"
        subtitle="Overview of all platform activities and meetings"
        actions={<button className="btn-dark" onClick={() => setShowAddEvent(!showAddEvent)}>{showAddEvent ? 'Cancel' : '+ Add Event'}</button>}
      />
      {showAddEvent && <AdminEventForm eventForm={eventForm} onFieldChange={updateField} onSubmit={handleAddEvent} onCancel={() => setShowAddEvent(false)} />}
      <EventCards events={events} />
      <ActivitiesTimeline />
    </main>
  );
}

function AdminEventForm({ eventForm, onFieldChange, onSubmit, onCancel }) {
  return (
    <div className="add-event-form">
      <h3>Create New Event</h3>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <TextField label="Event Title" placeholder="e.g., Team Meeting" value={eventForm.title} onChange={(value) => onFieldChange('title', value)} required />
          <TextField type="date" label="Date" value={eventForm.date} onChange={(value) => onFieldChange('date', value)} required />
        </div>
        <div className="form-row">
          <TextField type="time" label="Time" value={eventForm.time} onChange={(value) => onFieldChange('time', value)} required />
          <TextField type="number" label="Duration (minutes)" placeholder="60" value={eventForm.duration} onChange={(value) => onFieldChange('duration', value)} />
        </div>
        <TextField label="Participants" placeholder="Name1, Name2, Name3..." value={eventForm.participants} onChange={(value) => onFieldChange('participants', value)} />
        <TextField label="Location" placeholder="e.g., Conference Room A or Virtual Meeting" value={eventForm.location} onChange={(value) => onFieldChange('location', value)} />
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Event details..." rows="3" value={eventForm.description} onChange={(e) => onFieldChange('description', e.target.value)}></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-dark">Create Event</button>
          <button type="button" className="btn-light" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function ActivitiesTimeline() {
  return (
    <DashboardSection title="Upcoming Activities">
      <div className="activities-timeline">
        {activities.map(([title, time]) => (
          <div key={title} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>{title}</h4>
              <p className="muted">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
