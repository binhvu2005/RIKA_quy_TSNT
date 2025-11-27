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
          <div class="flex flex-col">
            <div class="flex justify-between">
              <span class="text-gray-600">Ngân sách:</span>
              <span class="font-bold text-primary-600">{{ formatCurrency(scholarship.budget || scholarship.amount) }}</span>
            </div>
            <p class="text-xs text-gray-500 text-right mt-0.5">
              ({{ formatMillions(scholarship.budget || scholarship.amount) }} triệu đồng)
            </p>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Số lượng:</span>
            <span class="font-semibold text-primary-600">{{ scholarship.quantity || '-' }} suất</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Hạn nộp:</span>
            <span class="font-semibold">{{ formatDate(scholarship.end_date || scholarship.deadline) }}</span>
          </div>
          <div v-if="scholarship.status" class="flex justify-between">
            <span class="text-gray-600">Trạng thái:</span>
            <span class="font-semibold" :class="getStatusClass(scholarship.status)">
              {{ getStatusText(scholarship.status) }}
            </span>
          </div>
        </div>
        <button
          v-if="authStore.isAuthenticated"
          @click="$router.push(`/scholarships/${scholarship._id}`)"
          class="btn btn-primary w-full"
        >
          Xem chi tiết
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

function parseBudget(budget: any): number {
  if (!budget) return 0;
  if (typeof budget === 'number') return budget;
  if (typeof budget === 'string') {
    const parsed = parseFloat(budget);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Handle Decimal128 object format
  if (budget.$numberDecimal) {
    return parseFloat(budget.$numberDecimal);
  }
  if (budget.toString) {
    return parseFloat(budget.toString());
  }
  return 0;
}

async function fetchScholarships() {
  loading.value = true;
  try {
    const response = await api.get('/scholarships', {
      params: { page: 1, limit: 20, status: 'open' },
    });
    const data = response.data?.data?.data || response.data?.data || [];
    // Parse budget for each scholarship
    scholarships.value = data.map((sch: any) => ({
      ...sch,
      budget: parseBudget(sch.budget),
    }));
  } catch (error) {
    console.error('Error fetching scholarships:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN');
}

function formatCurrency(amount: number | undefined | null | any) {
  const numAmount = typeof amount === 'number' ? amount : parseBudget(amount);
  if (!numAmount || isNaN(numAmount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount);
}

function formatMillions(amount: number | undefined | null | any) {
  const numAmount = typeof amount === 'number' ? amount : parseBudget(amount);
  if (!numAmount || isNaN(numAmount)) return '0';
  const millions = numAmount / 1000000;
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(millions);
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    draft: 'Nháp',
    open: 'Đang mở',
    closed: 'Đã đóng',
    completed: 'Hoàn thành',
  };
  return statusMap[status] || status;
}

function getStatusClass(status: string) {
  const classMap: Record<string, string> = {
    draft: 'text-gray-500',
    open: 'text-green-600',
    closed: 'text-red-600',
    completed: 'text-blue-600',
  };
  return classMap[status] || '';
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

