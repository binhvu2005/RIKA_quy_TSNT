<template>
  <div class="rich-text-editor">
    <div ref="editorRef" class="quill-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorRef = ref<HTMLElement | null>(null);
let quill: Quill | null = null;

onMounted(() => {
  if (!editorRef.value) return;

  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder || 'Nhập nội dung...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['clean'],
        ['link', 'image', 'video'],
      ],
    },
  });

  // Set initial content
  if (props.modelValue) {
    quill.root.innerHTML = props.modelValue;
  }

  // Listen for text changes
  quill.on('text-change', () => {
    if (quill) {
      emit('update:modelValue', quill.root.innerHTML);
    }
  });
});

onBeforeUnmount(() => {
  if (quill) {
    quill = null;
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (quill && quill.root.innerHTML !== newValue) {
      quill.root.innerHTML = newValue || '';
    }
  }
);
</script>

<style scoped>
.rich-text-editor {
  background: white;
  border-radius: 0.5rem;
}

.quill-editor {
  min-height: 300px;
}

:deep(.ql-container) {
  min-height: 300px;
  font-size: 16px;
}

:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-snow) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background: #f9fafb;
}

:deep(.ql-container) {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>

