<template>
  <div class="container mx-auto px-4 py-8 animate-fade-in">
    <div v-if="loadingScholarship" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="scholarship" class="max-w-4xl mx-auto">
      <router-link :to="`/scholarships/${scholarship._id}`" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Quay lại chi tiết học bổng
      </router-link>

      <div class="card">
        <h1 class="text-3xl font-bold mb-2">Đăng ký học bổng</h1>
        <p class="text-gray-600 mb-6">{{ scholarship.name }}</p>

        <form @submit.prevent="submitApplication" class="space-y-6">
          <!-- Thông tin cá nhân -->
          <div class="pb-6 border-b">
            <h3 class="text-xl font-bold mb-4">Thông tin cá nhân</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.full_name"
                  type="text"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.full_name }"
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
                <p v-if="errors.full_name" class="text-xs text-red-500 mt-1">{{ errors.full_name }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.phone }"
                  placeholder="VD: 0901234567"
                  required
                />
                <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Nơi ở (Địa chỉ thường trú) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.address"
                  type="text"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.address }"
                  placeholder="Nhập địa chỉ thường trú"
                  required
                />
                <p v-if="errors.address" class="text-xs text-red-500 mt-1">{{ errors.address }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Nơi học (Trường/Đơn vị đào tạo) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.school"
                  type="text"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.school }"
                  placeholder="Nhập tên trường/đơn vị đào tạo"
                  required
                />
                <p v-if="errors.school" class="text-xs text-red-500 mt-1">{{ errors.school }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Năm sinh <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.birth_year"
                  type="number"
                  min="1950"
                  :max="new Date().getFullYear()"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.birth_year }"
                  placeholder="VD: 2000"
                  required
                />
                <p v-if="errors.birth_year" class="text-xs text-red-500 mt-1">{{ errors.birth_year }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Giới tính <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.gender"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.gender }"
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                <p v-if="errors.gender" class="text-xs text-red-500 mt-1">{{ errors.gender }}</p>
              </div>
            </div>
          </div>

          <div v-if="scholarship.criteria && scholarship.criteria.length > 0">
            <h3 class="text-xl font-bold mb-4">Thông tin đăng ký</h3>
            <div class="space-y-4">
              <div
                v-for="(criterion, index) in scholarship.criteria"
                :key="index"
                class="border border-gray-200 rounded-lg p-4"
              >
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ criterion.name }} <span class="text-red-500">*</span>
                  <span v-if="criterion.description" class="text-gray-500 font-normal text-xs block mt-1">
                    {{ criterion.description }}
                  </span>
                  <span class="text-primary-600 text-xs">(Trọng số: {{ criterion.weight }}%)</span>
                </label>
                <textarea
                  v-if="criterion.key === 'essay' || criterion.key.includes('essay')"
                  v-model="formData[criterion.key]"
                  rows="5"
                  class="input w-full"
                  :class="{ 'border-red-500': errors[criterion.key] }"
                  :placeholder="`Nhập ${criterion.name.toLowerCase()}`"
                  required
                ></textarea>
                <input
                  v-else-if="criterion.key === 'gpa' || criterion.key.includes('gpa')"
                  v-model.number="formData[criterion.key]"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  class="input w-full"
                  :class="{ 'border-red-500': errors[criterion.key] }"
                  placeholder="Nhập điểm GPA (0-4)"
                  required
                />
                <input
                  v-else
                  v-model="formData[criterion.key]"
                  type="text"
                  class="input w-full"
                  :class="{ 'border-red-500': errors[criterion.key] }"
                  :placeholder="`Nhập ${criterion.name.toLowerCase()}`"
                  required
                />
                <p v-if="errors[criterion.key]" class="text-xs text-red-500 mt-1">{{ errors[criterion.key] }}</p>
              </div>
            </div>
          </div>

          <div v-else>
            <h3 class="text-xl font-bold mb-4">Thông tin bổ sung</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Lý do đăng ký <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.reason"
                  rows="5"
                  class="input w-full"
                  :class="{ 'border-red-500': errors.reason }"
                  placeholder="Nhập lý do bạn muốn nhận học bổng này..."
                  required
                ></textarea>
                <p v-if="errors.reason" class="text-xs text-red-500 mt-1">{{ errors.reason }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Thành tích nổi bật
                </label>
                <textarea
                  v-model="formData.achievements"
                  rows="5"
                  class="input w-full"
                  placeholder="Nhập các thành tích, giải thưởng của bạn..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Tài liệu đính kèm -->
          <div class="pt-6 border-t">
            <h3 class="text-xl font-bold mb-4">Tài liệu đính kèm</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Sổ hộ nghèo / Giấy chứng nhận hộ nghèo <span class="text-red-500">*</span>
                </label>
                <FileUpload
                  v-model="formData.poor_household_certificate"
                  accept="image/*,application/pdf"
                  :max-size="10"
                  label="Tải lên sổ hộ nghèo hoặc giấy chứng nhận"
                  accept-text="Chấp nhận: Ảnh, PDF (tối đa 10MB)"
                />
                <p v-if="errors.poor_household_certificate" class="text-xs text-red-500 mt-1">{{ errors.poor_household_certificate }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Giấy chứng nhận học sinh/sinh viên <span class="text-red-500">*</span>
                </label>
                <FileUpload
                  v-model="formData.student_certificate"
                  accept="image/*,application/pdf"
                  :max-size="10"
                  label="Tải lên giấy chứng nhận học sinh/sinh viên"
                  accept-text="Chấp nhận: Ảnh, PDF (tối đa 10MB)"
                />
                <p v-if="errors.student_certificate" class="text-xs text-red-500 mt-1">{{ errors.student_certificate }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Bảng điểm / Học bạ <span class="text-red-500">*</span>
                </label>
                <FileUpload
                  v-model="formData.transcript"
                  accept="image/*,application/pdf"
                  :max-size="10"
                  label="Tải lên bảng điểm hoặc học bạ"
                  accept-text="Chấp nhận: Ảnh, PDF (tối đa 10MB)"
                />
                <p v-if="errors.transcript" class="text-xs text-red-500 mt-1">{{ errors.transcript }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Giấy tờ tùy thân (CCCD/CMND) <span class="text-red-500">*</span>
                </label>
                <FileUpload
                  v-model="formData.identity_card"
                  accept="image/*,application/pdf"
                  :max-size="10"
                  label="Tải lên mặt trước và sau CCCD/CMND"
                  accept-text="Chấp nhận: Ảnh, PDF (tối đa 10MB)"
                />
                <p v-if="errors.identity_card" class="text-xs text-red-500 mt-1">{{ errors.identity_card }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Tài liệu khác (nếu có)
                </label>
                <FileUpload
                  v-model="formData.other_documents"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  :max-size="10"
                  label="Tải lên các tài liệu khác"
                  accept-text="Chấp nhận: Ảnh, PDF, Word (tối đa 10MB)"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              @click="$router.back()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading || !canSubmit"
              class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Đang gửi...' : 'Gửi đơn đăng ký' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'vue-toastification';
import type { Scholarship } from '../../types';
import FileUpload from '../../components/common/FileUpload.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const loadingScholarship = ref(true);
const scholarship = ref<Scholarship | null>(null);
const formData = reactive<Record<string, any>>({});
const errors = reactive<Record<string, string>>({});

// Validate form
function validateForm(): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);
  
  let isValid = true;

  // Validate personal information
  if (!formData.full_name || formData.full_name.trim() === '') {
    errors.full_name = 'Vui lòng nhập họ và tên';
    isValid = false;
  }

  if (!formData.phone || formData.phone.trim() === '') {
    errors.phone = 'Vui lòng nhập số điện thoại';
    isValid = false;
  } else {
    // Validate phone number format (Vietnamese phone numbers)
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Số điện thoại không hợp lệ. VD: 0901234567 hoặc +84901234567';
      isValid = false;
    }
  }

  if (!formData.address || formData.address.trim() === '') {
    errors.address = 'Vui lòng nhập nơi ở';
    isValid = false;
  }

  if (!formData.school || formData.school.trim() === '') {
    errors.school = 'Vui lòng nhập nơi học';
    isValid = false;
  }

  if (!formData.birth_year) {
    errors.birth_year = 'Vui lòng nhập năm sinh';
    isValid = false;
  } else {
    const currentYear = new Date().getFullYear();
    if (formData.birth_year < 1950 || formData.birth_year > currentYear) {
      errors.birth_year = `Năm sinh phải từ 1950 đến ${currentYear}`;
      isValid = false;
    }
  }

  if (!formData.gender) {
    errors.gender = 'Vui lòng chọn giới tính';
    isValid = false;
  }

  // Validate required documents
  if (!formData.poor_household_certificate || formData.poor_household_certificate.trim() === '') {
    errors.poor_household_certificate = 'Vui lòng tải lên sổ hộ nghèo hoặc giấy chứng nhận';
    isValid = false;
  }

  if (!formData.student_certificate || formData.student_certificate.trim() === '') {
    errors.student_certificate = 'Vui lòng tải lên giấy chứng nhận học sinh/sinh viên';
    isValid = false;
  }

  if (!formData.transcript || formData.transcript.trim() === '') {
    errors.transcript = 'Vui lòng tải lên bảng điểm hoặc học bạ';
    isValid = false;
  }

  if (!formData.identity_card || formData.identity_card.trim() === '') {
    errors.identity_card = 'Vui lòng tải lên giấy tờ tùy thân';
    isValid = false;
  }

  // Validate criteria fields
  if (scholarship.value?.criteria && scholarship.value.criteria.length > 0) {
    scholarship.value.criteria.forEach(criterion => {
      if (!formData[criterion.key] || (typeof formData[criterion.key] === 'string' && formData[criterion.key].trim() === '')) {
        errors[criterion.key] = `Vui lòng nhập ${criterion.name.toLowerCase()}`;
        isValid = false;
      }
    });
  } else {
    // Validate reason if no criteria
    if (!formData.reason || formData.reason.trim() === '') {
      errors.reason = 'Vui lòng nhập lý do đăng ký';
      isValid = false;
    }
  }

  return isValid;
}

const canSubmit = computed(() => {
  if (!scholarship.value) return false;
  
  // Basic check - full validation in validateForm()
  const hasPersonalInfo = formData.full_name && formData.phone && formData.address && formData.school && formData.birth_year && formData.gender;
  const hasRequiredDocs = formData.poor_household_certificate && formData.student_certificate && 
                          formData.transcript && formData.identity_card;
  
  if (!hasPersonalInfo || !hasRequiredDocs) return false;
  
  if (scholarship.value.criteria && scholarship.value.criteria.length > 0) {
    return scholarship.value.criteria.every(c => formData[c.key]);
  }
  
  return !!formData.reason;
});

onMounted(async () => {
  await fetchScholarship();
});

async function fetchScholarship() {
  try {
    const id = route.params.id as string;
    const response = await api.get(`/scholarships/${id}`);
    scholarship.value = response.data?.data || response.data;
    
    // Check if user already applied
    try {
      const appResponse = await api.get('/scholarship-applications', {
        params: {
          scholarship_id: id,
          limit: 1,
        },
      });
      const applications = appResponse.data?.data?.data || appResponse.data?.data || [];
      if (applications.length > 0) {
        toast.warning('Bạn đã đăng ký học bổng này rồi');
        router.push(`/scholarships/${id}`);
        return;
      }
    } catch (error) {
      // Ignore error, continue with form
      console.error('Error checking application:', error);
    }
    
    // Initialize form data based on criteria
    if (scholarship.value.criteria && scholarship.value.criteria.length > 0) {
      scholarship.value.criteria.forEach(criterion => {
        formData[criterion.key] = '';
      });
    }
    
    // Initialize personal information fields
    formData.full_name = '';
    formData.phone = '';
    formData.address = '';
    formData.school = '';
    formData.birth_year = null;
    formData.gender = '';
    
    // Initialize document fields
    formData.poor_household_certificate = '';
    formData.student_certificate = '';
    formData.transcript = '';
    formData.identity_card = '';
    formData.other_documents = '';
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    toast.error('Không tìm thấy học bổng');
    router.push('/scholarships');
  } finally {
    loadingScholarship.value = false;
  }
}

async function submitApplication() {
  if (!scholarship.value) {
    toast.error('Không tìm thấy thông tin học bổng');
    return;
  }

  // Validate form
  if (!validateForm()) {
    toast.error('Vui lòng điền đầy đủ và đúng các thông tin bắt buộc');
    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                     document.querySelector(`input[class*="border-red-500"]`) ||
                     document.querySelector(`select[class*="border-red-500"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  loading.value = true;
  try {
    await api.post('/scholarship-applications', {
      scholarship_id: scholarship.value._id,
      data: formData,
    });
    
    toast.success('Đơn đăng ký đã được gửi thành công!');
    router.push('/scholarships');
  } catch (error: any) {
    console.error('Error submitting application:', error);
    const message = error.response?.data?.message || 'Không thể gửi đơn đăng ký';
    toast.error(message);
  } finally {
    loading.value = false;
  }
}
</script>

