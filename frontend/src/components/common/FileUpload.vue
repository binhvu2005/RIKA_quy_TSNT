<template>
  <div class="file-upload">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />
    
    <div
      @click="triggerFileSelect"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400',
        uploading ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <div v-if="uploading" class="flex flex-col items-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
        <p class="text-sm text-gray-600">Đang tải lên...</p>
      </div>
      
      <div v-else-if="fileUrl" class="flex flex-col items-center">
        <svg class="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-gray-700 mb-1">Đã tải lên thành công</p>
        <p class="text-xs text-gray-500 mb-2 truncate max-w-xs">{{ fileName }}</p>
        <button
          type="button"
          @click.stop="removeFile"
          class="text-xs text-red-600 hover:text-red-700"
        >
          Xóa file
        </button>
      </div>
      
      <div v-else class="flex flex-col items-center">
        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm font-medium text-gray-700 mb-1">
          {{ label || 'Kéo thả file vào đây hoặc click để chọn' }}
        </p>
        <p class="text-xs text-gray-500">
          {{ acceptText || `Chấp nhận: ${accept || 'Tất cả các file'}` }}
        </p>
        <p v-if="maxSize" class="text-xs text-gray-400 mt-1">
          Tối đa {{ maxSize }}MB
        </p>
      </div>
    </div>
    
    <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import api from '../../services/api';
import { useToast } from 'vue-toastification';

interface Props {
  modelValue?: string;
  accept?: string;
  maxSize?: number; // MB
  label?: string;
  acceptText?: string;
  folder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10,
  folder: 'documents',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  uploaded: [url: string];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const error = ref('');
const isDragging = ref(false);
const fileUrl = ref(props.modelValue || '');
const fileName = ref('');

const endpoint = computed(() => '/upload/image'); // Endpoint hỗ trợ cả ảnh và document

function triggerFileSelect() {
  if (uploading.value) return;
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
  fileName.value = file.name;

  // Validate file size
  const maxSizeBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    error.value = `Kích thước file không được vượt quá ${props.maxSize}MB`;
    fileName.value = '';
    return;
  }

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

    const uploadedUrl = response.data?.url || response.data?.data?.url;
    if (uploadedUrl) {
      fileUrl.value = uploadedUrl;
      emit('update:modelValue', uploadedUrl);
      emit('uploaded', uploadedUrl);
      toast.success('Tải file lên thành công');
    } else {
      throw new Error('Không nhận được URL file từ server');
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Không thể tải file lên';
    error.value = errorMessage;
    toast.error(errorMessage);
    fileName.value = '';
  } finally {
    uploading.value = false;
  }
}

function removeFile() {
  fileUrl.value = '';
  fileName.value = '';
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  fileUrl.value = newValue || '';
});
</script>

