<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta.transition || 'page'"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  // Khôi phục session khi app load
  authStore.checkAuth();
  // Đảm bảo theme được khởi tạo
  themeStore.initTheme();
});
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
}
</style>
