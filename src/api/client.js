import axios from 'axios';

const PRODUCTION_API_URL = 'https://triage-the-city-s-complaint-queue.onrender.com/api';

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // In production (cloud deployment like Render or Vercel):
  // If envUrl is provided and is not localhost, use it; otherwise fallback to live Render backend
  if (import.meta.env.PROD) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return PRODUCTION_API_URL;
  }
  
  // In development: use envUrl if present, or /api (proxied by Vite)
  return envUrl || '/api';
};

const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});


// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
