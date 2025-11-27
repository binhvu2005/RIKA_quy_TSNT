<template>
  <div class="animate-fade-in">
    <!-- Hero Banner Carousel -->
    <section class="relative h-[600px] md:h-[700px] overflow-hidden">
      <div class="absolute inset-0">
        <div
          v-for="(banner, index) in banners"
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000"
          :class="{ 'opacity-100': currentBanner === index, 'opacity-0': currentBanner !== index }"
        >
          <img
            :src="banner.image"
            :alt="banner.title"
            class="w-full h-full object-cover image-sharp transform transition-transform duration-700"
            :class="{ 'scale-105': currentBanner === index, 'scale-100': currentBanner !== index }"
            loading="eager"
            @error="handleImageError"
          />
          <!-- Overlay nhẹ hơn để ảnh rõ nét hơn -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent transition-opacity duration-1000"
            :class="{
              'from-black/20 via-black/10': index === 0 || index === 2,
              'from-black/30 via-black/20': index === 1,
            }"
          ></div>
        </div>
      </div>

      <!-- Floating particles background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          v-for="i in 20"
          :key="i"
          class="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }"
        ></div>
      </div>

      <div class="relative h-full flex items-center">
        <div class="container mx-auto px-4 text-white">
          <div class="max-w-2xl">
            <h1
              class="text-4xl md:text-6xl font-bold mb-6 animate-slide-up"
              :class="{ 'animate-fade-in-up': currentBanner === 0 }"
            >
              {{ banners[currentBanner].title }}
            </h1>
            <p
              class="text-xl md:text-2xl mb-8 text-gray-100 animate-slide-up animation-delay-200"
              :class="{ 'animate-fade-in-up': currentBanner === 0 }"
            >
              {{ banners[currentBanner].subtitle }}
            </p>
            <div
              class="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400"
              :class="{ 'animate-fade-in-up': currentBanner === 0 }"
            >
              <router-link
                to="/articles"
                class="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-110 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <span class="relative z-10">Khám phá ngay</span>
                <span
                  class="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                ></span>
              </router-link>
              <router-link
                to="/scholarships"
                class="btn bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 text-lg font-semibold rounded-lg transform hover:scale-110 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <span class="relative z-10">Tìm học bổng</span>
                <span
                  class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                ></span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Indicators -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        <button
          v-for="(banner, index) in banners"
          :key="index"
          @click="currentBanner = index"
          class="w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125"
          :class="
            currentBanner === index
              ? 'bg-white w-8 shadow-lg'
              : 'bg-white/50 hover:bg-white/75'
          "
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>

      <!-- Navigation Arrows -->
      <button
        @click="previousBanner"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg z-10"
        aria-label="Previous banner"
      >
        <svg class="w-6 h-6 transform transition-transform hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        @click="nextBanner"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg z-10"
        aria-label="Next banner"
      >
        <svg class="w-6 h-6 transform transition-transform hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>

    <!-- Stats Section -->
    <section
      ref="statsSection"
      class="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      :class="{ 'animate-fade-in-up': isVisible.stats }"
    >
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="text-center transform hover:scale-110 transition-all duration-300"
            :class="{ 'animate-fade-in-up': isVisible.stats }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div
              class="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 transition-all duration-500"
              :class="{ 'animate-counter': isVisible.stats }"
            >
              {{ stat.value }}
            </div>
            <div class="text-gray-600 dark:text-gray-400 font-medium">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      ref="featuresSection"
      class="py-20 bg-gray-50 dark:bg-gray-900"
      :class="{ 'animate-fade-in-up': isVisible.features }"
    >
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2
            class="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up"
            :class="{ 'animate-fade-in-up': isVisible.features }"
          >
            Tính năng nổi bật
          </h2>
          <p
            class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200"
            :class="{ 'animate-fade-in-up': isVisible.features }"
          >
            Khám phá các tính năng giúp bạn kết nối, học hỏi và phát triển cùng cộng đồng
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="card text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden"
            :class="{ 'animate-fade-in-up': isVisible.features }"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Hover effect background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div
              class="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10"
            >
              {{ feature.icon }}
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white relative z-10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Highlight Articles -->
    <section
      v-if="highlightArticles.length > 0"
      class="py-20 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Tin tức nổi bật
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Những bài viết được quan tâm nhiều nhất
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="(article, index) in highlightArticles"
            :key="article._id"
            class="card bg-white dark:bg-gray-800 cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl group overflow-hidden"
            @click="$router.push(`/articles/${article.slug}`)"
          >
            <div
              v-if="article.thumbnail"
              class="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4 overflow-hidden relative"
            >
              <img
                :src="article.thumbnail"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
              />
              <div
                class="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold"
              >
                ⭐ Nổi bật
              </div>
            </div>
            <div v-else class="w-full h-56 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg mb-4 flex items-center justify-center">
              <span class="text-6xl text-white/50">📰</span>
            </div>
            <div class="flex items-center space-x-2 mb-3">
              <span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium">
                {{ getCategoryName(article.category) || 'Tin tức' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(article.createdAt) }}</span>
            </div>
            <h3 class="text-xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ article.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {{ stripHtml(article.content) }}
            </p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">👁️ {{ article.stats?.views || 0 }}</span>
              <span class="text-primary-600 dark:text-primary-400 font-medium">Đọc thêm →</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Latest Articles -->
    <section
      ref="articlesSection"
      class="py-20 bg-white dark:bg-gray-800"
      :class="{ 'animate-fade-in-up': isVisible.articles }"
    >
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2
              class="text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in-up"
              :class="{ 'animate-fade-in-up': isVisible.articles }"
            >
              Tin tức mới nhất
            </h2>
            <p
              class="text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-200"
              :class="{ 'animate-fade-in-up': isVisible.articles }"
            >
              Cập nhật những thông tin mới nhất từ cộng đồng
            </p>
          </div>
          <router-link
            to="/articles"
            class="hidden md:block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-all duration-300 transform hover:scale-110 hover:translate-x-1"
          >
            Xem tất cả →
          </router-link>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Đang tải tin tức...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="latestArticles.length === 0"
          class="text-center py-12 animate-fade-in-up"
        >
          <div class="text-6xl mb-4 animate-bounce">📰</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa có tin tức nào</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Hãy quay lại sau để xem các tin tức mới nhất</p>
          <router-link
            to="/articles"
            class="btn btn-primary inline-block transform hover:scale-110 transition-all duration-300"
          >
            Xem tất cả tin tức
          </router-link>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article
            v-for="(article, index) in latestArticles"
            :key="article._id"
            class="card cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl group overflow-hidden"
            :class="{ 'animate-fade-in-up': isVisible.articles }"
            :style="{ animationDelay: `${index * 100}ms` }"
            @click="$router.push(`/articles/${article.slug}`)"
          >
            <div
              v-if="article.thumbnail"
              class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4 overflow-hidden relative"
            >
              <img
                :src="article.thumbnail"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
            </div>
            <div v-else class="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg mb-4 flex items-center justify-center group-hover:from-primary-500 group-hover:to-primary-700 transition-all duration-500">
              <span class="text-6xl text-white/50 group-hover:scale-125 transition-transform duration-500">📰</span>
            </div>
            <div class="flex items-center space-x-2 mb-3">
              <span
                class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium transform group-hover:scale-110 transition-transform duration-300"
              >
                {{ getCategoryName(article.category) || 'Tin tức' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(article.createdAt) }}</span>
            </div>
            <h3 class="text-xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              {{ article.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {{ stripHtml(article.content) }}
            </p>
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{{ article.stats?.views || 0 }} lượt xem</span>
              <span class="text-primary-600 dark:text-primary-400 font-medium transform group-hover:translate-x-2 transition-transform duration-300 inline-block">
                Đọc thêm →
              </span>
            </div>
          </article>
        </div>
        <div class="mt-8 text-center md:hidden">
          <router-link
            to="/articles"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-colors"
          >
            Xem tất cả tin tức →
          </router-link>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section
      ref="testimonialsSection"
      class="py-20 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      :class="{ 'animate-fade-in-up': isVisible.testimonials }"
    >
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2
            class="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up"
            :class="{ 'animate-fade-in-up': isVisible.testimonials }"
          >
            Cảm nhận từ cộng đồng
          </h2>
          <p
            class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200"
            :class="{ 'animate-fade-in-up': isVisible.testimonials }"
          >
            Những chia sẻ chân thành từ các thành viên của chúng tôi
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="card transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden"
            :class="{ 'animate-fade-in-up': isVisible.testimonials }"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Decorative gradient on hover -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div class="flex items-center mb-4 relative z-10">
              <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                {{ testimonial.name.charAt(0) }}
              </div>
              <div class="ml-4">
                <div class="font-semibold text-gray-900 dark:text-white">{{ testimonial.name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ testimonial.role }}</div>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 italic relative z-10">"{{ testimonial.message }}"</p>
            <div class="mt-4 flex text-yellow-400 relative z-10">
              <span
                v-for="i in 5"
                :key="i"
                class="transform transition-all duration-300"
                :class="{ 'group-hover:scale-125': i <= 4 }"
                :style="{ transitionDelay: `${i * 50}ms` }"
              >
                ★
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      ref="ctaSection"
      class="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden"
      :class="{ 'animate-fade-in-up': isVisible.cta }"
    >
      <!-- Animated background -->
      <div class="absolute inset-0">
        <div
          v-for="i in 10"
          :key="i"
          class="absolute w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }"
        ></div>
      </div>
      <div class="container mx-auto px-4 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">Sẵn sàng bắt đầu hành trình của bạn?</h2>
        <p class="text-xl mb-8 text-primary-100 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Tham gia cùng chúng tôi để tạo nên những thay đổi tích cực cho cộng đồng
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
          <router-link
            to="/register"
            class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-110 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <span class="relative z-10">Đăng ký ngay</span>
            <span
              class="absolute inset-0 bg-primary-600/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            ></span>
          </router-link>
          <router-link
            to="/forum"
            class="btn bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 text-lg font-semibold rounded-lg transform hover:scale-110 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <span class="relative z-10">Tham gia diễn đàn</span>
            <span
              class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            ></span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../../services/api';
