import axios from 'axios';
import type { AxiosError } from 'axios';
import { getCookie, deleteCookie } from '../utils/cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

// Request interceptor - thêm token vào header từ cookie
api.interceptors.request.use(
  (config) => {
    const token = getCookie(TOKEN_COOKIE_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Unauthorized - xóa token và redirect về login
        deleteCookie(TOKEN_COOKIE_NAME);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // Các lỗi khác sẽ được xử lý ở component level
    }

    return Promise.reject(error);
  }
);

export default api;
