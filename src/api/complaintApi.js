import apiClient from './client';

export const complaintApi = {
  getAll:         (params) => apiClient.get('/complaints', { params }),
  getById:        (id) => apiClient.get(`/complaints/${id}`),
  create:         (data) => apiClient.post('/complaints', data),
  triage:         (id, data) => apiClient.patch(`/complaints/${id}/triage`, data),
  getTriageQueue: (params) => apiClient.get('/triage', { params }),
};
