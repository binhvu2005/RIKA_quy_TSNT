<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý học bổng</h2>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        + Tạo học bổng mới
      </button>
    </div>

    <div class="card">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-3">Tên học bổng</th>
                <th class="text-left p-3">Ngân sách</th>
                <th class="text-left p-3">Số lượng</th>
                <th class="text-left p-3">Ngày bắt đầu</th>
                <th class="text-left p-3">Ngày kết thúc</th>
                <th class="text-left p-3">Trạng thái</th>
                <th class="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="scholarship in scholarships"
                :key="scholarship._id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3 font-medium">{{ scholarship.name }}</td>
                <td class="p-3">
                  <div>
                    <div>{{ formatCurrency(scholarship.budget || scholarship.amount) }}</div>
                    <div class="text-xs text-gray-500">
                      ({{ formatMillions(scholarship.budget || scholarship.amount) }} triệu đồng)
                    </div>
                  </div>
                </td>
                <td class="p-3">
                  <span class="font-semibold text-primary-600">{{ scholarship.quantity || '-' }}</span>
                </td>
                <td class="p-3">{{ formatDate(scholarship.start_date) }}</td>
                <td class="p-3">{{ formatDate(scholarship.end_date || scholarship.deadline) }}</td>
                <td class="p-3">
                  <span
                    class="px-2 py-1 rounded text-xs"
                    :class="getStatusClass(scholarship.status)"
                  >
                    {{ getStatusText(scholarship.status) }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="editScholarship(scholarship)"
                      class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                      title="Sửa"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="viewApplications(scholarship._id)"
                      class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="Đơn đăng ký"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteScholarship(scholarship)"
                      class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination" class="flex items-center justify-between mt-4 pt-4 border-t">
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

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingScholarship"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">
          {{ editingScholarship ? 'Sửa học bổng' : 'Tạo học bổng mới' }}
        </h3>

        <form @submit.prevent="saveScholarship" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Tên học bổng *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="Nhập tên học bổng"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Ngân sách (VND) *</label>
            <input
              v-model.number="form.budget"
              type="number"
              required
              min="0"
              class="input w-full"
              placeholder="Nhập ngân sách"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Số lượng học bổng *</label>
            <input
              v-model.number="form.quantity"
              type="number"
              required
              min="1"
              class="input w-full"
              placeholder="Nhập số lượng học bổng"
            />
            <p class="text-xs text-gray-500 mt-1">Số lượng suất học bổng sẽ trao</p>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Mô tả</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="input w-full"
              placeholder="Nhập mô tả học bổng"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Ngày bắt đầu</label>
              <input
                v-model="form.start_date"
                type="date"
                class="input w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Ngày kết thúc</label>
              <input
                v-model="form.end_date"
                type="date"
                class="input w-full"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Trạng thái</label>
            <select v-model="form.status" class="input w-full">
              <option value="draft">Nháp</option>
              <option value="open">Đang mở</option>
              <option value="closed">Đã đóng</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {{ saving ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useToast } from 'vue-toastification';
import type { Scholarship, Pagination } from '../../types';

const router = useRouter();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const scholarships = ref<Scholarship[]>([]);
const pagination = ref<Pagination | null>(null);
const showCreateModal = ref(false);
const editingScholarship = ref<Scholarship | null>(null);

const form = reactive({
  name: '',
  budget: 0,
  quantity: 1,
  description: '',
  start_date: '',
  end_date: '',
  status: 'draft',
});

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
      params: {
        page: pagination.value?.page || 1,
        limit: 20,
      },
    });
    
    const data = response.data?.data || response.data;
    const scholarshipsData = data.data || [];
    // Parse budget for each scholarship
    scholarships.value = scholarshipsData.map((sch: any) => ({
      ...sch,
      budget: parseBudget(sch.budget),
    }));
    pagination.value = data.pagination || null;
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    toast.error('Không thể tải danh sách học bổng');
  } finally {
    loading.value = false;
  }
}

function changePage(page: number) {
  if (pagination.value) {
    pagination.value.page = page;
    fetchScholarships();
  }
}

function editScholarship(scholarship: Scholarship) {
  editingScholarship.value = scholarship;
  form.name = scholarship.name;
  form.budget = scholarship.budget || scholarship.amount || 0;
  form.quantity = scholarship.quantity || 1;
  form.description = scholarship.description || '';
  form.start_date = scholarship.start_date ? scholarship.start_date.split('T')[0] : '';
  form.end_date = (scholarship.end_date || scholarship.deadline) ? 
    (scholarship.end_date || scholarship.deadline)!.split('T')[0] : '';
  form.status = scholarship.status;
  showCreateModal.value = true;
}

function closeModal() {
  showCreateModal.value = false;
  editingScholarship.value = null;
  Object.assign(form, {
    name: '',
    budget: 0,
    quantity: 1,
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft',
  });
}

async function saveScholarship() {
  saving.value = true;
  try {
    const data = {
      name: form.name,
      budget: form.budget,
      quantity: form.quantity,
      description: form.description || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      status: form.status,
    };

    if (editingScholarship.value) {
      await api.patch(`/scholarships/${editingScholarship.value._id}`, data);
      toast.success('Đã cập nhật học bổng');
    } else {
      await api.post('/scholarships', data);
      toast.success('Đã tạo học bổng mới');
    }

    closeModal();
    await fetchScholarships();
  } catch (error: any) {
    console.error('Error saving scholarship:', error);
    toast.error(error.response?.data?.message || 'Không thể lưu học bổng');
  } finally {
    saving.value = false;
  }
}

function viewApplications(scholarshipId: string) {
  router.push(`/admin/scholarships/${scholarshipId}/applications`);
}

async function deleteScholarship(scholarship: Scholarship) {
  if (!confirm(`Bạn có chắc muốn xóa học bổng "${scholarship.name}"?`)) {
    return;
  }

  try {
    await api.delete(`/scholarships/${scholarship._id}`);
    toast.success('Đã xóa học bổng');
    await fetchScholarships();
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    toast.error('Không thể xóa học bổng');
  }
}

function formatDate(date?: string) {
  if (!date) return 'N/A';
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
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return classMap[status] || 'bg-gray-100 text-gray-700';
}
</script>