import type { Article, Category } from '../../types';
import banner1 from '../../assets/Banner.jpg';
import banner2 from '../../assets/Banner1.jpg';
import banner3 from '../../assets/Banner2.jpg';

const loading = ref(true);
const latestArticles = ref<Article[]>([]);
const highlightArticles = ref<Article[]>([]);
const categories = ref<Category[]>([]);
const currentBanner = ref(0);
let bannerInterval: ReturnType<typeof setInterval> | null = null;

// Refs for scroll animations
const statsSection = ref<HTMLElement | null>(null);
const featuresSection = ref<HTMLElement | null>(null);
const articlesSection = ref<HTMLElement | null>(null);
const testimonialsSection = ref<HTMLElement | null>(null);
const ctaSection = ref<HTMLElement | null>(null);

// Visibility state for scroll animations
const isVisible = ref({
  stats: false,
  features: false,
  articles: false,
  testimonials: false,
  cta: false,
});

const banners = [
  {
    image: banner1,
    title: 'Chào mừng đến với Quỹ thắp sáng niềm tin',
    subtitle: 'Cùng nhau xây dựng tương lai tươi sáng cho thế hệ trẻ',
  },
  {
    image: banner2,
    title: 'Học bổng và Cơ hội phát triển',
    subtitle: 'Hỗ trợ tài chính và cơ hội học tập cho mọi người',
  },
  {
    image: banner3,
    title: 'Cộng đồng kết nối và chia sẻ',
    subtitle: 'Nơi mọi người cùng nhau học hỏi và phát triển',
  },
];

