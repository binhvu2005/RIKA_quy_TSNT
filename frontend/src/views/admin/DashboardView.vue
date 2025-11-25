<template>
  <div class="animate-fade-in">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card transform hover:scale-105 transition-transform"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800">{{ stat.value }}</p>
          </div>
          <div class="text-4xl">{{ stat.icon }}</div>
        </div>
        <div class="mt-4 pt-4 border-t">
          <span :class="stat.change > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm">
            {{ stat.change > 0 ? '↑' : '↓' }} {{ Math.abs(stat.change) }}% so với tháng trước
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Articles -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4">Bài viết gần đây</h3>
        <div v-if="loadingArticles" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="article in recentArticles"
            :key="article._id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-1">
              <h4 class="font-semibold text-sm mb-1">{{ article.title }}</h4>
              <p class="text-xs text-gray-500">{{ formatDate(article.createdAt) }}</p>
            </div>
            <span
              :class="{
                'bg-green-100 text-green-700': article.status === 'published',
                'bg-yellow-100 text-yellow-700': article.status === 'draft',
              }"
              class="px-2 py-1 rounded text-xs"
            >
              {{ article.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4">Người dùng mới</h3>
        <div v-if="loadingUsers" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="user in recentUsers"
            :key="user._id"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm">{{ user.username }}</h4>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </div>
            <span
              :class="{
                'bg-green-100 text-green-700': user.status === 'active',
                'bg-yellow-100 text-yellow-700': user.status === 'pending',
              }"
              class="px-2 py-1 rounded text-xs"
            >
              {{ user.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import type { Article, User } from '../../types';

const loadingArticles = ref(true);
const loadingUsers = ref(true);
const recentArticles = ref<Article[]>([]);
const recentUsers = ref<User[]>([]);

const stats = ref([
  { label: 'Tổng người dùng', value: '0', icon: '👥', change: 12 },
  { label: 'Bài viết', value: '0', icon: '📝', change: 8 },
  { label: 'Bình luận', value: '0', icon: '💬', change: -3 },
  { label: 'Lượt truy cập', value: '0', icon: '👁️', change: 25 },
]);

onMounted(async () => {
  await Promise.all([fetchRecentArticles(), fetchRecentUsers(), fetchStats()]);
});

async function fetchRecentArticles() {
  try {
    const response = await api.get('/articles', { params: { page: 1, limit: 5 } });
    recentArticles.value = response.data.data.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
  } finally {
    loadingArticles.value = false;
  }
}

async function fetchRecentUsers() {
  try {
    const response = await api.get('/users', { params: { page: 1, limit: 5 } });
    recentUsers.value = response.data.data.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loadingUsers.value = false;
  }
}

async function fetchStats() {
  try {
    // Fetch actual stats from API
    const [usersRes, articlesRes] = await Promise.all([
      api.get('/users', { params: { page: 1, limit: 1 } }),
      api.get('/articles', { params: { page: 1, limit: 1 } }),
    ]);

    stats.value[0].value = usersRes.data.data.pagination?.total || '0';
    stats.value[1].value = articlesRes.data.data.pagination?.total || '0';
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}
</script>

