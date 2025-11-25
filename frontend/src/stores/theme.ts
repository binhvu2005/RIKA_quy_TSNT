import { defineStore } from 'pinia';
import { ref } from 'vue';

type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  // Get initial theme from localStorage or system preference
  function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Use system preference if no saved theme
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
    
    return 'light';
  }

  const theme = ref<Theme>(getInitialTheme());
  
  // Apply theme to document
  function applyTheme(newTheme: Theme) {
    if (typeof window === 'undefined') return;
    
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    console.log('Theme applied:', newTheme, 'HTML classes:', html.className);
  }

  // Toggle theme
  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme.value, 'to', newTheme);
    applyTheme(newTheme);
  }

  // Initialize theme on mount
  function initTheme() {
    const initialTheme = getInitialTheme();
    console.log('Initializing theme:', initialTheme);
    applyTheme(initialTheme);
  }

  // Apply theme immediately on store creation
  if (typeof window !== 'undefined') {
    const initialTheme = getInitialTheme();
    const html = document.documentElement;
    if (initialTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  return {
    theme,
    toggleTheme,
    applyTheme,
    initTheme,
  };
});
