import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'animate.css';
import './style.css';
import App from './App.vue';
import router from './router';
import { useThemeStore } from './stores/theme';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme
const themeStore = useThemeStore();
themeStore.initTheme();
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
});

app.mount('#app');

