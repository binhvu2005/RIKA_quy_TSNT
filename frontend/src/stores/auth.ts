import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import type { User } from '../types';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(getCookie(TOKEN_COOKIE_NAME));

  // Sửa isAuthenticated để check token thay vì chỉ user
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.roles?.includes('admin') ?? false);
  const isEditor = computed(() => user.value?.roles?.includes('editor') ?? false);

  // Set token và lưu vào cookie
  function setToken(newToken: string) {
    token.value = newToken;
    // Lưu vào cookie với thời hạn 7 ngày
    setCookie(TOKEN_COOKIE_NAME, newToken, 7);
    if (api.defaults.headers.common) {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
  }

  // Xóa token
  function clearToken() {
    token.value = null;
    deleteCookie(TOKEN_COOKIE_NAME);
    if (api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Set user
  function setUser(userData: User) {
    user.value = userData;
  }

  // Update user (sau khi update profile)
  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData };
    }
  }

  // Login
  async function login(usernameOrEmail: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password,
      });
      
      const { access_token, user: userData } = response.data.data;
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  }

  // Logout
  function logout() {
    user.value = null;
    clearToken();
  }

  // Check auth - lấy thông tin user hiện tại
  async function checkAuth() {
    // Lấy token từ cookie khi check auth
    const cookieToken = getCookie(TOKEN_COOKIE_NAME);
    if (!cookieToken) {
      token.value = null;
      user.value = null;
      return;
    }

    // Cập nhật token từ cookie
    token.value = cookieToken;

    try {
      if (api.defaults.headers.common) {
        api.defaults.headers.common['Authorization'] = `Bearer ${cookieToken}`;
      }
      const response = await api.get('/auth/me');
      // Backend trả về user trực tiếp hoặc trong response.data
      if (response.data) {
        // Nếu có response.data.data thì lấy data, không thì lấy response.data
        const userData = response.data.data || response.data;
        if (userData && userData._id) {
          setUser(userData);
        }
      }
    } catch (error) {
      // Token không hợp lệ
      console.error('Auth check failed:', error);
      logout();
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isEditor,
    login,
    logout,
    checkAuth,
    setUser,
    updateUser,
  };
});
