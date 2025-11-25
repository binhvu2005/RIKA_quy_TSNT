<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Quản lý người dùng</h2>
      <button @click="openAddModal()" class="btn btn-primary">
        + Thêm người dùng
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="input"
        />
        <select v-model="filters.status" class="input">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>
        <select v-model="filters.role" class="input">
          <option value="">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="user">User</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vai trò</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in users"
              :key="user._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ user.username }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-for="role in user.roles"
                  :key="role"
                  :class="{
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': role === 'admin',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300': role === 'editor',
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': role === 'user',
                  }"
                  class="px-2 py-1 rounded text-xs mr-1"
                >
                  {{ role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': user.status === 'active',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': user.status === 'pending',
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': user.status === 'banned',
                  }"
                  class="px-2 py-1 rounded text-xs"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="editUser(user)"
                  class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mr-3"
                >
                  Sửa
                </button>
                <button
                  @click="deleteUser(user._id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} của {{ pagination.total }}
        </span>
        <div class="flex space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === pagination.totalPages"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEdit ? 'Sửa người dùng' : 'Thêm người dùng mới' }}
          </h3>
        </div>

        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                minlength="3"
                maxlength="30"
                pattern="[a-zA-Z0-9_]+"
                class="input"
                placeholder="Tên đăng nhập"
                :disabled="isEdit"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Chỉ chứa chữ cái, số và dấu gạch dưới</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="input"
                placeholder="email@example.com"
                :disabled="isEdit"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu <span v-if="!isEdit" class="text-red-500">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                :required="!isEdit"
                minlength="6"
                class="input"
                placeholder="Tối thiểu 6 ký tự"
              />
              <p v-if="isEdit" class="text-xs text-gray-500 dark:text-gray-400 mt-1">Để trống nếu không đổi mật khẩu</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên
              </label>
              <input
                v-model="form.full_name"
                type="text"
                class="input"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="input"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Vai trò <span class="text-red-500">*</span>
              </label>
              <select v-model="form.roles" multiple class="input" required>
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái <span class="text-red-500">*</span>
              </label>
              <select v-model="form.status" class="input" required>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
              :disabled="saving"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <span v-if="saving" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useToast } from 'vue-toastification';
import type { User, Pagination } from '../../types';

const toast = useToast();
const loading = ref(true);
const users = ref<User[]>([]);
const currentPage = ref(1);
const pagination = ref<Pagination | null>(null);
const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const error = ref('');

const filters = reactive({
  search: '',
  status: '',
  role: '',
});

const form = reactive({
  _id: '',
  username: '',
  email: '',
  password: '',
  full_name: '',
  phone: '',
  roles: ['user'] as string[],
  status: 'pending',
});

onMounted(() => {
  fetchUsers();
});

watch([() => filters.search, () => filters.status, () => filters.role], () => {
  currentPage.value = 1;
  fetchUsers();
});

async function fetchUsers() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: 20,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.role) params.role = filters.role;

    const response = await api.get('/users', { params });
    users.value = response.data.data.data || [];
    pagination.value = response.data.data.pagination || null;
  } catch (error) {
    toast.error('Không thể tải danh sách người dùng');
  } finally {
    loading.value = false;
  }
}

function changePage(page: number) {
  currentPage.value = page;
  fetchUsers();
}

function openAddModal() {
  isEdit.value = false;
  resetForm();
  showModal.value = true;
}

function editUser(user: User) {
  isEdit.value = true;
  form._id = user._id || '';
  form.username = user.username;
  form.email = user.email;
  form.password = '';
  form.full_name = user.profile?.full_name || '';
  form.phone = user.profile?.phone || '';
  form.roles = user.roles || ['user'];
  form.status = user.status || 'pending';
  showModal.value = true;
}

function resetForm() {
  form._id = '';
  form.username = '';
  form.email = '';
  form.password = '';
  form.full_name = '';
  form.phone = '';
  form.roles = ['user'];
  form.status = 'pending';
  error.value = '';
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function saveUser() {
  saving.value = true;
  error.value = '';

  try {
    const payload: any = {
      username: form.username.trim(),
      email: form.email.trim(),
      roles: form.roles,
      status: form.status,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (form.full_name) payload.full_name = form.full_name.trim();
    if (form.phone) payload.phone = form.phone.trim();

    if (isEdit.value) {
      if (!form._id) {
        error.value = 'Không tìm thấy user ID';
        return;
      }
      await api.patch(`/users/${form._id}`, payload);
      toast.success('Đã cập nhật người dùng');
    } else {
      await api.post('/users', payload);
      toast.success('Đã tạo người dùng mới');
    }

    closeModal();
    fetchUsers();
  } catch (err: any) {
    console.error('Save user error:', err);
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        error.value = err.response.data.message.join(', ');
      } else {
        error.value = err.response.data.message;
      }
    } else {
      error.value = isEdit.value ? 'Không thể cập nhật người dùng' : 'Không thể tạo người dùng mới';
    }
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
}

async function deleteUser(userId: string) {
  if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

  try {
    await api.delete(`/users/${userId}`);
    toast.success('Đã xóa người dùng');
    fetchUsers();
  } catch (error) {
    toast.error('Không thể xóa người dùng');
  }
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}
</script>
