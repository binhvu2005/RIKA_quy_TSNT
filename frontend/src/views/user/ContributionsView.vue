<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4">Đóng góp</h1>
      <p class="text-gray-600">Chung tay ủng hộ quỹ từ thiện</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else>
      <!-- Số tiền quỹ lớn nhất -->
      <div class="card mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div class="text-center py-8">
          <p class="text-lg mb-2 opacity-90">Tổng số tiền quỹ</p>
          <p class="text-5xl font-bold mb-2">{{ formatCurrency(largestFund?.balance || 0) }}</p>
          <p class="text-lg mb-2 opacity-90 italic">{{ numberToWords(largestFund?.balance || 0) }}</p>
          <p class="text-sm opacity-80">{{ largestFund?.name || 'Quỹ từ thiện' }}</p>
        </div>
      </div>

      <!-- Form đóng góp -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold mb-6">Đóng góp ngay</h2>
        <form @submit.prevent="handleContribute" class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">
              Chọn quỹ <span class="text-red-500">*</span>
            </label>
            <select
              v-model="contributionForm.fund_id"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Chọn quỹ --</option>
              <option v-for="fund in funds" :key="fund._id" :value="fund._id">
                {{ fund.name }} - {{ formatCurrency(fund.balance) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Số tiền đóng góp (VNĐ) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="contributionForm.amount"
              type="number"
              min="1000"
              step="1000"
              required
              placeholder="Nhập số tiền"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p v-if="contributionForm.amount > 0" class="mt-2 text-sm text-gray-600 italic">
              {{ numberToWords(contributionForm.amount) }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Lời nhắn
            </label>
            <textarea
              v-model="contributionForm.desc"
              rows="3"
              placeholder="Nhập lời nhắn của bạn..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Chọn ngân hàng <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedBankId"
              required
              @change="onBankChange"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Chọn ngân hàng --</option>
              <option v-for="bank in bankAccounts" :key="bank._id" :value="bank._id">
                {{ bank.bank_name }} - {{ bank.account_number }}
              </option>
            </select>
          </div>

          <!-- Thông tin ngân hàng và QR code -->
          <div v-if="selectedBank" class="border-2 border-primary-200 rounded-lg p-6 bg-primary-50">
            <h3 class="text-lg font-bold mb-4">Thông tin chuyển khoản</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-600 mb-1">Ngân hàng:</p>
                <p class="font-semibold text-lg">{{ selectedBank.bank_name }}</p>
                
                <p class="text-sm text-gray-600 mb-1 mt-4">Số tài khoản:</p>
                <p class="font-semibold text-lg">{{ selectedBank.account_number }}</p>
                
                <p class="text-sm text-gray-600 mb-1 mt-4">Chủ tài khoản:</p>
                <p class="font-semibold text-lg">{{ selectedBank.account_holder }}</p>
              </div>
              <div v-if="selectedBank.qr_code_url" class="flex justify-center">
                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-2">Mã QR chuyển tiền:</p>
                  <img
                    :src="selectedBank.qr_code_url"
                    alt="QR Code"
                    class="w-48 h-48 border-2 border-gray-300 rounded-lg mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="submitting"
              class="btn btn-primary"
            >
              <span v-if="submitting">Đang gửi...</span>
              <span v-else>Xác nhận đóng góp</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Top 3 người đóng góp -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Top người đóng góp</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(contributor, index) in topContributors"
            :key="contributor.user_id"
            class="card"
            :class="{
              'border-yellow-400 border-2': index === 0,
              'border-gray-300 border-2': index === 1,
              'border-orange-300 border-2': index === 2,
            }"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="relative">
                <div
                  v-if="index === 0"
                  class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                >
                  1
                </div>
                <div
                  v-else-if="index === 1"
                  class="absolute -top-2 -right-2 bg-gray-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                >
                  2
                </div>
                <div
                  v-else-if="index === 2"
                  class="absolute -top-2 -right-2 bg-orange-400 text-orange-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                >
                  3
                </div>
                <img
                  v-if="contributor.user?.avatar"
                  :src="contributor.user.avatar"
                  :alt="contributor.user.name"
                  class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div
                  v-else
                  class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-gray-200"
                >
                  {{ contributor.user?.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
              </div>
              <div class="flex-1">
                <p class="font-bold text-lg">{{ contributor.user?.name || 'Ẩn danh' }}</p>
                <p class="text-sm text-gray-500">{{ contributor.count }} lần đóng góp</p>
              </div>
            </div>
            <div class="pt-4 border-t">
              <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(contributor.totalAmount) }}</p>
            </div>
          </div>
        </div>
        <div v-if="topContributors.length === 0" class="text-center py-8 text-gray-500">
          Chưa có người đóng góp
        </div>
      </div>

      <!-- Danh sách đóng góp gần đây -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Đóng góp gần đây</h2>
        <div class="card">
          <div v-if="contributions.length === 0" class="text-center py-12 text-gray-500">
            <p>Chưa có đóng góp nào</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="contribution in contributions"
              :key="contribution._id"
              class="flex items-start space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div class="flex-shrink-0">
                <img
                  v-if="getUserAvatar(contribution)"
                  :src="getUserAvatar(contribution)"
                  :alt="getUserName(contribution)"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold"
                >
                  {{ getUserName(contribution)?.charAt(0)?.toUpperCase() || '?' }}
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-1">
                  <div>
                    <p class="font-semibold text-gray-900">{{ getUserName(contribution) || 'Ẩn danh' }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(contribution.createdAt) }}</p>
                  </div>
                  <p class="text-lg font-bold text-primary-600">{{ formatCurrency(contribution.amount) }}</p>
                </div>
                <p v-if="contribution.desc" class="text-gray-700 mt-2 italic">"{{ contribution.desc }}"</p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t">
            <p class="text-sm text-gray-600">
              Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
              của {{ pagination.total }} kết quả
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span class="px-3 py-1">{{ pagination.page }} / {{ pagination.totalPages }}</span>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import api from '../../services/api';
import type { Pagination } from '../../types';
import { numberToWords } from '../../utils/numberToWords';

interface Fund {
  _id: string;
  name: string;
  balance: number;
  currency?: string;
}

interface TopContributor {
  user_id: string;
  totalAmount: number;
  count: number;
  user?: {
    _id: string;
    username: string;
    name: string;
    avatar?: string;
  };
}

interface Contribution {
  _id: string;
  amount: number;
  desc: string;
  createdAt: string;
  user_id?: {
    _id: string;
    username: string;
    profile?: {
      full_name?: string;
      avatar?: string;
    };
  };
}

interface BankAccount {
  _id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url?: string;
  status: string;
}

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const funds = ref<Fund[]>([]);
const largestFund = ref<Fund | null>(null);
const topContributors = ref<TopContributor[]>([]);
const contributions = ref<Contribution[]>([]);
const pagination = ref<Pagination | null>(null);
const bankAccounts = ref<BankAccount[]>([]);
const selectedBankId = ref<string>('');
const selectedBank = ref<BankAccount | null>(null);
const submitting = ref(false);

const contributionForm = ref({
  fund_id: '',
  amount: 0,
  desc: '',
});

onMounted(async () => {
  await Promise.all([fetchFunds(), fetchTopContributors(), fetchContributions(), fetchBankAccounts()]);
});

async function fetchFunds() {
  try {
    const response = await api.get('/funds/public');
    const fundsData = response.data?.data || response.data || [];
    funds.value = fundsData.map((fund: any) => ({
      ...fund,
      balance: parseAmount(fund.balance),
    }));
    if (funds.value.length > 0) {
      // Tìm quỹ có số dư lớn nhất
      largestFund.value = funds.value.reduce((max: Fund, fund: Fund) => 
        fund.balance > max.balance ? fund : max
      );
      // Set default fund
      if (!contributionForm.value.fund_id && largestFund.value) {
        contributionForm.value.fund_id = largestFund.value._id;
      }
    }
  } catch (error) {
    console.error('Error fetching funds:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchBankAccounts() {
  try {
    const response = await api.get('/bank-accounts/public', {
      params: { activeOnly: 'true' },
    });
    bankAccounts.value = response.data?.data || response.data || [];
    if (bankAccounts.value.length > 0) {
      selectedBankId.value = bankAccounts.value[0]._id;
      selectedBank.value = bankAccounts.value[0];
    }
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
  }
}

function onBankChange() {
  selectedBank.value = bankAccounts.value.find(b => b._id === selectedBankId.value) || null;
}

async function handleContribute() {
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để đóng góp');
    router.push('/login');
    return;
  }

  if (!contributionForm.value.fund_id || !contributionForm.value.amount || !selectedBankId.value) {
    toast.error('Vui lòng điền đầy đủ thông tin');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/finance/transactions/contribute', {
      fund_id: contributionForm.value.fund_id,
      amount: contributionForm.value.amount,
      desc: contributionForm.value.desc || 'Đóng góp từ thiện',
    });
    toast.success('Đã gửi yêu cầu đóng góp. Vui lòng chờ xác nhận từ quản trị viên.');
    // Reset form
    contributionForm.value = {
      fund_id: largestFund.value?._id || '',
      amount: 0,
      desc: '',
    };
    // Refresh contributions
    await fetchContributions();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu đóng góp');
  } finally {
    submitting.value = false;
  }
}

