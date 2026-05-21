<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-6 py-6">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Make a Report</h1>
          <p class="text-gray-600">Help us keep the community safe by reporting inappropriate content or behavior</p>
        </div>

        <!-- Report Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Report Post Card -->
          <router-link
            to="/report/post"
            class="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-300 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                <FileText class="w-6 h-6 text-purple-600" />
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">Report a Post</h2>
                <p class="text-sm text-gray-600">Report inappropriate, misleading, or harmful posts</p>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
            </div>
          </router-link>

          <!-- Report User Card -->
          <router-link
            to="/report/user"
            class="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-300 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">Report a User</h2>
                <p class="text-sm text-gray-600">Report harassment, fake accounts, or other user violations</p>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
            </div>
          </router-link>

          <!-- Report Comment Card -->
          <router-link
            to="/report/comment"
            class="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-300 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                <MessageCircle class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">Report a Comment</h2>
                <p class="text-sm text-gray-600">Report offensive or harmful comments</p>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
            </div>
          </router-link>
        </div>

        <!-- Info Section -->
        <div class="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info class="w-5 h-5" />
            Why report?
          </h3>
          <ul class="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Help keep our community safe and respectful</li>
            <li>Prevent harassment, spam, and misinformation</li>
            <li>Protect vulnerable users from harmful content</li>
            <li>All reports are reviewed by our moderation team</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, AlertTriangle, MessageCircle, ChevronRight, Info } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
</script>