const stats = [
  { value: '1000+', label: 'Thành viên' },
  { value: '500+', label: 'Học bổng' },
  { value: '200+', label: 'Bài viết' },
  { value: '50+', label: 'Dự án' },
];

const features = [
  {
    icon: '📰',
    title: 'Tin tức & Bài viết',
    description: 'Cập nhật tin tức và bài viết mới nhất từ cộng đồng, chia sẻ kiến thức và kinh nghiệm',
  },
  {
    icon: '💬',
    title: 'Diễn đàn',
    description: 'Thảo luận và chia sẻ ý kiến với cộng đồng, kết nối với những người cùng chí hướng',
  },
  {
    icon: '🎓',
    title: 'Học bổng',
    description: 'Tìm kiếm và đăng ký các chương trình học bổng phù hợp với nhu cầu của bạn',
  },
];

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    role: 'Sinh viên',
    message: 'Quỹ đã giúp tôi có cơ hội học tập tốt hơn. Tôi rất biết ơn!',
  },
  {
    name: 'Trần Thị B',
    role: 'Phụ huynh',
    message: 'Con tôi đã nhận được học bổng nhờ sự hỗ trợ từ quỹ. Cảm ơn rất nhiều!',
  },
  {
    name: 'Lê Văn C',
    role: 'Giáo viên',
    message: 'Đây là một nền tảng tuyệt vời để kết nối và hỗ trợ học sinh.',
  },
];

