import apiClient from './client';

export const reportApi = {
  getWeekly:              (params) => apiClient.get('/reports/weekly', { params }),
  getWeeklyByDepartment:  (dept) => apiClient.get(`/reports/weekly/${dept}`),
};
