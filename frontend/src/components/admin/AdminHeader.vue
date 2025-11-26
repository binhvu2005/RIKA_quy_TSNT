<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 flex items-center justify-between">
      <!-- Mobile Menu Button -->
      <button
        @click="toggleSidebar"
        class="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Page Title -->
      <div class="flex-1 lg:ml-0">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ pageTitle }}</h1>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Notifications -->
        <div class="relative">
          <button
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 relative transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <!-- User Profile -->
        <div class="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div class="text-right hidden md:block">
            <p class="text-sm font-medium text-gray-800 dark:text-white">
              {{ authStore.user?.username || 'Admin' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ authStore.user?.email || 'admin@rika.vn' }}
            </p>
          </div>
          <div 
            v-if="authStore.user?.profile?.avatar" 
            class="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-primary-500 dark:ring-primary-400"
          >
            <img 
              :src="authStore.user.profile.avatar" 
              :alt="authStore.user.username"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
          >
            {{ userInitial }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import ThemeToggle from '../common/ThemeToggle.vue';

const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'admin-dashboard': 'Dashboard',
    'admin-users': 'Quản lý người dùng',
    'admin-articles': 'Quản lý bài viết',
    'admin-categories': 'Quản lý danh mục',
    'admin-forum': 'Quản lý diễn đàn',
    'admin-finance': 'Quản lý tài chính',
    'admin-scholarships': 'Quản lý học bổng',
    'admin-settings': 'Cài đặt hệ thống',
  };
  return titles[route.name as string] || 'Admin Panel';
});

const userInitial = computed(() => {
  const username = authStore.user?.username || 'A';
  return username.charAt(0).toUpperCase();
});

function toggleSidebar() {
  const event = new CustomEvent('toggle-sidebar');
  window.dispatchEvent(event);
}
</script>
