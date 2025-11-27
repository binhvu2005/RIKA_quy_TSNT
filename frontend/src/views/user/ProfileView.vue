<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Hồ sơ cá nhân</h1>
        <p class="text-gray-600 dark:text-gray-400">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <!-- Profile Header Card -->
      <div class="card mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div class="relative">
            <div
              v-if="authStore.user?.profile?.avatar"
              class="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border-4 border-white/30 shadow-lg"
            >
              <img
                :src="authStore.user.profile.avatar"
                :alt="authStore.user.username"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white/30 shadow-lg"
            >
              {{ userInitial }}
            </div>
            <button
              @click="showAvatarUpload = !showAvatarUpload"
              class="absolute bottom-0 right-0 w-10 h-10 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all transform hover:scale-110"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold mb-2">{{ authStore.user?.username }}</h2>
            <p class="text-white/90 mb-4">{{ authStore.user?.email }}</p>
            <div class="flex flex-wrap justify-center md:justify-start gap-2">
              <span
                v-for="role in authStore.user?.roles"
                :key="role"
                class="px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30"
              >
                {{ role === 'admin' ? 'Quản trị viên' : role === 'editor' ? 'Biên tập viên' : 'Người dùng' }}
              </span>
              <span
                class="px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30"
              >
                {{ statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar Upload Modal -->
      <div
        v-if="showAvatarUpload"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showAvatarUpload = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cập nhật ảnh đại diện</h3>
          <ImageUpload
            v-model="profile.avatar"
            folder="avatars"
            @uploaded="handleAvatarUploaded"
          />
          <div class="flex space-x-3 mt-4">
            <button @click="updateProfile" class="btn btn-primary flex-1">Lưu</button>
            <button @click="showAvatarUpload = false" class="btn btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex space-x-8">
          <button
            @click="activeTab = 'profile'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            "
          >
            Thông tin cá nhân
          </button>
          <button
            @click="activeTab = 'security'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            "
          >
            Bảo mật
          </button>
        </div>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- Personal Information -->
        <div class="card">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Thông tin cá nhân</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên
              </label>
              <input
                v-model="profile.full_name"
                type="text"
                class="input"
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <input
                v-model="profile.phone"
                type="tel"
                class="input"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số CCCD/CMND
              </label>
              <input
                v-model="profile.identity"
                type="text"
                class="input"
                placeholder="Nhập số CCCD/CMND"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                :value="authStore.user?.email"
                type="email"
                class="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                disabled
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email không thể thay đổi</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="updateProfile"
              :disabled="loading"
              class="btn btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>

        <!-- Account Information -->
        <div class="card">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Thông tin tài khoản</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Username</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.username }}</p>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">Không thể thay đổi</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Ngày tham gia</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(authStore.user?.created_at) }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Trạng thái</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ statusText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="space-y-6">
        <div class="card">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Đổi mật khẩu</h3>
          <div class="space-y-4 max-w-md">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu hiện tại
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  class="input pr-10"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu mới
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="input pr-10"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
                <button
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="input pr-10"
                  :class="{ 'border-red-300': passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword }"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p
                v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword"
                class="text-xs text-red-500 mt-1"
              >
                Mật khẩu xác nhận không khớp
              </p>
            </div>
            <div class="pt-4">
              <button
                @click="changePassword"
                :disabled="loading || !canChangePassword"
                class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {{ loading ? 'Đang đổi...' : 'Đổi mật khẩu' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import api from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload.vue';

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const activeTab = ref<'profile' | 'security'>('profile');
const showAvatarUpload = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const profile = reactive({
  full_name: '',
  phone: '',
  identity: '',
  avatar: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Load user data when component mounts
onMounted(async () => {
  // Đảm bảo user data được load
  if (!authStore.user && authStore.token) {
    await authStore.checkAuth();
  }
  
  // Populate form với user data
  if (authStore.user) {
    profile.full_name = authStore.user.profile?.full_name || '';
    profile.phone = authStore.user.profile?.phone || '';
    profile.identity = authStore.user.profile?.identity || '';
    profile.avatar = authStore.user.profile?.avatar || '';
  }
});

// Watch for user changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    profile.full_name = newUser.profile?.full_name || '';
    profile.phone = newUser.profile?.phone || '';
    profile.identity = newUser.profile?.identity || '';
    profile.avatar = newUser.profile?.avatar || '';
  }
}, { immediate: true });

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U';
});

const statusText = computed(() => {
  const status = authStore.user?.status;
  const statusMap: Record<string, string> = {
    active: 'Đang hoạt động',
    pending: 'Chờ phê duyệt',
    banned: 'Đã bị khóa',
  };
  return statusMap[status || 'pending'] || 'Không xác định';
});

const canChangePassword = computed(() => {
  return (
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.newPassword.length >= 6
  );
});

async function updateProfile() {
  if (!authStore.user?._id) {
    toast.error('Không tìm thấy thông tin người dùng');
    return;
  }

  loading.value = true;
  try {
    // Chỉ gửi các field có giá trị
    const updateData: any = {};
    if (profile.full_name) updateData.full_name = profile.full_name;
    if (profile.phone) updateData.phone = profile.phone;
    if (profile.identity) updateData.identity = profile.identity;
    if (profile.avatar) updateData.avatar = profile.avatar;

    const response = await api.patch(`/users/${authStore.user._id}`, updateData);
    
    console.log('Update profile response:', response.data);
    
    // Update user in store - xử lý nhiều cấu trúc response
    let updatedUser = null;
    if (response.data?.data?.data) {
      updatedUser = response.data.data.data;
    } else if (response.data?.data) {
      updatedUser = response.data.data;
    } else if (response.data) {
      updatedUser = response.data;
    }
    
    if (updatedUser) {
      authStore.updateUser(updatedUser);
      toast.success('Cập nhật thông tin thành công');
      showAvatarUpload.value = false;
      
      // Refresh user data để đảm bảo đồng bộ
      await authStore.checkAuth();
    } else {
      toast.error('Không nhận được dữ liệu cập nhật');
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Không thể cập nhật thông tin';
    toast.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

async function changePassword() {
  if (!canChangePassword.value) {
    toast.error('Vui lòng điền đầy đủ thông tin và đảm bảo mật khẩu mới khớp nhau');
    return;
  }

  loading.value = true;
  try {
    // Note: Cần có endpoint change-password trong backend
    await api.patch(`/users/${authStore.user?._id}/change-password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    
    toast.success('Đổi mật khẩu thành công');
    
    // Reset form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error: any) {
    console.error('Change password error:', error);
    toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
  } finally {
    loading.value = false;
  }
}

function handleAvatarUploaded(url: string) {
  profile.avatar = url;
  // Auto save when uploaded
  updateProfile();
}

function formatDate(date?: string) {
  if (!date) return 'Chưa có';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
/* Custom tab styling */
</style>
