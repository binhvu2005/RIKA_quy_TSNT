<template>
  <div class="flex items-center space-x-2 group cursor-pointer" @click="goHome">
    <!-- Logo Container -->
    <div class="relative flex-shrink-0" :class="logoSize">
      <img
        :src="logoImage"
        alt="Quỹ thắp sáng niềm tin"
        class="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
        @error="handleImageError"
      />
    </div>
    
    <!-- Text -->
    <div v-if="showText" class="flex flex-col" :class="textSize">
      <span class="font-bold leading-tight" :class="titleClass" :style="textColorStyle">
        {{ showFull ? 'Quỹ thắp sáng niềm tin' : 'Thắp sáng niềm tin' }}
      </span>
      <span v-if="showSubtitle" class="text-xs leading-tight" :style="subtitleColorStyle">
        Light Your Hope
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import logoImageSrc from '../../assets/logoTSNT.jpg';

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    showFull?: boolean;
    showSubtitle?: boolean;
    showText?: boolean;
    textColor?: 'light' | 'dark' | 'auto';
  }>(),
  {
    size: 'md',
    showFull: false,
    showSubtitle: false,
    showText: true,
    textColor: 'auto',
  }
);

const router = useRouter();
const imageError = ref(false);

const logoImage = computed(() => {
  if (imageError.value) {
    // Fallback to default logo if image fails to load
    return '/logo.png';
  }
  return logoImageSrc;
});

function handleImageError() {
  imageError.value = true;
  console.warn('Logo image failed to load, using fallback');
}

const logoSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8';
    case 'lg':
      return 'w-16 h-16';
    default:
      return 'w-10 h-10';
  }
});

const textSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs';
    case 'lg':
      return 'text-lg';
    default:
      return 'text-sm';
  }
});

const titleClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs';
    case 'lg':
      return 'text-xl';
    default:
      return 'text-base';
  }
});

const textColorStyle = computed(() => {
  if (props.textColor === 'light') {
    return { color: '#ffffff' };
  }
  if (props.textColor === 'dark') {
    return { color: '#1f2937' };
  }
  // auto - use dark mode classes
  return {};
});

const subtitleColorStyle = computed(() => {
  if (props.textColor === 'light') {
    return { color: '#d1d5db' };
  }
  if (props.textColor === 'dark') {
    return { color: '#6b7280' };
  }
  // auto - use dark mode classes
  return {};
});

function goHome() {
  router.push('/');
}
</script>

<style scoped>
/* Animation for logo hover */
.group:hover img {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>
