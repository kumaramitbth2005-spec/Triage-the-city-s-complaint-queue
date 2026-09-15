import apiClient from './client';

export const authApi = {
  login:    (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (name, email, password, role) => apiClient.post('/auth/register', { name, email, password, role }),
  logout:   () => apiClient.post('/auth/logout'),
  getMe:    () => apiClient.get('/auth/me'),
};
