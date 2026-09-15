import apiClient from './client';

export const settingsApi = {
  get:    () => apiClient.get('/settings'),
  update: (data) => apiClient.patch('/settings', data),
};

export const profileApi = {
  get:    () => apiClient.get('/profile'),
  update: (data) => apiClient.patch('/profile', data),
};

export const importApi = {
  importData: (records) => apiClient.post('/import', records),
};
