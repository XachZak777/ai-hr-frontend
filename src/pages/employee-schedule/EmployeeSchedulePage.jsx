import { useEffect, useState } from 'react';
import { DashboardSection, EventCards, PageTitle } from '../../components/CommonBlocks';
import { listMyInterviews } from '../../api/interviews';

function adaptInterview(interview) {
  const scheduledAt = interview.scheduledAt ? new Date(interview.scheduledAt) : null;
  const status = interview.status?.toLowerCase() ?? 'scheduled';
  return {
    title: `Interview #${interview.id}`,
    time: scheduledAt ? scheduledAt.toLocaleString() : 'Time not set',
    metaA: `Job #${interview.jobId ?? '—'}`,
    metaB: '',
    status,
    primary: status === 'completed' ? 'View Results' : 'Join Interview',
    primaryLink: `/interview/${interview.id}`,
  };
}

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
  const [events, setEvents] = useState([]);
  const upcomingEvents = events.filter((e) => e.status !== 'rejected' && e.status !== 'cancelled' && e.status !== 'completed');

  useEffect(() => {
    listMyInterviews({ size: 50 })
      .then((page) => setEvents((page.content ?? []).map(adaptInterview)))
      .catch(() => {});
  }, []);

  return (
    <main className="page dashboard">
      <PageTitle
        title="My Interview Schedule"
        subtitle="Interviews are assigned by recruiters. You can join scheduled calls below."
      />
      <InterviewStats events={events} upcomingCount={upcomingEvents.length} />
      {events.length === 0 ? (
        <div className="empty-state">
          <h4>No interviews scheduled</h4>
          <p className="muted">When a recruiter schedules an interview with you, it will appear here.</p>
        </div>
      ) : (
        <EventCards events={events} readOnly />
      )}
      <ChecklistSection />
      <TipsSection />
    </main>
  );
}

function InterviewStats({ events, upcomingCount }) {
  const stats = [
    ['Upcoming', upcomingCount],
    ['Confirmed', events.filter((e) => e.status === 'confirmed').length],
    ['Completed', events.filter((e) => e.status === 'completed').length],
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
