<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="scholarship" class="max-w-4xl mx-auto">
      <router-link to="/scholarships" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Quay lại danh sách học bổng
      </router-link>

      <div class="card mb-6">
        <div class="flex items-start justify-between mb-4">
          <h1 class="text-3xl font-bold">{{ scholarship.name }}</h1>
          <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="getStatusClass(scholarship.status)">
            {{ getStatusText(scholarship.status) }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Ngân sách</p>
            <p class="text-2xl font-bold text-primary-600">
              {{ formatCurrency(scholarship.budget || scholarship.amount) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              ({{ formatMillions(scholarship.budget || scholarship.amount) }} triệu đồng)
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Số lượng học bổng</p>
            <p class="text-2xl font-bold text-primary-600">
              {{ scholarship.quantity || '-' }}
            </p>
            <p class="text-xs text-gray-500 mt-1">suất</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Hạn nộp hồ sơ</p>
            <p class="text-lg font-semibold">
              {{ formatDate(scholarship.end_date || scholarship.deadline) }}
            </p>
          </div>
        </div>

        <div v-if="scholarship.description" class="prose max-w-none mb-6">
          <h3 class="text-xl font-bold mb-3">Mô tả</h3>
          <p class="text-gray-700 whitespace-pre-wrap">{{ scholarship.description }}</p>
        </div>

        <div v-if="scholarship.criteria && scholarship.criteria.length > 0" class="mb-6">
          <h3 class="text-xl font-bold mb-3">Tiêu chí đánh giá</h3>
          <div class="space-y-2">
            <div
              v-for="(criterion, index) in scholarship.criteria"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-semibold">{{ criterion.name }}</p>
                <p v-if="criterion.description" class="text-sm text-gray-600">
                  {{ criterion.description }}
                </p>
              </div>
              <span class="text-primary-600 font-bold">{{ criterion.weight }}%</span>
            </div>
          </div>
        </div>

        <div v-if="scholarship.requirements && scholarship.requirements.length > 0" class="mb-6">
          <h3 class="text-xl font-bold mb-3">Yêu cầu</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li v-for="(req, index) in scholarship.requirements" :key="index">
              {{ req }}
            </li>
          </ul>
        </div>

        <div class="flex items-center space-x-4 pt-4 border-t">
          <div v-if="checkingApplication" class="flex items-center space-x-2 text-gray-600">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span>Đang kiểm tra...</span>
          </div>
          <div v-else-if="hasApplied" class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-green-600 font-semibold">Bạn đã đăng ký học bổng này</span>
          </div>
          <button
            v-else-if="authStore.isAuthenticated && scholarship.status === 'open'"
            @click="goToApply"
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Đăng ký ngay
          </button>
          <button
            v-else-if="!authStore.isAuthenticated"
            @click="$router.push('/login')"
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Đăng nhập để đăng ký
          </button>
          <p v-else class="text-gray-600">
            {{ scholarship.status === 'closed' ? 'Đợt học bổng này đã đóng' : 'Đợt học bổng này chưa mở' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { Scholarship } from '../../types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const scholarship = ref<Scholarship | null>(null);
const hasApplied = ref(false);
const checkingApplication = ref(false);

onMounted(async () => {
  await fetchScholarship();
  if (scholarship.value) {
    await checkApplication();
  }
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

async function fetchScholarship() {
  try {
    const id = route.params.id as string;
    const response = await api.get(`/scholarships/${id}`);
    const data = response.data?.data || response.data;
    // Parse budget if needed
    if (data && data.budget) {
      data.budget = parseBudget(data.budget);
    }
    scholarship.value = data;
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    toast.error('Không tìm thấy học bổng');
    router.push('/scholarships');
  } finally {
    loading.value = false;
  }
}

async function checkApplication() {
  if (!authStore.isAuthenticated || !scholarship.value) {
    return;
  }
  
  checkingApplication.value = true;
  try {
    const response = await api.get('/scholarship-applications', {
      params: {
        scholarship_id: scholarship.value._id,
        limit: 1,
      },
    });
    const applications = response.data?.data?.data || response.data?.data || [];
    hasApplied.value = applications.length > 0;
  } catch (error) {
    console.error('Error checking application:', error);
    // Nếu lỗi thì giả sử chưa đăng ký
    hasApplied.value = false;
  } finally {
    checkingApplication.value = false;
  }
}

function goToApply() {
  router.push(`/scholarships/${scholarship.value?._id}/apply`);
}

function formatDate(date?: string) {
  if (!date) return 'Chưa có';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return classMap[status] || 'bg-gray-100 text-gray-700';
}
</script>

<style scoped>
.prose {
  @apply text-gray-700;
}
</style>

