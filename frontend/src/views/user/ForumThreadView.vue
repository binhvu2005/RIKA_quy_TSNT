<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="thread" class="max-w-4xl mx-auto">
      <router-link to="/forum" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Quay lại diễn đàn
      </router-link>

      <div class="card mb-6">
        <h1 class="text-3xl font-bold mb-4">{{ thread.title }}</h1>
        <div class="flex items-center space-x-4 text-gray-600 mb-6">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
              {{ thread.author.username.charAt(0).toUpperCase() }}
            </div>
            <span>{{ thread.author.username }}</span>
          </div>
          <span>{{ formatDate(thread.createdAt) }}</span>
          <span>👁️ {{ thread.stats?.views || 0 }}</span>
        </div>
        <div class="prose max-w-none" v-html="thread.content"></div>
      </div>

      <div class="card">
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
                {{ comment.author.username.charAt(0).toUpperCase() }}
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { ForumThread, Comment } from '../../types';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const thread = ref<ForumThread | null>(null);
const comments = ref<Comment[]>([]);
const newComment = ref('');

onMounted(async () => {
  await Promise.all([fetchThread(), fetchComments()]);
});

async function fetchThread() {
  try {
    const id = route.params.id as string;
    const response = await api.get(`/forum/threads/${id}`);
    thread.value = response.data.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    toast.error('Không tìm thấy chủ đề');
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  if (!thread.value) return;
  try {
    const response = await api.get('/comments', {
      params: {
        target_model: 'ForumThread',
        target_id: thread.value._id,
      },
    });
    comments.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !thread.value) return;

  try {
    await api.post('/comments', {
      content: newComment.value,
      target_model: 'ForumThread',
      target_id: thread.value._id,
    });
    toast.success('Bình luận đã được gửi');
    newComment.value = '';
    await fetchComments();
  } catch (error) {
    toast.error('Không thể gửi bình luận');
  }
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
</style>

