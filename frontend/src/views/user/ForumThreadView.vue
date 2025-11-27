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
        <div class="flex items-center space-x-2 mb-4">
          <span
            v-if="getCategoryName(thread.category)"
            class="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded"
          >
            {{ getCategoryName(thread.category) }}
          </span>
          <span v-if="thread.is_pinned" class="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded">
            📌 Đã ghim
          </span>
        </div>
        <h1 class="text-3xl font-bold mb-4">{{ thread.title }}</h1>
        <div class="flex items-center space-x-4 text-gray-600 mb-6">
          <div class="flex items-center space-x-2">
            <img
              v-if="thread.author.avatar"
              :src="thread.author.avatar"
              :alt="thread.author.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div
              v-else
              class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold"
            >
              {{ thread.author.name.charAt(0).toUpperCase() }}
            </div>
            <span>{{ thread.author.name }}</span>
          </div>
          <span>{{ formatDate(thread.createdAt) }}</span>
          <span>👁️ {{ thread.stats?.views_count || 0 }}</span>
        </div>
        <div class="prose max-w-none" v-html="thread.content"></div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Bình luận ({{ totalComments }})</h2>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">Sắp xếp:</label>
            <select
              v-model="sortBy"
              @change="applySort"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="mostLiked">Nhiều tim nhất</option>
            </select>
          </div>
        </div>

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

        <div v-if="sortedComments.length === 0" class="text-center py-8 text-gray-500">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
        <div v-else class="space-y-4">
          <CommentItem
            v-for="comment in sortedComments"
            :key="comment._id"
            :comment="comment"
            :thread-id="thread!._id"
            @reply="handleReply"
            @like="handleLike"
            @refresh="fetchComments"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { ForumThread, Comment } from '../../types';
import CommentItem from '../../components/CommentItem.vue';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const thread = ref<ForumThread | null>(null);
const comments = ref<Comment[]>([]);
const newComment = ref('');
const sortBy = ref('newest');

const totalComments = computed(() => {
  const countReplies = (comment: Comment): number => {
    return 1 + (comment.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
  };
  return comments.value.reduce((sum, comment) => sum + countReplies(comment), 0);
});

const sortedComments = computed(() => {
  const sorted = [...comments.value];
  
  if (sortBy.value === 'newest') {
    return sorted.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } else if (sortBy.value === 'oldest') {
    return sorted.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
  } else if (sortBy.value === 'mostLiked') {
    return sorted.sort((a, b) => {
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      return likesB - likesA;
    });
  }
  
  return sorted;
});

onMounted(async () => {
  await fetchThread();
  if (thread.value) {
    await fetchComments();
  }
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
  if (!thread.value) {
    console.warn('Cannot fetch comments: thread not loaded yet');
    return;
  }
  try {
    const response = await api.get('/comments', {
      params: {
        target_model: 'ForumThread',
        target_id: thread.value._id,
      },
    });
    
    // API trả về: { success: true, data: { data: commentTree, pagination: {...} }, timestamp: ... }
    // Hoặc: { data: { data: commentTree, pagination: {...} } }
    let commentTree: Comment[] = [];
    
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      // Cấu trúc: response.data.data.data (có TransformInterceptor)
      commentTree = response.data.data.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Cấu trúc: response.data.data (không có TransformInterceptor hoặc đã unwrap)
      commentTree = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Cấu trúc: response.data (trực tiếp là array)
      commentTree = response.data;
    }
    
    console.log('Comments fetched:', commentTree.length, 'comments');
    
    // Load likes và check liked status cho mỗi comment
    if (commentTree.length > 0) {
      comments.value = await Promise.all(
        commentTree.map((comment: Comment) => loadCommentData(comment))
      );
    } else {
      comments.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    comments.value = [];
    toast.error('Không thể tải bình luận');
  }
}

async function loadCommentData(comment: Comment): Promise<Comment> {
  // Initialize likes if not present
  if (comment.likes === undefined) {
    comment.likes = 0;
  }
  if (comment.isLiked === undefined) {
    comment.isLiked = false;
  }
  
  // Load likes count
  try {
    const likesResponse = await api.get('/reactions', {
      params: {
        target_model: 'Comment',
        target_id: comment._id,
      },
    });
    const reactions = likesResponse.data?.data || likesResponse.data || {};
    comment.likes = (reactions.like || []).length + (reactions.love || []).length;
    
    // Check if current user liked
    if (authStore.isAuthenticated) {
      try {
        const checkResponse = await api.get('/reactions/check', {
          params: {
            target_model: 'Comment',
            target_id: comment._id,
          },
        });
        comment.isLiked = !!(checkResponse.data?.data || checkResponse.data);
      } catch {
        comment.isLiked = false;
      }
    }
  } catch (error) {
    console.warn('Error loading likes for comment:', comment._id, error);
    comment.likes = 0;
    comment.isLiked = false;
  }
  
  // Recursively load replies
  if (comment.replies && comment.replies.length > 0) {
    comment.replies = await Promise.all(
      comment.replies.map((reply: Comment) => loadCommentData(reply))
    );
  }
  
  return comment;
}

function applySort() {
  // Sorting is handled by computed property
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

function handleReply(parentId: string, content: string) {
  // Handled by CommentItem component
}

async function handleLike(commentId: string) {
  // Handled by CommentItem component, refresh after
  await fetchComments();
}

function getCategoryName(category?: string | { _id: string; name: string; slug?: string }): string {
  if (!category) return '';
  if (typeof category === 'string') return '';
  return category.name || '';
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.prose {
  @apply text-gray-700;
}
</style>

