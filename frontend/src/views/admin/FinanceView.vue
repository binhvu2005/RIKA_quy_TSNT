<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý tài chính</h2>
      <button @click="showBankModal = true" class="btn btn-primary">
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm ngân hàng
      </button>
    </div>

    <!-- Tổng số tiền quỹ -->
    <div class="card mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="text-center py-6">
        <p class="text-lg mb-2 opacity-90">Tổng số tiền quỹ</p>
        <p class="text-4xl font-bold mb-2">{{ formatCurrency(totalBalance) }}</p>
        <p class="text-lg mb-2 opacity-90 italic">{{ numberToWords(totalBalance) }}</p>
      </div>
    </div>

    <!-- Filters và Search -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên, email..."
            class="w-full px-4 py-2 border rounded-lg"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Trạng thái</label>
          <select v-model="filters.status" @change="fetchContributions" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="completed">Đã xác nhận</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Sắp xếp theo</label>
          <select v-model="filters.sortBy" @change="fetchContributions" class="w-full px-4 py-2 border rounded-lg">
            <option value="createdAt">Ngày tạo</option>
            <option value="amount">Số tiền</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Thứ tự</label>
          <select v-model="filters.sortOrder" @change="fetchContributions" class="w-full px-4 py-2 border rounded-lg">
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Danh sách đóng góp -->
    <div class="card">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Người đóng góp</th>
                <th class="text-left py-3 px-4">Số tiền</th>
                <th class="text-left py-3 px-4">Lời nhắn</th>
                <th class="text-left py-3 px-4">Trạng thái</th>
                <th class="text-left py-3 px-4">Ngày tạo</th>
                <th class="text-center py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contribution in contributions" :key="contribution._id" class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-2">
                    <img
                      v-if="getUserAvatar(contribution)"
                      :src="getUserAvatar(contribution)"
                      :alt="getUserName(contribution)"
                      class="w-8 h-8 rounded-full"
                    />
                    <div
                      v-else
                      class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm"
                    >
                      {{ getUserName(contribution)?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                    <div>
                      <p class="font-medium">{{ getUserName(contribution) }}</p>
                      <p class="text-sm text-gray-500">{{ getUserEmail(contribution) }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="font-semibold text-primary-600">{{ formatCurrency(contribution.amount) }}</p>
                  <p class="text-xs text-gray-500 italic">{{ numberToWords(contribution.amount) }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm">{{ contribution.desc || '-' }}</p>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-yellow-100 text-yellow-800': contribution.status === 'pending',
                      'bg-green-100 text-green-800': contribution.status === 'completed',
                      'bg-red-100 text-red-800': contribution.status === 'rejected',
                    }"
                  >
                    {{ getStatusLabel(contribution.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-600">
                  {{ formatDate(contribution.createdAt) }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      v-if="contribution.status === 'pending'"
                      @click="updateStatus(contribution._id, 'completed')"
                      class="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Xác nhận"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      v-if="contribution.status === 'pending'"
                      @click="updateStatus(contribution._id, 'rejected')"
                      class="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Từ chối"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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

    <!-- Modal thêm/sửa ngân hàng -->
    <div v-if="showBankModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">{{ editingBank ? 'Sửa ngân hàng' : 'Thêm ngân hàng' }}</h3>
        <form @submit.prevent="saveBank" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Tên ngân hàng <span class="text-red-500">*</span></label>
            <input
              v-model="bankForm.bank_name"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Số tài khoản <span class="text-red-500">*</span></label>
            <input
              v-model="bankForm.account_number"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Chủ tài khoản <span class="text-red-500">*</span></label>
            <input
              v-model="bankForm.account_holder"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">URL QR Code</label>
            <input
              v-model="bankForm.qr_code_url"
              type="url"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Trạng thái</label>
            <select v-model="bankForm.status" class="w-full px-4 py-2 border rounded-lg">
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" @click="closeBankModal" class="btn btn-secondary">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import api from '../../services/api';
import type { Pagination } from '../../types';
import { numberToWords } from '../../utils/numberToWords';

interface Contribution {
  _id: string;
  amount: number;
  desc: string;
  status: string;
  createdAt: string;
  user_id?: {
    _id: string;
    username: string;
    email: string;
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

const toast = useToast();

const loading = ref(true);
const contributions = ref<Contribution[]>([]);
const pagination = ref<Pagination | null>(null);
const totalBalance = ref(0);
const showBankModal = ref(false);
const editingBank = ref<BankAccount | null>(null);

const filters = ref({
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
});

const bankForm = ref({
  bank_name: '',
  account_number: '',
  account_holder: '',
  qr_code_url: '',
  status: 'active',
});

let searchTimeout: NodeJS.Timeout | null = null;

onMounted(async () => {
  await Promise.all([fetchFunds(), fetchContributions()]);
});

async function fetchFunds() {
  try {
    const response = await api.get('/funds');
    const funds = response.data?.data || response.data || [];
    totalBalance.value = funds.reduce((sum: number, fund: any) => {
      const balance = parseAmount(fund.balance);
      return sum + balance;
    }, 0);
  } catch (error) {
    console.error('Error fetching funds:', error);
  }
}

async function fetchContributions() {
  loading.value = true;
  try {
    const params: any = {
      page: filters.value.page,
      limit: filters.value.limit,
      type: 'income',
    };
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.sortBy) params.sortBy = filters.value.sortBy;
    if (filters.value.sortOrder) params.sortOrder = filters.value.sortOrder;

    const response = await api.get('/finance/transactions', { params });
    const data = response.data?.data || response.data || {};
    contributions.value = (data.data || []).map((item: any) => ({
      ...item,
      amount: parseAmount(item.amount),
    }));
    pagination.value = data.pagination || null;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    toast.error('Không thể tải danh sách đóng góp');
  } finally {
    loading.value = false;
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    fetchContributions();
  }, 500);
}

function changePage(page: number) {
  filters.value.page = page;
  fetchContributions();
}

async function updateStatus(id: string, status: string) {
  try {
    await api.patch(`/finance/transactions/${id}/status`, { status });
    toast.success(`Đã ${status === 'completed' ? 'xác nhận' : 'từ chối'} đóng góp`);
    await fetchContributions();
    await fetchFunds();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
  }
}

function closeBankModal() {
  showBankModal.value = false;
  editingBank.value = null;
  bankForm.value = {
    bank_name: '',
    account_number: '',
    account_holder: '',
    qr_code_url: '',
    status: 'active',
  };
}

async function saveBank() {
  try {
    if (editingBank.value) {
      await api.patch(`/bank-accounts/${editingBank.value._id}`, bankForm.value);
      toast.success('Đã cập nhật ngân hàng');
    } else {
      await api.post('/bank-accounts', bankForm.value);
      toast.success('Đã thêm ngân hàng');
    }
    closeBankModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
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

function getUserEmail(contribution: Contribution): string {
  if (!contribution.user_id || typeof contribution.user_id !== 'object') return '';
  return contribution.user_id.email || '';
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
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Chờ xác nhận',
    completed: 'Đã xác nhận',
    rejected: 'Đã từ chối',
  };
  return labels[status] || status;
}
</script>
