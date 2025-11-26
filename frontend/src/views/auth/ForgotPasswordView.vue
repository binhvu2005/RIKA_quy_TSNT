<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <div class="text-3xl font-bold text-primary-600 mb-2">Quỹ Thắp Sáng Niềm Tin</div>
        </router-link>
        <p class="text-gray-600">Khôi phục mật khẩu tài khoản</p>
      </div>

      <!-- Card -->
      <div class="card">
        <!-- Step 1: Enter Email -->
        <div v-if="step === 1" class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quên mật khẩu?</h2>
            <p class="text-gray-600 dark:text-gray-400">
              Nhập email của bạn. Chúng tôi sẽ gửi mã OTP để xác thực.
            </p>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập email của bạn"
                :disabled="loading"
              />
            </div>
          </div>

          <button
            @click="sendOtp"
            :disabled="loading || !email"
            class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ loading ? 'Đang gửi...' : 'Gửi mã OTP' }}
          </button>

          <div class="text-center">
            <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              ← Quay lại đăng nhập
            </router-link>
          </div>
        </div>

        <!-- Step 2: Enter OTP -->
        <div v-if="step === 2" class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nhập mã OTP</h2>
            <p class="text-gray-600 dark:text-gray-400">
              Chúng tôi đã gửi mã OTP đến email <strong>{{ email }}</strong>
            </p>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div>
            <label for="otp" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mã OTP (6 chữ số)
            </label>
            <input
              id="otp"
              v-model="otp"
              type="text"
              maxlength="6"
              required
              class="input text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="000000"
              :disabled="loading"
              @input="otp = otp.replace(/[^0-9]/g, '')"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Mã OTP có hiệu lực trong {{ otpExpiresIn }} giây
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="verifyOtp"
              :disabled="loading || otp.length !== 6"
              class="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Đang xác thực...' : 'Xác thực' }}
            </button>
            <button
              @click="resendOtp"
              :disabled="loading || resendCooldown > 0"
              class="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại' }}
            </button>
          </div>

          <div class="text-center">
            <button
              @click="step = 1; error = ''"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Thay đổi email
            </button>
          </div>
        </div>

        <!-- Step 3: Reset Password -->
        <div v-if="step === 3" class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đặt mật khẩu mới</h2>
            <p class="text-gray-600 dark:text-gray-400">
              Nhập mật khẩu mới cho tài khoản <strong>{{ email }}</strong>
            </p>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu mới
            </label>
            <div class="relative">
              <input
                id="newPassword"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                :disabled="loading"
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

          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': confirmPassword && newPassword !== confirmPassword }"
              placeholder="Nhập lại mật khẩu mới"
              :disabled="loading"
            />
            <p
              v-if="confirmPassword && newPassword !== confirmPassword"
              class="text-xs text-red-500 mt-1"
            >
              Mật khẩu xác nhận không khớp
            </p>
          </div>

          <button
            @click="resetPassword"
            :disabled="loading || !canReset"
            class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu' }}
          </button>

          <div class="text-center">
            <button
              @click="step = 2; error = ''"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Quay lại nhập OTP
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="step === 4" class="space-y-6 text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đặt lại mật khẩu thành công!</h2>
            <p class="text-gray-600 dark:text-gray-400">
              Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
          </div>
          <router-link to="/login" class="btn btn-primary w-full">
            Đăng nhập ngay
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const router = useRouter();
const toast = useToast();

const step = ref(1);
const email = ref('');
const otp = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);
const otpExpiresIn = ref(300); // 5 minutes
const resendCooldown = ref(0);

let otpTimer: ReturnType<typeof setInterval> | null = null;
let resendTimer: ReturnType<typeof setInterval> | null = null;

const canReset = computed(() => {
  return (
    newPassword.value &&
    confirmPassword.value &&
    newPassword.value === confirmPassword.value &&
    newPassword.value.length >= 6
  );
});

async function sendOtp() {
  if (!email.value) {
    error.value = 'Vui lòng nhập email';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await api.post('/auth/forgot-password', { email: email.value });
    toast.success('Đã gửi mã OTP đến email của bạn');
    step.value = 2;
    startOtpTimer();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
    console.error('Send OTP error:', err);
  } finally {
    loading.value = false;
  }
}

async function verifyOtp() {
  if (otp.value.length !== 6) {
    error.value = 'Mã OTP phải có 6 chữ số';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await api.post('/auth/verify-otp', {
      email: email.value,
      otp: otp.value,
    });
    toast.success('Xác thực OTP thành công');
    step.value = 3;
    stopOtpTimer();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
    console.error('Verify OTP error:', err);
  } finally {
    loading.value = false;
  }
}

async function resetPassword() {
  if (!canReset.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin và đảm bảo mật khẩu khớp nhau';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await api.post('/auth/reset-password', {
      email: email.value,
      otp: otp.value,
      newPassword: newPassword.value,
    });
    toast.success('Đặt lại mật khẩu thành công!');
    step.value = 4;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
    console.error('Reset password error:', err);
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  if (resendCooldown.value > 0) return;

  loading.value = true;
  error.value = '';

  try {
    await api.post('/auth/forgot-password', { email: email.value });
    toast.success('Đã gửi lại mã OTP');
    otp.value = '';
    startOtpTimer();
    startResendCooldown();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Không thể gửi lại mã OTP';
    console.error('Resend OTP error:', err);
  } finally {
    loading.value = false;
  }
}

function startOtpTimer() {
  otpExpiresIn.value = 300;
  if (otpTimer) clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    otpExpiresIn.value--;
    if (otpExpiresIn.value <= 0) {
      stopOtpTimer();
      error.value = 'Mã OTP đã hết hạn. Vui lòng gửi lại.';
    }
  }, 1000);
}

function stopOtpTimer() {
  if (otpTimer) {
    clearInterval(otpTimer);
    otpTimer = null;
  }
}

function startResendCooldown() {
  resendCooldown.value = 60;
  if (resendTimer) clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }
    }
  }, 1000);
}

onMounted(() => {
  // Reset when component mounts
  step.value = 1;
  email.value = '';
  otp.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  error.value = '';
});

onUnmounted(() => {
  stopOtpTimer();
  if (resendTimer) {
    clearInterval(resendTimer);
  }
});
</script>

