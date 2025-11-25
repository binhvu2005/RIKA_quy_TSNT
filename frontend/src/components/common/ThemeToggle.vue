<template>
  <button
    @click="handleToggle"
    class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
    :aria-label="currentTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
    type="button"
  >
    <!-- Sun Icon (Light Mode) - shown when dark mode is active -->
    <svg
      v-if="currentTheme === 'dark'"
      key="sun"
      class="w-5 h-5 transition-all duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- Moon Icon (Dark Mode) - shown when light mode is active -->
    <svg
      v-else
      key="moon"
      class="w-5 h-5 transition-all duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const currentTheme = computed(() => theme.value);

function handleToggle() {
  console.log('Theme toggle clicked, current theme:', theme.value);
  themeStore.toggleTheme();
  console.log('Theme after toggle:', theme.value);
}
</script>
