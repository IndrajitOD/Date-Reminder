import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach Firebase ID token if user is signed in
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('Could not get Firebase token for request:', err);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Reminders
  getReminders: (params = '') => request(`/reminders${params ? `?${params}` : ''}`),
  createReminder: (payload) => request('/reminders', { method: 'POST', body: JSON.stringify(payload) }),
  updateReminder: (id, payload) => request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  bulkReminders: (payload) => request('/reminders/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Global Categories & Events
  getGlobalCategories: () => request('/global-categories'),
  getGlobalEvents: (params = '') => request(`/global-events${params ? `?${params}` : ''}`),
  getSubscriptions: () => request('/global-events/subscriptions'),
  subscribeEvent: (payload) => request('/global-events/subscribe', { method: 'POST', body: JSON.stringify(payload) }),
  unsubscribeEvent: (payload) => request('/global-events/unsubscribe', { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications
  getNotificationPreferences: () => request('/notifications/preferences'),
  updateNotificationPreferences: (payload) => request('/notifications/preferences', { method: 'PUT', body: JSON.stringify(payload) }),
  getNotificationLogs: (params = '') => request(`/notifications/logs${params ? `?${params}` : ''}`),
  retryNotification: (id) => request(`/notifications/logs/${id}/retry`, { method: 'POST' }),

  // WhatsApp Management
  connectWhatsApp: (payload) => request('/notifications/whatsapp/connect', { method: 'POST', body: JSON.stringify(payload) }),
  disconnectWhatsApp: () => request('/notifications/whatsapp/disconnect', { method: 'POST' }),

  // Account & Profile Management
  getProfile: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAccount: () => request('/auth/delete-account', { method: 'DELETE' })
};
