<template>
  <header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 animate-slide-down border-b border-gray-200 dark:border-gray-700">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <Logo :size="'lg'" :show-full="true" :show-subtitle="false" />

        <div class="hidden md:flex items-center space-x-6">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative"
            :class="{ 'text-primary-600 dark:text-primary-400': isActive(item.path) }"
          >
            {{ item.label }}
            <span
              v-if="isActive(item.path)"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300"
            ></span>
            <span
              v-else
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"
            ></span>
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <ThemeToggle />

          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="btn btn-secondary text-sm"
            >
              Admin
            </router-link>
            
            <!-- Notification Bell -->
            <div class="relative">
              <button
                @click="toggleNotificationDropdown"
                class="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  v-if="unreadCount > 0"
                  class="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                >
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </button>

              <!-- Notification Dropdown -->
              <div
                v-if="showNotificationDropdown"
                class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
              >
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 class="font-bold text-gray-900 dark:text-white">Thông báo</h3>
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="unreadCount > 0"
                      @click="markAllAsRead"
                      class="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                    <button
                      @click="showNotificationDropdown = false"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-if="loadingNotifications" class="p-4 text-center">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
                <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
                  <p>Không có thông báo nào</p>
                </div>
                <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                  <div
                    v-for="notification in notifications"
                    :key="notification._id"
                    class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.is_read }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div
                          class="w-2 h-2 rounded-full mt-2"
                          :class="notification.is_read ? 'bg-transparent' : 'bg-primary-500'"
                        ></div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {{ notification.title }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {{ notification.message }}
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {{ formatNotificationDate(notification.createdAt) }}
                        </p>
                      </div>
                      <button
                        @click.stop="deleteNotification(notification._id)"
                        class="flex-shrink-0 text-gray-400 hover:text-red-500"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <router-link
                    to="/notifications"
                    class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    @click="showNotificationDropdown = false"
                  >
                    Xem tất cả thông báo
                  </router-link>
                </div>
              </div>
            </div>

            <router-link
              to="/profile"
              class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <div 
                v-if="authStore.user?.profile?.avatar" 
                class="w-8 h-8 rounded-full overflow-hidden shadow-md ring-2 ring-primary-500 dark:ring-primary-400"
              >
                <img 
                  :src="authStore.user.profile.avatar" 
                  :alt="authStore.user.username"
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else
                class="w-8 h-8 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
              >
                {{ userInitial }}
              </div>
              <span class="hidden md:block">{{ authStore.user?.username }}</span>
            </router-link>
            <button
              @click="handleLogout"
              class="btn btn-secondary text-sm"
            >
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-primary text-sm">
              Đăng nhập
            </router-link>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { useToast } from 'vue-toastification';
import api from '../../services/api';
import Logo from '../common/Logo.vue';
import ThemeToggle from '../common/ThemeToggle.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const toast = useToast();

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  createdAt?: string;
}

const showNotificationDropdown = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const loadingNotifications = ref(false);
let notificationInterval: ReturnType<typeof setInterval> | null = null;

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/articles', label: 'Tin tức' },
  { path: '/forum', label: 'Diễn đàn' },
  { path: '/scholarships', label: 'Học bổng' },
  { path: '/contributions', label: 'Đóng góp' },
];

const userInitial = computed(() => {
  const username = authStore.user?.username || '';
  return username.charAt(0).toUpperCase();
});

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
}

function handleLogout() {
  authStore.logout();
  toast.success('Đã đăng xuất thành công');
  router.push('/');
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

function toggleNotificationDropdown() {
  showNotificationDropdown.value = !showNotificationDropdown.value;
  if (showNotificationDropdown.value && authStore.isAuthenticated) {
    fetchNotifications();
  }
}

async function fetchNotifications() {
  if (!authStore.isAuthenticated) return;
  loadingNotifications.value = true;
  try {
    const response = await api.get('/notifications', {
      params: { page: 1, limit: 10 },
    });
    const data = response.data?.data || response.data || {};
    notifications.value = data.data || [];
    unreadCount.value = data.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loadingNotifications.value = false;
  }
}

async function markAllAsRead() {
  try {
    await api.patch('/notifications/read-all');
    notifications.value.forEach(n => n.is_read = true);
    unreadCount.value = 0;
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
  } catch (error) {
    console.error('Error marking all as read:', error);
    toast.error('Không thể đánh dấu đã đọc');
  }
}

async function handleNotificationClick(notification: Notification) {
  if (!notification.is_read) {
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      notification.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
  
  if (notification.link) {
    router.push(notification.link);
    showNotificationDropdown.value = false;
  }
}

async function deleteNotification(id: string) {
  try {
    await api.delete(`/notifications/${id}`);
    notifications.value = notifications.value.filter(n => n._id !== id);
    toast.success('Đã xóa thông báo');
  } catch (error) {
    console.error('Error deleting notification:', error);
    toast.error('Không thể xóa thông báo');
  }
}

function formatNotificationDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchNotifications();
    // Poll notifications every 30 seconds
    notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
  }
});

onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
});
</script>
