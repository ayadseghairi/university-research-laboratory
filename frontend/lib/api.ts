import axios from 'axios';
import Cookies from 'js-cookie';
import { clearAuthCookies } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If data is FormData, delete Content-Type header to let axios/browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const reqUrl = error.config?.url || '<unknown url>';
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const status = error.response?.status;
      if (!status || status >= 500) {
        console.error(`[api] ${method} ${reqUrl} -> ${status ?? 'NO_RESPONSE'}`, error.response?.data || error.message);
      }
    } catch (e) {
      console.error('[api] error logging failed', e);
    }
    if (error.response?.status === 401) {
      clearAuthCookies();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
