import { useEffect, useState } from 'react';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getNotificationPreferences, updateNotificationPreference } from '../../api/notifications';

const NOTIFICATION_LABELS = {
  USER_REGISTERED:             'Account activity',
  APPLICATION_SUBMITTED:       'Application submitted',
  APPLICATION_STATUS_CHANGED:  'Application status updates',
  INTERVIEW_SCHEDULED:         'Interview scheduled',
  INTERVIEW_COMPLETED:         'Interview completed',
};

const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_LABELS);

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getNotificationPreferences()
      .then((list) => {
        const map = {};
        for (const type of NOTIFICATION_TYPES) {
          const pref = list.find((p) => p.notificationType === type);
          map[type] = pref ? pref.enabled : true;
        }
        setPreferences(map);
      })
      .catch(() => {
        const defaults = {};
        for (const type of NOTIFICATION_TYPES) defaults[type] = true;
        setPreferences(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (notificationType) => {
    const enabled = !preferences[notificationType];
    setUpdating(notificationType);
    try {
      await updateNotificationPreference({ notificationType, enabled });
      setPreferences((prev) => ({ ...prev, [notificationType]: enabled }));
      notify(`Notification preference updated.`, 'success');
    } catch {
      notify('Failed to update preference.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main className="page dashboard">
      <PageTitle
        title="Notification Preferences"
        subtitle="Choose which notifications you want to receive"
      />
      <DashboardSection title="Email Notifications">
        {loading ? (
          <p className="muted">Loading preferences...</p>
        ) : (
          <div className="preference-list">
            {NOTIFICATION_TYPES.map((type) => (
              <label key={type} className="preference-item">
                <span>{NOTIFICATION_LABELS[type]}</span>
                <input
                  type="checkbox"
                  checked={preferences[type] ?? true}
                  disabled={updating === type}
                  onChange={() => handleToggle(type)}
                />
              </label>
            ))}
          </div>
        )}
      </DashboardSection>
    </main>
  );
}
