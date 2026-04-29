import { useState } from 'react';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';

const notificationSeeds = {
  admin: [
    ['System health stable', 'All services are operating normally.', 'Today'],
    ['New employer joined', 'Innovation Hub completed onboarding.', 'Yesterday'],
    ['Report ready', 'Monthly hiring report is available.', '2 days ago'],
  ],
  employer: [
    ['New candidate match', 'Davit H. matched Senior Frontend Developer at 94%.', 'Today'],
    ['Interview reminder', 'Product Manager interview is scheduled tomorrow.', 'Today'],
    ['Job post update', 'Backend Developer received 12 new applications.', 'Yesterday'],
  ],
  employee: [
    ['Application submitted', 'Your latest job application was received.', 'Today'],
    ['Interview reminder', 'Technical assessment starts tomorrow at 10:00 AM.', 'Today'],
    ['New match', 'React Developer at Innovation Hub is a 92% match.', 'Yesterday'],
  ],
};

export default function NotificationsPage({ userRole = 'employee' }) {
  const [notifications, setNotifications] = useState(notificationSeeds[userRole] || notificationSeeds.employee);

  const handleMarkAllRead = () => {
    setNotifications([]);
    notify('All notifications marked as read.', 'success');
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Notifications"
        subtitle="Review recent account activity"
        actions={<button className="btn-light" onClick={handleMarkAllRead}>Mark All Read</button>}
      />
      <DashboardSection title="Recent Notifications">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map(([title, message, time]) => (
              <article key={`${title}-${time}`} className="notification-card">
                <span className="alarm-logo" aria-hidden="true">⏰</span>
                <div>
                  <h4>{title}</h4>
                  <p className="muted">{message}</p>
                </div>
                <span className="time">{time}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No unread notifications</h4>
            <p className="muted">You are all caught up.</p>
          </div>
        )}
      </DashboardSection>
    </main>
  );
}

function getHeaderLinks(userRole) {
  if (userRole === 'admin') return ['Dashboard', 'Schedule'];
  if (userRole === 'employee') return ['Dashboard', 'Schedule', 'Find Jobs', 'My Jobs'];
  return ['Dashboard', 'Schedule'];
}
