import apiClient from './client';

export const notificationApi = {
  getAll:     () => apiClient.get('/notifications'),
  markRead:   (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead:() => apiClient.patch('/notifications/read-all'),
  delete:     (id) => apiClient.delete(`/notifications/${id}`),
};
