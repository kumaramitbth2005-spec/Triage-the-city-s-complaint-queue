import apiClient from './client';

export const clusterApi = {
  getAll:   () => apiClient.get('/clusters'),
  getById:  (id) => apiClient.get(`/clusters/${id}`),
};
