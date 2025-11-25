<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4">Học bổng</h1>
      <p class="text-gray-600">Tìm kiếm và đăng ký các chương trình học bổng</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="scholarship in scholarships"
        :key="scholarship._id"
        class="card cursor-pointer transform hover:scale-105 transition-all"
      >
        <h3 class="text-xl font-bold mb-2">{{ scholarship.name }}</h3>
        <p class="text-gray-600 mb-4 line-clamp-3">{{ scholarship.description }}</p>
        <div class="space-y-2 mb-4">
          <div class="flex justify-between">
            <span class="text-gray-600">Giá trị:</span>
            <span class="font-bold text-primary-600">{{ formatCurrency(scholarship.amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Hạn nộp:</span>
            <span class="font-semibold">{{ formatDate(scholarship.deadline) }}</span>
          </div>
        </div>
        <button
          v-if="authStore.isAuthenticated"
          class="btn btn-primary w-full"
        >
          Đăng ký ngay
        </button>
        <router-link
          v-else
          to="/login"
          class="btn btn-secondary w-full block text-center"
        >
          Đăng nhập để đăng ký
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import type { Scholarship } from '../../types';

const authStore = useAuthStore();
const loading = ref(true);
const scholarships = ref<Scholarship[]>([]);

onMounted(async () => {
  await fetchScholarships();
});

async function fetchScholarships() {
  loading.value = true;
  try {
    const response = await api.get('/scholarships', {
      params: { page: 1, limit: 20, status: 'active' },
    });
    scholarships.value = response.data.data.data || [];
  } catch (error) {
    console.error('Error fetching scholarships:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

