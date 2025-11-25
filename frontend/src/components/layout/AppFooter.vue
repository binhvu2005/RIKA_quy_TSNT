<template>
  <footer class="bg-gray-800 dark:bg-gray-900 text-white mt-auto border-t border-gray-700 dark:border-gray-800">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo and Description -->
        <div>
          <div class="flex items-center space-x-3 mb-4">
            <Logo :size="'md'" :show-full="false" :show-subtitle="false" :show-text="false" />
            <div class="flex flex-col">
              <span class="font-bold text-lg text-white">Thắp sáng niềm tin</span>
              <span class="text-xs text-gray-400">Light Your Hope</span>
            </div>
          </div>
          <p class="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
            Hệ thống quản lý quỹ hỗ trợ và học bổng cho cộng đồng.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-semibold mb-4 text-white">Liên kết nhanh</h4>
          <ul class="space-y-2 text-gray-400 dark:text-gray-500">
            <li>
              <router-link
                to="/articles"
                class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block"
              >
                Tin tức
              </router-link>
            </li>
            <li>
              <router-link
                to="/forum"
                class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block"
              >
                Diễn đàn
              </router-link>
            </li>
            <li>
              <router-link
                to="/scholarships"
                class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block"
              >
                Học bổng
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="font-semibold mb-4 text-white">Hỗ trợ</h4>
          <ul class="space-y-2 text-gray-400 dark:text-gray-500">
            <li>
              <a href="#" class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block">
                Hướng dẫn
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-white dark:hover:text-gray-200 transition-colors inline-block">
                Liên hệ
              </a>
            </li>
          </ul>
        </div>

        <!-- Follow Us -->
        <div>
          <h4 class="font-semibold mb-4 text-white">Theo dõi</h4>
          <div class="flex space-x-3">
            <!-- Facebook -->
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-[#1877F2] hover:bg-[#166FE5] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="Facebook"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>

            <!-- Twitter/X -->
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="Twitter"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                />
              </svg>
            </a>

            <!-- TikTok -->
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="TikTok"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
        <p>&copy; 2024 Quỹ thắp sáng niềm tin. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import Logo from '../common/Logo.vue';
</script>
