<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý diễn đàn</h2>
      <div class="flex items-center space-x-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm..."
          class="input"
          @input="debouncedSearch"
        />
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-3">Tiêu đề</th>
                <th class="text-left p-3">Tác giả</th>
                <th class="text-left p-3">Lượt xem</th>
                <th class="text-left p-3">Bình luận</th>
                <th class="text-left p-3">Ngày tạo</th>
                <th class="text-left p-3">Trạng thái</th>
                <th class="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="thread in threads"
                :key="thread._id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <span v-if="thread.is_sticky" class="text-yellow-500">📌</span>
                    <span class="font-medium">{{ thread.title }}</span>
                  </div>
                </td>
                <td class="p-3">{{ thread.author?.name || 'N/A' }}</td>
                <td class="p-3">{{ thread.stats?.views_count || 0 }}</td>
                <td class="p-3">{{ thread.stats?.replies_count || 0 }}</td>
                <td class="p-3">{{ formatDate(thread.createdAt) }}</td>
                <td class="p-3">
                  <span
                    class="px-2 py-1 rounded text-xs"
                    :class="thread.is_sticky ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'"
                  >
                    {{ thread.is_sticky ? 'Ghim' : 'Bình thường' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewThread(thread._id)"
                      class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                      title="Xem"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      @click="toggleSticky(thread)"
                      class="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                      :title="thread.is_sticky ? 'Bỏ ghim' : 'Ghim'"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 12V2H6v10l-4 4v2h4v6h8v-6h4v-2l-4-4zm-2-8h2v8h-2V4z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteThread(thread)"
                      class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination" class="flex items-center justify-between mt-4 pt-4 border-t">
          <p class="text-sm text-gray-600">
            Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            của {{ pagination.total }} kết quả
          </p>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span class="px-3 py-1">{{ pagination.page }} / {{ pagination.totalPages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useToast } from 'vue-toastification';
import type { ForumThread, Pagination } from '../../types';

const router = useRouter();
const toast = useToast();

const loading = ref(true);
const threads = ref<ForumThread[]>([]);
const pagination = ref<Pagination | null>(null);
const searchQuery = ref('');
let searchTimeout: NodeJS.Timeout;

onMounted(async () => {
  await fetchThreads();
});

async function fetchThreads() {
  loading.value = true;
  try {
    const response = await api.get('/forum/threads', {
      params: {
        page: pagination.value?.page || 1,
        limit: 20,
        search: searchQuery.value || undefined,
      },
    });
    
    const data = response.data?.data || response.data;
    threads.value = data.data || [];
    pagination.value = data.pagination || null;
  } catch (error) {
    console.error('Error fetching threads:', error);
    toast.error('Không thể tải danh sách chủ đề');
  } finally {
    loading.value = false;
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value = { ...pagination.value!, page: 1 };
    fetchThreads();
  }, 500);
}

function changePage(page: number) {
  if (pagination.value) {
    pagination.value.page = page;
    fetchThreads();
  }
}

function viewThread(id: string) {
  window.open(`/forum/${id}`, '_blank');
}

async function toggleSticky(thread: ForumThread) {
  try {
    await api.patch(`/forum/threads/${thread._id}`, {
      is_sticky: !thread.is_sticky,
    });
    toast.success(thread.is_sticky ? 'Đã bỏ ghim chủ đề' : 'Đã ghim chủ đề');
    await fetchThreads();
  } catch (error) {
    console.error('Error toggling sticky:', error);
    toast.error('Không thể thay đổi trạng thái ghim');
  }
}

async function deleteThread(thread: ForumThread) {
  if (!confirm(`Bạn có chắc muốn xóa chủ đề "${thread.title}"?`)) {
    return;
  }

  try {
    await api.delete(`/forum/threads/${thread._id}`);
    toast.success('Đã xóa chủ đề');
    await fetchThreads();
  } catch (error) {
    console.error('Error deleting thread:', error);
    toast.error('Không thể xóa chủ đề');
  }
}

function formatDate(date?: string) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('vi-VN');
}
</script>
