<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg"
    :class="{ '-translate-x-full': !isOpen, 'translate-x-0': isOpen }"
  >
    <div class="flex flex-col h-full">
      <!-- Logo Section -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <Logo :size="'md'" :show-full="false" :show-subtitle="false" :show-text="false" />
          <div class="flex flex-col min-w-0 flex-1">
            <span class="font-bold text-base text-gray-900 dark:text-white truncate">
              Thắp sáng niềm tin
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">Admin Panel</span>
          </div>
        </div>
        <button
          @click="toggleSidebar"
          class="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ml-2 flex-shrink-0"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group"
          :class="
            isActive(item.path)
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          "
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <span class="font-medium flex-1">{{ item.label }}</span>
          <span
            v-if="item.badge !== undefined"
            class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <!-- Bottom Section -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <router-link
          to="/"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span class="text-xl">🏠</span>
          <span class="font-medium">Về trang chủ</span>
        </router-link>
      </div>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="closeSidebar"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import Logo from '../common/Logo.vue';

const route = useRoute();
const isOpen = ref(false);

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Người dùng', icon: '👥' },
  { path: '/admin/articles', label: 'Bài viết', icon: '📝' },
  { path: '/admin/categories', label: 'Danh mục', icon: '📁' },
  { path: '/admin/forum', label: 'Diễn đàn', icon: '💬' },
  { path: '/admin/finance', label: 'Tài chính', icon: '💰' },
  { path: '/admin/scholarships', label: 'Học bổng', icon: '🎓' },
  { path: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
];

function isActive(path: string): boolean {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(path);
}

function toggleSidebar() {
  isOpen.value = !isOpen.value;
}

function closeSidebar() {
  isOpen.value = false;
}

// Listen for toggle events from header
function handleToggleSidebar() {
  toggleSidebar();
}

// Close sidebar on route change (mobile)
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('toggle-sidebar', handleToggleSidebar);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('toggle-sidebar', handleToggleSidebar);
});
</script>
