import apiClient from './client';

export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.put('/settings', data),
  updateTheme: (theme) => apiClient.patch('/settings/theme', { theme }),
  updateLanguage: (language) => apiClient.patch('/settings/language', { language }),
  updateNotifications: (notifications) => apiClient.patch('/settings/notifications', notifications),
  updatePrivacy: (privacy) => apiClient.patch('/settings/privacy', privacy),
  updateAccessibility: (accessibility) => apiClient.patch('/settings/accessibility', accessibility),
  getAbout: () => apiClient.get('/settings/about'),
};

export const profileApi = {
  get: () => apiClient.get('/profile'),
  update: (data) => apiClient.put('/profile', data),
};

export const activityApi = {
  getAll: (params) => apiClient.get('/activities', { params }),
  clear: () => apiClient.delete('/activities'),
};

export const importApi = {
  importData: (records) => apiClient.post('/import', records),
};