async function fetchTopContributors() {
  try {
    const response = await api.get('/finance/transactions/public/top-contributors', {
      params: { limit: 3 },
    });
    const data = response.data?.data || response.data || [];
    topContributors.value = data.map((item: any) => ({
      ...item,
      totalAmount: parseAmount(item.totalAmount),
    }));
  } catch (error) {
    console.error('Error fetching top contributors:', error);
  }
}

async function fetchContributions() {
  try {
    const response = await api.get('/finance/transactions/public/contributions', {
      params: {
        page: pagination.value?.page || 1,
        limit: 20,
      },
    });
    const data = response.data?.data || response.data || {};
    contributions.value = (data.data || []).map((item: any) => ({
      ...item,
      amount: parseAmount(item.amount),
    }));
    pagination.value = data.pagination || null;
  } catch (error) {
    console.error('Error fetching contributions:', error);
  }
}

function parseAmount(amount: any): number {
  if (!amount) return 0;
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (amount.$numberDecimal) {
    return parseFloat(amount.$numberDecimal);
  }
  if (amount.toString) {
    return parseFloat(amount.toString());
  }
  return 0;
}

function getUserName(contribution: Contribution): string {
  if (!contribution.user_id) return 'Ẩn danh';
  if (typeof contribution.user_id === 'object') {
    return contribution.user_id.profile?.full_name || contribution.user_id.username || 'Ẩn danh';
  }
  return 'Ẩn danh';
}

function getUserAvatar(contribution: Contribution): string | null {
  if (!contribution.user_id || typeof contribution.user_id !== 'object') return null;
  return contribution.user_id.profile?.avatar || null;
}

function formatCurrency(amount: number | undefined | null): string {
  if (!amount || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function changePage(page: number) {
  if (pagination.value) {
    pagination.value.page = page;
    fetchContributions();
  }
}
</script>

