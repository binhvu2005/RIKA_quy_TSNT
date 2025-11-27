<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="max-w-4xl mx-auto">
      <router-link to="/forum" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Quay lại diễn đàn
      </router-link>

      <div class="card">
        <h1 class="text-3xl font-bold mb-6">Tạo chủ đề mới</h1>

        <form @submit.prevent="submitThread" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Chuyên mục <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category"
              required
              class="input w-full"
              :disabled="loadingCategories"
            >
              <option value="">-- Chọn chuyên mục --</option>
              <option
                v-for="category in categories"
                :key="category._id"
                :value="category._id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="!form.category && submitted" class="text-red-500 text-sm mt-1">
              Vui lòng chọn chuyên mục
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              minlength="5"
              class="input w-full"
              placeholder="Nhập tiêu đề chủ đề (tối thiểu 5 ký tự)"
            />
            <p class="text-gray-500 text-sm mt-1">
              {{ form.title.length }}/5 ký tự tối thiểu
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.content"
              required
              minlength="10"
              rows="12"
              class="input w-full resize-none"
              placeholder="Nhập nội dung chủ đề (tối thiểu 10 ký tự)"
            ></textarea>
            <p class="text-gray-500 text-sm mt-1">
              {{ form.content.length }}/10 ký tự tối thiểu
            </p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              @click="$router.back()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading || !canSubmit"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Đang tạo...' : 'Tạo chủ đề' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { Category } from '../../types';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const loadingCategories = ref(true);
const submitted = ref(false);
const categories = ref<Category[]>([]);

const form = reactive({
  title: '',
  content: '',
  category: '',
});

const canSubmit = computed(() => {
  return (
    form.title.length >= 5 &&
    form.content.length >= 10 &&
    form.category &&
    !loading.value
  );
});

onMounted(async () => {
  await fetchCategories();
});

async function fetchCategories() {
  loadingCategories.value = true;
  try {
    const response = await api.get('/categories', {
      params: { type: 'forum' },
    });
    // Flatten categories tree
    const flattenCategories = (cats: Category[]): Category[] => {
      const result: Category[] = [];
      cats.forEach((cat) => {
        result.push(cat);
        // If category has children, add them too
      });
      return result;
    };
    categories.value = Array.isArray(response.data?.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Không thể tải danh sách chuyên mục');
  } finally {
    loadingCategories.value = false;
  }
}

async function submitThread() {
  submitted.value = true;
  
  if (!canSubmit.value) {
    toast.error('Vui lòng điền đầy đủ thông tin');
    return;
  }

  loading.value = true;
  try {
    const response = await api.post('/forum/threads', {
      title: form.title,
      content: form.content,
      category: form.category,
    });
    
    toast.success('Tạo chủ đề thành công!');
    router.push(`/forum/${response.data?.data?._id || response.data?._id}`);
  } catch (error: any) {
    console.error('Error creating thread:', error);
    const message = error.response?.data?.message || 'Không thể tạo chủ đề';
    toast.error(message);
  } finally {
    loading.value = false;
  }
}
</script>

