<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <AdminSidebar />
    <div class="lg:pl-64">
      <AdminHeader />
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import AdminHeader from '../components/admin/AdminHeader.vue';
import { useThemeStore } from '../stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>
