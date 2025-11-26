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
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { useToast } from 'vue-toastification';
import Logo from '../common/Logo.vue';
import ThemeToggle from '../common/ThemeToggle.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const toast = useToast();

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/articles', label: 'Tin tức' },
  { path: '/forum', label: 'Diễn đàn' },
  { path: '/scholarships', label: 'Học bổng' },
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
}
</script>
