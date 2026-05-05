import { useState } from 'react';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';

const notificationSeeds = {
  admin: [],
  employer: [],
  employee: [],
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

