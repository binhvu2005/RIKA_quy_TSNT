<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý danh mục</h2>
      <button @click="openAddModal()" class="btn btn-primary">
        + Thêm danh mục
      </button>
    </div>

    <div class="card">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="category in categories"
          :key="category._id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ category.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ category.slug }} • {{ category.type }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editCategory(category)" class="btn btn-secondary text-sm">
              Sửa
            </button>
            <button @click="deleteCategory(category._id)" class="btn bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 text-sm">
              Xóa
            </button>
          </div>
        </div>
        <div v-if="categories.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          Chưa có danh mục nào
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới' }}
          </h3>
        </div>

        <form @submit.prevent="saveCategory" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tên danh mục <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Slug
            </label>
            <input
              v-model="form.slug"
              type="text"
              class="input"
              placeholder="Tự động tạo từ tên (có thể chỉnh sửa)"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">URL-friendly version của tên</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loại <span class="text-red-500">*</span>
            </label>
            <select v-model="form.type" class="input" required>
              <option value="news">Tin tức</option>
              <option value="forum">Diễn đàn</option>
              <option value="document">Tài liệu</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Nhập mô tả danh mục"
            ></textarea>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
              :disabled="saving"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <span v-if="saving" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useToast } from 'vue-toastification';
import type { Category } from '../../types';

const toast = useToast();
const loading = ref(true);
const categories = ref<Category[]>([]);
const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const error = ref('');

const form = reactive({
  _id: '',
  name: '',
  slug: '',
  type: 'news',
  description: '',
});

onMounted(async () => {
  await fetchCategories();
});

watch(() => form.name, (newName) => {
  if (!isEdit.value && !form.slug) {
    // Auto-generate slug from name
    form.slug = newName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

async function fetchCategories() {
  loading.value = true;
  try {
    const response = await api.get('/categories');
    categories.value = response.data.data || [];
  } catch (error) {
    toast.error('Không thể tải danh sách danh mục');
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  isEdit.value = false;
  resetForm();
  showModal.value = true;
}

function editCategory(category: Category) {
  isEdit.value = true;
  form._id = category._id || '';
  form.name = category.name;
  form.slug = category.slug;
  form.type = category.type;
  form.description = (category.description as string | undefined) || '';
  showModal.value = true;
}

function resetForm() {
  form._id = '';
  form.name = '';
  form.slug = '';
  form.type = 'news';
  form.description = '';
  error.value = '';
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function saveCategory() {
  saving.value = true;
  error.value = '';

  try {
    const payload: any = {
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: form.type,
    };

    if (form.description) {
      payload.description = form.description.trim();
    }

    if (isEdit.value) {
      if (!form._id) {
        error.value = 'Không tìm thấy category ID';
        return;
      }
      await api.patch(`/categories/${form._id}`, payload);
      toast.success('Đã cập nhật danh mục');
    } else {
      await api.post('/categories', payload);
      toast.success('Đã tạo danh mục mới');
    }

    closeModal();
    fetchCategories();
  } catch (err: any) {
    console.error('Save category error:', err);
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        error.value = err.response.data.message.join(', ');
      } else {
        error.value = err.response.data.message;
      }
    } else {
      error.value = isEdit.value ? 'Không thể cập nhật danh mục' : 'Không thể tạo danh mục mới';
    }
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
}

async function deleteCategory(categoryId: string) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

  try {
    await api.delete(`/categories/${categoryId}`);
    toast.success('Đã xóa danh mục');
    fetchCategories();
  } catch (error) {
    toast.error('Không thể xóa danh mục');
  }
}
</script>
