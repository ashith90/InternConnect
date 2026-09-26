import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicAuthReq = url.includes('/auth/login') || url.includes('/auth/resubmit') || url.includes('/auth/verification-status');
    if (error.response?.status === 401 && !isPublicAuthReq) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      const publicPaths = ['/login', '/register', '/resubmit-documents', '/'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/verify/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
