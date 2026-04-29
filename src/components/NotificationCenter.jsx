import { useEffect, useState } from 'react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotify = (event) => {
      const notification = {
        id: crypto.randomUUID(),
        type: event.detail?.type || 'info',
        message: event.detail?.message || '',
      };

      setNotifications((current) => [...current, notification]);
      setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, 3200);
    };

    window.addEventListener('hireai:notify', handleNotify);
    return () => window.removeEventListener('hireai:notify', handleNotify);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-stack" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}
