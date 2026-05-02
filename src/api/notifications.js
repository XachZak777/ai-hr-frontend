import { request } from './client';

/**
 * Get all notification preferences for the authenticated user.
 * If a type has never been customised, it is returned with enabled: true and id: null.
 *
 * NotificationType values:
 *   USER_REGISTERED | APPLICATION_SUBMITTED | APPLICATION_STATUS_CHANGED |
 *   INTERVIEW_SCHEDULED | INTERVIEW_COMPLETED
 *
 * @returns {Promise<NotificationPreferenceDto[]>}
 */
export function getNotificationPreferences() {
  return request('/api/v1/notifications/preferences');
}

/**
 * Enable or disable a specific notification type for the authenticated user.
 * @param {{ notificationType: NotificationType, enabled: boolean }} body
 * @returns {Promise<NotificationPreferenceDto>}
 */
export function updateNotificationPreference({ notificationType, enabled }) {
  return request('/api/v1/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify({ notificationType, enabled }),
  });
}
