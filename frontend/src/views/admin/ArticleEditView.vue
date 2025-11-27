<template>
  <div class="animate-fade-in max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">
      {{ isEdit ? 'Sửa bài viết' : 'Tạo bài viết mới' }}
    </h2>

    <form @submit.prevent="saveArticle" class="card space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
        <input
          v-model="form.title"
          type="text"
          required
          class="input"
          placeholder="Nhập tiêu đề bài viết"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
        <select v-model="form.category" required class="input">
          <option value="">Chọn danh mục</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
        <RichTextEditor
          v-model="form.content"
          placeholder="Nhập nội dung bài viết..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
        <ImageUpload
          v-model="form.thumbnail"
          folder="admin"
          @uploaded="(url) => form.thumbnail = url"
        />
        <p class="text-xs text-gray-500 mt-2">Hoặc nhập URL thủ công:</p>
        <input
          v-model="form.thumbnail"
          type="url"
          class="input mt-1"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tags (phân cách bằng dấu phẩy)</label>
        <input
          v-model="tagsInput"
          type="text"
          class="input"
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
        <select v-model="form.status" required class="input">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div class="flex space-x-4">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Đang lưu...' : 'Lưu bài viết' }}
        </button>
        <router-link to="/admin/articles" class="btn btn-secondary">
          Hủy
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import ImageUpload from '../../components/common/ImageUpload.vue';
import RichTextEditor from '../../components/admin/RichTextEditor.vue';
import type { Category } from '../../types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const categories = ref<Category[]>([]);
const tagsInput = ref('');

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  title: '',
  category: '',
  content: '',
  thumbnail: '',
  tags: [] as string[],
  status: 'draft',
});

onMounted(async () => {
  await fetchCategories();
  if (isEdit.value) {
    await fetchArticle();
  }
});

async function fetchCategories() {
  try {
    const response = await api.get('/categories', { params: { type: 'news' } });
    categories.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

async function fetchArticle() {
  loading.value = true;
  try {
    const id = route.params.id as string;
    if (!id) {
      toast.error('Không tìm thấy ID bài viết');
      router.push('/admin/articles');
      return;
    }
    
    const response = await api.get(`/articles/${id}`);
    const article = response.data?.data || response.data;
    
    if (!article) {
      toast.error('Không tìm thấy bài viết');
      router.push('/admin/articles');
      return;
    }
    
    form.title = article.title || '';
    form.category = typeof article.category === 'string' 
      ? article.category 
      : article.category?._id || '';
    form.content = article.content || '';
    form.thumbnail = article.thumbnail || '';
    form.status = article.status || 'draft';
    tagsInput.value = article.tags?.join(', ') || '';
  } catch (error: any) {
    console.error('Error fetching article:', error);
    const errorMessage = error.response?.data?.message || 'Không thể tải bài viết';
    toast.error(errorMessage);
    router.push('/admin/articles');
  } finally {
    loading.value = false;
  }
}

async function saveArticle() {
  loading.value = true;
  try {
    form.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);

    const data = {
      ...form,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    if (isEdit.value) {
      const id = route.params.id as string;
      if (!id) {
        toast.error('Không tìm thấy ID bài viết');
        return;
      }
      await api.patch(`/articles/${id}`, data);
      toast.success('Đã cập nhật bài viết');
    } else {
      await api.post('/articles', data);
      toast.success('Đã tạo bài viết');
    }
    router.push('/admin/articles');
  } catch (error: any) {
    console.error('Error saving article:', error);
    const errorMessage = error.response?.data?.message || 'Không thể lưu bài viết';
    toast.error(errorMessage);
  } finally {
    loading.value = false;
  }
}
</script>

