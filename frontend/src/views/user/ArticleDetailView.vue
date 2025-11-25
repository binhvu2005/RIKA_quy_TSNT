<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <article v-else-if="article" class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center space-x-2 mb-4">
          <router-link
            :to="`/articles?category=${getCategoryId(article.category)}`"
            class="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
          >
            {{ getCategoryName(article.category) }}
          </router-link>
          <span class="text-sm text-gray-500">{{ formatDate(article.createdAt) }}</span>
        </div>
        <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
        <div class="flex items-center space-x-4 text-gray-600">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
              {{ article.author.name.charAt(0) }}
            </div>
            <span>{{ article.author.name }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span>👁️ {{ article.stats?.views || 0 }} lượt xem</span>
            <span>💬 {{ article.stats?.comments || 0 }} bình luận</span>
          </div>
        </div>
      </header>

      <!-- Thumbnail -->
      <div v-if="article.thumbnail" class="mb-8 rounded-xl overflow-hidden">
        <img :src="article.thumbnail" :alt="article.title" class="w-full h-96 object-cover">
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none mb-8" v-html="article.content"></div>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="mb-8">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Comments Section -->
      <section class="mt-12 border-t pt-8">
        <h2 class="text-2xl font-bold mb-6">Bình luận ({{ comments.length }})</h2>
        <div v-if="authStore.isAuthenticated" class="mb-6">
          <textarea
            v-model="newComment"
            rows="4"
            class="input w-full mb-4"
            placeholder="Viết bình luận..."
          ></textarea>
          <button @click="submitComment" class="btn btn-primary">
            Gửi bình luận
          </button>
        </div>
        <div v-else class="mb-6 p-4 bg-gray-100 rounded-lg text-center">
          <p class="text-gray-600 mb-2">Đăng nhập để bình luận</p>
          <router-link to="/login" class="btn btn-primary text-sm">
            Đăng nhập
          </router-link>
        </div>

        <div class="space-y-6">
          <div
            v-for="comment in comments"
            :key="comment._id"
            class="bg-gray-50 rounded-lg p-4"
          >
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {{ comment.author.username.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-semibold">{{ comment.author.username }}</span>
                  <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-gray-700">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { Article, Comment, Category } from '../../types';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const article = ref<Article | null>(null);
const comments = ref<Comment[]>([]);
const newComment = ref('');

onMounted(async () => {
  await Promise.all([fetchArticle(), fetchComments()]);
});

async function fetchArticle() {
  try {
    const slug = route.params.slug as string;
    const response = await api.get(`/articles/slug/${slug}`);
    article.value = response.data.data;
  } catch (error) {
    console.error('Error fetching article:', error);
    toast.error('Không tìm thấy bài viết');
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  if (!article.value) return;
  try {
    const response = await api.get('/comments', {
      params: {
        target_model: 'Article',
        target_id: article.value._id,
      },
    });
    comments.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !article.value) return;

  try {
    await api.post('/comments', {
      content: newComment.value,
      target_model: 'Article',
      target_id: article.value._id,
    });
    toast.success('Bình luận đã được gửi');
    newComment.value = '';
    await fetchComments();
  } catch (error) {
    toast.error('Không thể gửi bình luận');
  }
}

function getCategoryName(category: string | Category) {
  if (typeof category === 'string') return '';
  return category.name;
}

function getCategoryId(category: string | Category) {
  if (typeof category === 'string') return category;
  return category._id;
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.prose {
  @apply text-gray-700;
}

.prose h1,
.prose h2,
.prose h3 {
  @apply text-gray-900 font-bold;
}

.prose img {
  @apply rounded-lg;
}
</style>

