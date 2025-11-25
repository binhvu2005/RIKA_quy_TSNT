<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div class="max-w-2xl w-full space-y-8 relative z-10 animate-fade-in">
      <!-- Logo and Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6 transform hover:scale-105 transition-transform">
          <Logo :size="'lg'" :show-full="true" :show-subtitle="true" />
        </div>
        <h2 class="text-4xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
        <p class="text-gray-600">Đăng ký để tham gia Quỹ thắp sáng niềm tin</p>
      </div>

      <!-- Register Form -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Error Message -->
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start space-x-3">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm font-medium">{{ error }}</p>
            </div>
          </transition>

          <!-- Success Message -->
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="success" class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-start space-x-3">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium">{{ success }}</p>
                <p class="text-xs mt-1">Vui lòng đợi quản trị viên phê duyệt tài khoản của bạn.</p>
              </div>
            </div>
          </transition>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-semibold text-gray-700">
                Username <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  required
                  minlength="3"
                  maxlength="30"
                  pattern="[a-zA-Z0-9_]+"
                  class="input pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tên đăng nhập"
                />
              </div>
              <p class="text-xs text-gray-500">Chỉ chứa chữ cái, số và dấu gạch dưới</p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-gray-700">
                Email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="input pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <!-- Full Name -->
            <div class="space-y-2">
              <label for="full_name" class="block text-sm font-semibold text-gray-700">
                Họ và tên
              </label>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                class="input focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label for="phone" class="block text-sm font-semibold text-gray-700">
                Số điện thoại
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="input pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-gray-700">
                Mật khẩu <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="input pl-10 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirm_password" class="block text-sm font-semibold text-gray-700">
                Xác nhận mật khẩu <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirm_password"
                  v-model="form.confirm_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :class="{ 'border-red-300': form.password && form.confirm_password && form.password !== form.confirm_password }"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="form.password && form.confirm_password && form.password !== form.confirm_password" class="text-xs text-red-500">
                Mật khẩu không khớp
              </p>
            </div>
          </div>

          <!-- Identity (CCCD/CMND) -->
          <div class="space-y-2">
            <label for="identity" class="block text-sm font-semibold text-gray-700">
              Số CCCD/CMND
            </label>
            <input
              id="identity"
              v-model="form.identity"
              type="text"
              class="input focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nhập số CCCD/CMND (nếu có)"
            />
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="agreeTerms"
              type="checkbox"
              required
              class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              Tôi đồng ý với
              <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">Điều khoản sử dụng</a>
              và
              <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">Chính sách bảo mật</a>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || (form.password !== form.confirm_password)"
            class="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            <span>{{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>
        </div>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Đã có tài khoản?
            <router-link
              to="/login"
              class="ml-1 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Đăng nhập ngay
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';
import Logo from '../../components/common/Logo.vue';

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const error = ref('');
const success = ref('');
const agreeTerms = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  full_name: '',
  phone: '',
  identity: '',
});

async function handleRegister() {
  // Validate
  if (form.password !== form.confirm_password) {
    error.value = 'Mật khẩu xác nhận không khớp';
    return;
  }

  if (form.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const payload: any = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    // Chỉ thêm các field optional nếu có giá trị
    if (form.full_name?.trim()) payload.full_name = form.full_name.trim();
    if (form.phone?.trim()) payload.phone = form.phone.trim();
    if (form.identity?.trim()) payload.identity = form.identity.trim();

    const response = await api.post('/auth/register', payload);
    
    // Response format: { success: true, data: { message: '...', data: {...} }, timestamp: '...' }
    const responseData = response.data?.data || response.data;
    const message = responseData?.message || 'Đăng ký thành công!';
    
    success.value = message;
    toast.success(message);
    
    // Reset form
    Object.assign(form, {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      full_name: '',
      phone: '',
      identity: '',
    });
    agreeTerms.value = false;

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    console.error('Register error:', err);
    
    // Xử lý lỗi validation
    if (err.response?.status === 400) {
      const errorData = err.response?.data;
      if (Array.isArray(errorData?.message)) {
        // Validation errors từ class-validator
        error.value = errorData.message.join(', ');
      } else {
        error.value = errorData?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      }
    } else if (err.response?.status === 409) {
      // Conflict - username hoặc email đã tồn tại
      error.value = err.response?.data?.message || 'Username hoặc email đã được sử dụng.';
    } else if (err.response?.status === 403 || err.response?.status === 401) {
      error.value = 'Bạn không có quyền đăng ký. Vui lòng liên hệ quản trị viên.';
    } else {
      // Lỗi khác
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      error.value = errorMessage;
    }
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>

