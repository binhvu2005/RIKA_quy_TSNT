import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: () => import('../layouts/UserLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/user/HomeView.vue'),
          meta: { transition: 'fade' },
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('../views/user/ArticlesView.vue'),
        },
        {
          path: 'articles/:slug',
          name: 'article-detail',
          component: () => import('../views/user/ArticleDetailView.vue'),
        },
        {
          path: 'forum',
          name: 'forum',
          component: () => import('../views/user/ForumView.vue'),
        },
        {
          path: 'forum/:id',
          name: 'forum-thread',
          component: () => import('../views/user/ForumThreadView.vue'),
        },
        {
          path: 'scholarships',
          name: 'scholarships',
          component: () => import('../views/user/ScholarshipsView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/user/ProfileView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/UsersView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/admin/CategoriesView.vue'),
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('../views/admin/ArticlesView.vue'),
        },
        {
          path: 'articles/:id/edit',
          name: 'admin-article-edit',
          component: () => import('../views/admin/ArticleEditView.vue'),
        },
        {
          path: 'articles/new',
          name: 'admin-article-new',
          component: () => import('../views/admin/ArticleEditView.vue'),
        },
        {
          path: 'forum',
          name: 'admin-forum',
          component: () => import('../views/admin/ForumView.vue'),
        },
        {
          path: 'finance',
          name: 'admin-finance',
          component: () => import('../views/admin/FinanceView.vue'),
        },
        {
          path: 'scholarships',
          name: 'admin-scholarships',
          component: () => import('../views/admin/ScholarshipsView.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../views/admin/SettingsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Kiểm tra auth nếu chưa check
  if (!authStore.user && authStore.token) {
    await authStore.checkAuth();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Nếu đã đăng nhập, redirect về home thay vì login
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;

