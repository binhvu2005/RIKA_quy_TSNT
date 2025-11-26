<template>
  <div class="image-upload">
    <!-- Preview Area -->
    <div
      v-if="previewUrl || value"
      class="relative mb-4 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600"
      :class="{ 'border-primary-500': isDragging }"
    >
      <img
        :src="previewUrl || value"
        alt="Preview"
        class="w-full h-64 object-cover"
      />
      <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          @click="removeImage"
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Xóa ảnh
        </button>
      </div>
      <div v-if="uploading" class="absolute inset-0 bg-black/70 flex items-center justify-center">
        <div class="text-center text-white">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <p class="text-sm">Đang tải lên...</p>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      v-if="!previewUrl && !value"
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="{
        'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDragging,
        'border-gray-300 dark:border-gray-600': !isDragging,
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="mb-4">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Kéo thả ảnh vào đây hoặc
        <button
          type="button"
          @click="triggerFileSelect"
          class="text-primary-600 hover:text-primary-700 font-medium"
          :disabled="uploading"
        >
          chọn file
        </button>
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-500">
        PNG, JPG, GIF tối đa 5MB
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const props = withDefaults(
  defineProps<{
    value?: string;
    folder?: 'avatars' | 'admin' | 'users';
    maxSize?: number; // in MB
  }>(),
  {
    folder: 'users',
    maxSize: 5,
  }
);

const emit = defineEmits<{
  'update:value': [value: string];
  'uploaded': [url: string];
  'error': [error: string];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>('');
const uploading = ref(false);
const error = ref('');
const isDragging = ref(false);

const endpoint = computed(() => {
  // Determine endpoint based on folder
  if (props.folder === 'avatars') {
    return '/upload/avatar';
  }
  return '/upload/image';
});

function triggerFileSelect() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    handleFile(file);
  }
}

async function handleFile(file: File) {
  error.value = '';

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'File phải là ảnh';
    return;
  }

  // Validate file size
  const maxSizeBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    error.value = `Kích thước file không được vượt quá ${props.maxSize}MB`;
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Upload file
  await uploadFile(file);
}

async function uploadFile(file: File) {
  uploading.value = true;
  error.value = '';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(endpoint.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const imageUrl = response.data?.url || response.data?.data?.url;
    if (imageUrl) {
      emit('update:value', imageUrl);
      emit('uploaded', imageUrl);
      toast.success('Tải ảnh lên thành công');
      previewUrl.value = '';
    } else {
      throw new Error('Không nhận được URL ảnh từ server');
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Không thể tải ảnh lên';
    error.value = errorMessage;
    emit('error', errorMessage);
    toast.error(errorMessage);
    previewUrl.value = '';
    console.error('Upload error:', err);
  } finally {
    uploading.value = false;
  }
}

function removeImage() {
  previewUrl.value = '';
  emit('update:value', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  error.value = '';
}

// Watch for external value changes
watch(
  () => props.value,
  (newValue) => {
    if (!newValue) {
      previewUrl.value = '';
    }
  }
);
</script>

<style scoped>
.image-upload {
  width: 100%;
}
</style>

