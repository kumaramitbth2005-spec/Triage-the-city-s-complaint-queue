import apiClient from './client';

export const authApi = {
  login:                  (email, password) => apiClient.post('/auth/login', { email, password }),
  register:               (name, email, password, role) => apiClient.post('/auth/register', { name, email, password, role }),
  sendVerificationCode:   (email, name) => apiClient.post('/auth/send-verification-code', { email, name }),
  verifyEmail:            (email, otp) => apiClient.post('/auth/verify-email', { email, otp }),
  resendVerification:     (email) => apiClient.post('/auth/resend-verification', { email }),
  resendVerificationCode: (email) => apiClient.post('/auth/resend-verification-code', { email }),
  logout:                 () => apiClient.post('/auth/logout'),
  getMe:                  () => apiClient.get('/auth/me'),
  changePassword:         (currentPassword, newPassword) => apiClient.post('/auth/change-password', { currentPassword, newPassword }),
};
