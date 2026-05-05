import { useState } from 'react';
import { DashboardSection, EventCards, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import TextField from '../../components/ui/TextField';

const initialEvents = [];

const emptyForm = { title: '', date: '', time: '', duration: '60', participants: '', location: '', description: '' };

const activities = [];

export default function AdminSchedulePage() {
  const [events, setEvents] = useState(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => setEventForm((current) => ({ ...current, [field]: value }));

  const handleAddEvent = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!eventForm.title.trim()) nextErrors.title = 'Event title is required';
    if (!eventForm.date) nextErrors.date = 'Date is required';
    if (!eventForm.time) nextErrors.time = 'Time is required';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
    setFormErrors({});
    setShowAddEvent(false);
    notify('Event added successfully.', 'success');
  };

  const handleCancel = () => {
    setShowAddEvent(false);
    setFormErrors({});
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Administrative Schedule"
        subtitle="Overview of all platform activities and meetings"
        actions={<button className="btn-dark" onClick={() => setShowAddEvent(!showAddEvent)}>{showAddEvent ? 'Cancel' : '+ Add Event'}</button>}
      />
      {showAddEvent && (
        <AdminEventForm
          eventForm={eventForm}
          onFieldChange={updateField}
          onSubmit={handleAddEvent}
          onCancel={handleCancel}
          errors={formErrors}
        />
      )}
      <EventCards events={events} />
      <ActivitiesTimeline />
    </main>
  );
}

function AdminEventForm({ eventForm, onFieldChange, onSubmit, onCancel, errors }) {
  return (
    <div className="add-event-form">
      <h3>Create New Event</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <TextField label="Event Title" placeholder="e.g., Team Meeting" value={eventForm.title} onChange={(value) => onFieldChange('title', value)} required error={errors.title} />
          <TextField type="date" label="Date" value={eventForm.date} onChange={(value) => onFieldChange('date', value)} required error={errors.date} />
        </div>
        <div className="form-row">
          <TextField type="time" label="Time" value={eventForm.time} onChange={(value) => onFieldChange('time', value)} required error={errors.time} />
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
