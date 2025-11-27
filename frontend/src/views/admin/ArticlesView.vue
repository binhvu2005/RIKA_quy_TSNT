<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý bài viết</h2>
      <router-link to="/admin/articles/new" class="btn btn-primary">
        + Tạo bài viết mới
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="input"
        />
        <select v-model="filters.status" class="input">
          <option value="">Tất cả trạng thái</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select v-model="filters.category" class="input">
          <option value="">Tất cả danh mục</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Articles List -->
    <div class="space-y-4">
      <div
        v-for="article in articles"
        :key="article._id"
        class="card flex items-start space-x-4 hover:shadow-lg transition-shadow"
      >
        <div v-if="article.thumbnail" class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img :src="article.thumbnail" :alt="article.title" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-xl font-bold">{{ article.title }}</h3>
            <span
              :class="{
                'bg-green-100 text-green-700': article.status === 'published',
                'bg-yellow-100 text-yellow-700': article.status === 'draft',
                'bg-gray-100 text-gray-700': article.status === 'archived',
              }"
              class="px-2 py-1 rounded text-xs"
            >
              {{ article.status }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ stripHtml(article.content) }}</p>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-4">
              <span>{{ getCategoryName(article.category) }}</span>
              <span>{{ article.author.name }}</span>
              <span>{{ formatDate(article.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span>👁️ {{ article.stats?.views || 0 }}</span>
              <span>💬 {{ article.stats?.comments || 0 }}</span>
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <router-link
              v-if="article._id"
              :to="`/admin/articles/${article._id}/edit`"
              class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
              title="Sửa"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button
              v-else
              @click="toast.warning('Bài viết không có ID')"
              class="p-2 text-gray-400 cursor-not-allowed opacity-50"
              disabled
              title="Sửa"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="deleteArticle(article._id)"
              class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Xóa"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <router-link
              :to="`/articles/${article.slug}`"
              target="_blank"
              class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Xem"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="mt-6 flex justify-center space-x-2">
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useToast } from 'vue-toastification';
import type { Article, Category, Pagination } from '../../types';

const toast = useToast();
const loading = ref(true);
const articles = ref<Article[]>([]);
const categories = ref<Category[]>([]);
const currentPage = ref(1);
const pagination = ref<Pagination | null>(null);

const filters = reactive({
  search: '',
  status: '',
  category: '',
});

onMounted(async () => {
  await Promise.all([fetchArticles(), fetchCategories()]);
});

watch([() => filters.search, () => filters.status, () => filters.category], () => {
  currentPage.value = 1;
  fetchArticles();
});

async function fetchArticles() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: 20,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;

    const response = await api.get('/articles', { params });
    const articlesData = response.data.data.data || [];
    articles.value = articlesData;
    pagination.value = response.data.data.pagination || null;
    
    // Debug: Log articles to check _id
    console.log('Articles loaded:', articlesData.map((a: Article) => ({ 
      id: a._id, 
      title: a.title,
      hasId: !!a._id 
    })));
  } catch (error) {
    console.error('Error fetching articles:', error);
    toast.error('Không thể tải danh sách bài viết');
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
}

async function deleteArticle(articleId: string) {
  if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

  try {
    await api.delete(`/articles/${articleId}`);
    toast.success('Đã xóa bài viết');
    fetchArticles();
  } catch (error) {
    toast.error('Không thể xóa bài viết');
  }
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
</style>

