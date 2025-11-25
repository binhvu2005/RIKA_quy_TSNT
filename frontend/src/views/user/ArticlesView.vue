<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4">Tin tức & Bài viết</h1>
      <p class="text-gray-600">Cập nhật tin tức mới nhất từ cộng đồng</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Main Content -->
      <div class="flex-1">
        <!-- Filters -->
        <div class="mb-6 flex flex-wrap gap-4">
          <select v-model="filters.category" class="input w-auto">
            <option value="">Tất cả danh mục</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tìm kiếm..."
            class="input flex-1 max-w-xs"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article
            v-for="article in articles"
            :key="article._id"
            class="card cursor-pointer transform hover:scale-105 transition-all"
            @click="$router.push(`/articles/${article.slug}`)"
          >
            <div v-if="article.thumbnail" class="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
              <img :src="article.thumbnail" :alt="article.title" class="w-full h-full object-cover">
            </div>
            <div class="flex items-center space-x-2 mb-2">
              <span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                {{ getCategoryName(article.category) }}
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(article.createdAt) }}</span>
            </div>
            <h3 class="text-xl font-bold mb-2 line-clamp-2">{{ article.title }}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ stripHtml(article.content) }}</p>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <span>{{ article.author.name }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <span>👁️ {{ article.stats?.views || 0 }}</span>
                <span>💬 {{ article.stats?.comments || 0 }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="mt-8 flex justify-center space-x-2">
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="w-full lg:w-80 space-y-6">
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Danh mục</h3>
          <ul class="space-y-2">
            <li v-for="cat in categories" :key="cat._id">
              <router-link
                :to="`/articles?category=${cat._id}`"
                class="text-gray-700 hover:text-primary-600 transition-colors"
              >
                {{ cat.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import type { Article, Category, Pagination } from '../../types';

const route = useRoute();
const loading = ref(true);
const articles = ref<Article[]>([]);
const categories = ref<Category[]>([]);
const currentPage = ref(1);
const pagination = ref<Pagination | null>(null);

const filters = reactive({
  category: '',
  search: '',
});

onMounted(async () => {
  await Promise.all([fetchArticles(), fetchCategories()]);
  if (route.query.category) {
    filters.category = route.query.category as string;
  }
});

watch([() => filters.category, () => filters.search], () => {
  currentPage.value = 1;
  fetchArticles();
});

async function fetchArticles() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: 12,
      status: 'published',
    };
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;

    const response = await api.get('/articles', { params });
    articles.value = response.data.data.data || [];
    pagination.value = response.data.data.pagination || null;
  } catch (error) {
    console.error('Error fetching articles:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const response = await api.get('/categories', { params: { type: 'news' } });
    categories.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

function changePage(page: number) {
  currentPage.value = page;
  fetchArticles();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCategoryName(category: string | Category) {
  if (typeof category === 'string') {
    const cat = categories.value.find(c => c._id === category);
    return cat?.name || '';
  }
  return category.name;
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}

function stripHtml(html: string) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

