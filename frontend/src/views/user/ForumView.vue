<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-bold mb-2">Diễn đàn</h1>
        <p class="text-gray-600">Thảo luận và chia sẻ với cộng đồng</p>
      </div>
      <router-link
        v-if="authStore.isAuthenticated"
        to="/forum/new"
        class="btn btn-primary"
      >
        + Tạo chủ đề mới
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-3 space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <div v-else>
          <div v-if="threads.length === 0" class="text-center py-12 text-gray-500">
            <p>Chưa có chủ đề nào trong chuyên mục này.</p>
          </div>
          <div
            v-for="thread in threads"
            :key="thread._id"
            class="card cursor-pointer hover:shadow-lg transition-all"
            @click="$router.push(`/forum/${thread._id}`)"
          >
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <img
                  v-if="thread.author.avatar"
                  :src="thread.author.avatar"
                  :alt="thread.author.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold"
                >
                  {{ thread.author.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span
                        v-if="getCategoryName(thread.category)"
                        class="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded"
                      >
                        {{ getCategoryName(thread.category) }}
                      </span>
                      <span v-if="thread.is_pinned" class="text-yellow-500 text-sm">📌 Ghim</span>
                    </div>
                    <h3 class="text-xl font-bold">{{ thread.title }}</h3>
                  </div>
                </div>
                <p class="text-gray-600 mb-3 line-clamp-2">{{ thread.content }}</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    <span>{{ thread.author.name }}</span>
                    <span>{{ formatDate(thread.createdAt) }}</span>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span>👁️ {{ thread.stats?.views_count || 0 }}</span>
                    <span>💬 {{ thread.stats?.replies_count || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-6">
        <!-- Chuyên mục -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Chuyên mục</h3>
          <div class="space-y-2">
            <button
              @click="selectedCategory = null"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                !selectedCategory 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              Tất cả chuyên mục
            </button>
            <button
              v-for="category in categories"
              :key="category._id"
              @click="selectedCategory = category._id"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                selectedCategory === category._id
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div class="card">
          <h3 class="font-bold text-lg mb-4">Thống kê</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Tổng chủ đề</span>
              <span class="font-semibold">{{ threads.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tổng bình luận</span>
              <span class="font-semibold">-</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import type { ForumThread, Category } from '../../types';

const authStore = useAuthStore();
const loading = ref(true);
const loadingCategories = ref(true);
const threads = ref<ForumThread[]>([]);
const categories = ref<Category[]>([]);
const selectedCategory = ref<string | null>(null);

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchThreads()]);
});

watch(selectedCategory, () => {
  fetchThreads();
});

async function fetchThreads() {
  loading.value = true;
  try {
    const params: any = { page: 1, limit: 20 };
    if (selectedCategory.value) {
      params.category = selectedCategory.value;
    }
    const response = await api.get('/forum/threads', { params });
    threads.value = response.data?.data?.data || response.data?.data || [];
  } catch (error) {
    console.error('Error fetching threads:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  loadingCategories.value = true;
  try {
    const response = await api.get('/categories', {
      params: { type: 'forum' },
    });
    categories.value = Array.isArray(response.data?.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loadingCategories.value = false;
  }
}

function getCategoryName(category?: string | { _id: string; name: string; slug?: string }): string {
  if (!category) return '';
  if (typeof category === 'string') return '';
  return category.name || '';
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

