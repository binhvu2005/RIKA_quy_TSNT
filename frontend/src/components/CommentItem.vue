<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow" :class="{ 'ml-8': isReply }">
    <div class="flex items-start space-x-3">
      <!-- Avatar -->
      <img
        v-if="comment.user?.avatar"
        :src="comment.user.avatar"
        :alt="comment.user.name"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div
        v-else
        class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      >
        {{ comment.user?.name?.charAt(0).toUpperCase() || 'U' }}
      </div>

      <div class="flex-1 min-w-0">
        <!-- Header: Tên và thời gian -->
        <div class="flex items-center space-x-2 mb-2">
          <span class="font-semibold text-gray-900">{{ comment.user?.name || 'Người dùng' }}</span>
          <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
        </div>

        <!-- Nội dung comment -->
        <p class="text-gray-700 mb-3 whitespace-pre-wrap">{{ comment.content }}</p>

        <!-- Actions: Like và Reply -->
        <div class="flex items-center space-x-4">
          <button
            @click="toggleLike"
            :disabled="!authStore.isAuthenticated"
            class="flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="comment.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'"
          >
            <svg
              class="w-5 h-5"
              :fill="comment.isLiked ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-sm" :class="comment.isLiked ? 'text-red-500' : 'text-gray-400'">{{ comment.likes || 0 }}</span>
          </button>

          <button
            v-if="authStore.isAuthenticated"
            @click="toggleReplyForm"
            class="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span class="text-sm">Trả lời</span>
          </button>
        </div>

        <!-- Form reply -->
        <div v-if="showReplyForm" class="mt-4 pt-4 border-t border-gray-200">
          <textarea
            v-model="replyContent"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
            placeholder="Viết phản hồi..."
          ></textarea>
          <div class="flex items-center space-x-2 mt-2">
            <button @click="submitReply" class="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              Gửi
            </button>
            <button @click="cancelReply" class="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
              Hủy
            </button>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-4">
          <CommentItem
            v-for="reply in comment.replies"
            :key="reply._id"
            :comment="reply"
            :thread-id="threadId"
            :target-model="targetModel"
            :is-reply="true"
            @reply="handleReply"
            @like="handleLike"
            @refresh="handleRefresh"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import type { Comment } from '../types';

interface Props {
  comment: Comment;
  threadId: string;
  targetModel?: string; // 'Article' hoặc 'ForumThread'
  isReply?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  targetModel: 'ForumThread',
  isReply: false,
});

const emit = defineEmits<{
  reply: [parentId: string, content: string];
  like: [commentId: string];
  refresh: [];
}>();

const authStore = useAuthStore();
const toast = useToast();

const showReplyForm = ref(false);
const replyContent = ref('');

function formatDate(date?: string) {
  if (!date) return '';
  const now = new Date();
  const commentDate = new Date(date);
  const diffMs = now.getTime() - commentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return commentDate.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function toggleLike() {
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để thích bình luận');
    return;
  }

  try {
    // API createOrUpdate sẽ tự động toggle: nếu đã like thì unlike, chưa like thì like
    await api.post('/reactions', {
      target_model: 'Comment',
      target_id: props.comment._id,
      type: 'like',
    });
    
    // Emit event để parent component refresh và cập nhật like status
    emit('like', props.comment._id);
  } catch (error: any) {
    console.error('Error toggling like:', error);
    if (error.response?.status === 401) {
      toast.warning('Vui lòng đăng nhập để thích bình luận');
    } else {
      toast.error('Không thể thích bình luận');
    }
  }
}

function toggleReplyForm() {
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để trả lời');
    return;
  }
  showReplyForm.value = !showReplyForm.value;
  if (!showReplyForm.value) {
    replyContent.value = '';
  }
}

function cancelReply() {
  showReplyForm.value = false;
  replyContent.value = '';
}

async function submitReply() {
  if (!replyContent.value.trim()) {
    toast.warning('Vui lòng nhập nội dung phản hồi');
    return;
  }

  try {
    await api.post('/comments', {
      content: replyContent.value,
      target_model: props.targetModel,
      target_id: props.threadId,
      parent_id: props.comment._id,
    });
    
    toast.success('Phản hồi đã được gửi');
    replyContent.value = '';
    showReplyForm.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Error submitting reply:', error);
    toast.error('Không thể gửi phản hồi');
  }
}

function handleReply(parentId: string, content: string) {
  emit('reply', parentId, content);
}

function handleLike(commentId: string) {
  emit('like', commentId);
}

function handleRefresh() {
  emit('refresh');
}
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