function nextBanner() {
  currentBanner.value = (currentBanner.value + 1) % banners.length;
}

function previousBanner() {
  currentBanner.value = currentBanner.value === 0 ? banners.length - 1 : currentBanner.value - 1;
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/1920x700/0284c7/ffffff?text=Banner';
}

// Intersection Observer for scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const section = entry.target as HTMLElement;
        if (section === statsSection.value) {
          isVisible.value.stats = true;
        } else if (section === featuresSection.value) {
          isVisible.value.features = true;
        } else if (section === articlesSection.value) {
          isVisible.value.articles = true;
        } else if (section === testimonialsSection.value) {
          isVisible.value.testimonials = true;
        } else if (section === ctaSection.value) {
          isVisible.value.cta = true;
        }
      }
    });
  }, observerOptions);

  if (statsSection.value) observer.observe(statsSection.value);
  if (featuresSection.value) observer.observe(featuresSection.value);
  if (articlesSection.value) observer.observe(articlesSection.value);
  if (testimonialsSection.value) observer.observe(testimonialsSection.value);
  if (ctaSection.value) observer.observe(ctaSection.value);

  return observer;
}

onMounted(async () => {
  // Auto-rotate banners
  bannerInterval = setInterval(() => {
    nextBanner();
  }, 5000);

  // Setup scroll animations
  setTimeout(() => {
    setupScrollAnimations();
  }, 100);

  // Fetch highlight articles (sorted by views and likes)
  try {
    const highlightResponse = await api.get('/articles', {
      params: { page: 1, limit: 3, status: 'published' },
    });
    let highlightData: Article[] = [];
    if (highlightResponse.data?.data?.data) {
      highlightData = highlightResponse.data.data.data;
    } else if (highlightResponse.data?.data) {
      highlightData = Array.isArray(highlightResponse.data.data) ? highlightResponse.data.data : [];
    } else if (Array.isArray(highlightResponse.data)) {
      highlightData = highlightResponse.data;
    }
    // Sort by views + likes to get most popular
    highlightArticles.value = highlightData
      .sort((a, b) => {
        const aScore = (a.stats?.views || 0) + (a.stats?.likes || 0);
        const bScore = (b.stats?.views || 0) + (b.stats?.likes || 0);
        return bScore - aScore;
      })
      .slice(0, 3);
  } catch (error: any) {
    console.error('Error fetching highlight articles:', error);
  }

  // Fetch latest articles
  try {
    const response = await api.get('/articles', {
      params: { page: 1, limit: 6, status: 'published' },
    });
    console.log('Articles response:', response.data);
    if (response.data?.data?.data) {
      latestArticles.value = response.data.data.data;
    } else if (response.data?.data) {
      latestArticles.value = Array.isArray(response.data.data) ? response.data.data : [];
    } else if (Array.isArray(response.data)) {
      latestArticles.value = response.data;
    }
    console.log('Latest articles:', latestArticles.value);
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    console.error('Error details:', error.response?.data);
  }

  // Fetch categories
  try {
    const catResponse = await api.get('/categories', { params: { type: 'news' } });
    if (catResponse.data?.data) {
      categories.value = Array.isArray(catResponse.data.data) ? catResponse.data.data : [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
});

function getCategoryName(category: string | Category) {
  if (typeof category === 'string') {
    const cat = categories.value.find(c => c._id === category);
    return cat?.name || '';
  }
  return category?.name || '';
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}

function stripHtml(html: string) {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
</script>

<style scoped>
.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Floating particles animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.5;
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Pulse slow animation */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Fade in up animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

/* Image sharp rendering - full frame với chất lượng cao */
.image-sharp {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  filter: contrast(1.08) brightness(1.03) saturate(1.05);
  object-position: center center;
}

/* Counter animation */
@keyframes counter {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-counter {
  animation: counter 0.6s ease-out;
}
</style>
