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
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Bình luận ({{ totalComments }})</h2>
            <button
              v-if="comments.length > 0"
              @click="toggleCommentsVisibility"
              class="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': showComments }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>{{ showComments ? 'Ẩn bình luận' : 'Hiện bình luận' }}</span>
            </button>
          </div>

          <!-- Form nhập bình luận -->
          <div v-if="authStore.isAuthenticated" class="mb-6 pb-6 border-b border-gray-200">
            <textarea
              v-model="newComment"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Viết bình luận của bạn..."
            ></textarea>
            <div class="flex items-center justify-between mt-3">
              <button
                @click="submitComment"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Gửi bình luận
              </button>
              <button
                v-if="comments.length > MAX_COMMENTS_TO_SHOW && showComments"
                @click="toggleShowAll"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {{ showAllComments ? `Ẩn bớt (chỉ hiện ${MAX_COMMENTS_TO_SHOW})` : `Hiện hết (${comments.length})` }}
              </button>
            </div>
          </div>
          <div v-else class="mb-6 pb-6 border-b border-gray-200 p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-gray-600 mb-3">Đăng nhập để bình luận</p>
            <router-link to="/login" class="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              Đăng nhập
            </router-link>
          </div>

          <!-- Danh sách bình luận -->
          <div v-if="showComments">
            <div v-if="displayedComments.length === 0" class="text-center py-12 text-gray-500">
              <svg
                class="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p class="text-lg font-medium">Chưa có bình luận nào</p>
              <p class="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
            </div>
            <div v-else class="space-y-4">
              <CommentItem
                v-for="comment in displayedComments"
                :key="comment._id"
                :comment="comment"
                :thread-id="article!._id"
                target-model="Article"
                @reply="handleReply"
                @like="handleLike"
                @refresh="fetchComments"
              />
            </div>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { Article, Comment, Category } from '../../types';
import CommentItem from '../../components/CommentItem.vue';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const article = ref<Article | null>(null);
const comments = ref<Comment[]>([]);
const newComment = ref('');
const showComments = ref(true); // Hiển thị/ẩn toàn bộ phần bình luận
const showAllComments = ref(true); // Mặc định hiển thị tất cả
const MAX_COMMENTS_TO_SHOW = 5; // Số lượng comments hiển thị khi ẩn bớt

const totalComments = computed(() => {
  const countReplies = (comment: Comment): number => {
    return 1 + (comment.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
  };
  return comments.value.reduce((sum, comment) => sum + countReplies(comment), 0);
});

const displayedComments = computed(() => {
  if (!showAllComments.value) {
    return comments.value.slice(0, MAX_COMMENTS_TO_SHOW);
  }
  return comments.value;
});

onMounted(async () => {
  await fetchArticle();
  if (article.value) {
    await fetchComments();
  }
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
  if (!article.value) {
    console.warn('Cannot fetch comments: article not loaded yet');
    return;
  }
  try {
    const response = await api.get('/comments', {
      params: {
        target_model: 'Article',
        target_id: article.value._id,
      },
    });
    
    // Xử lý cấu trúc response
    // API trả về: { success: true, data: { data: commentTree, pagination: {...} }, timestamp: ... }
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

function toggleShowAll() {
  showAllComments.value = !showAllComments.value;
}

function toggleCommentsVisibility() {
  showComments.value = !showComments.value;
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
    showAllComments.value = true; // Hiển thị tất cả sau khi gửi comment mới
    await fetchComments();
  } catch (error: any) {
    console.error('Error submitting comment:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
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

