<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-6 py-6">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <router-link to="/report" class="text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <ChevronLeft class="w-4 h-4" />
              <span>Back</span>
            </router-link>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Report a User</h1>
          <p class="text-gray-600">Tell us why you're reporting this user</p>
        </div>

        <!-- User info (if provided) -->
        <div v-if="reportingUser" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-blue-600" />
          <span class="text-sm text-blue-800">
            Reporting user: <span class="font-semibold">{{ reportingUser }}</span>
          </span>
        </div>

        <!-- Report Reason Selector -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <ReportReasonSelector
            ref="reasonSelector"
            report-type="user"
            allow-custom-reason
            @reason-selected="onReasonSelected"
            @submit="handleReportSubmit"
            @success="onSuccessReport"
          />
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <Toast
      ref="successToast"
      :title="toastTitle"
      :message="toastMessage"
      type="success"
      :auto-close="true"
      :duration="4000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, AlertCircle } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import ReportReasonSelector from '@/components/ReportReasonSelector.vue'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const router = useRouter()
const reasonSelector = ref()
const successToast = ref()
const reportingUser = ref<string | null>(null)
const toastTitle = ref('Report Submitted')
const toastMessage = ref('Thank you for helping keep our community safe.')

onMounted(() => {
  // Get username from query params: /report/user?username=john_doe
  const username = route.query.username as string
  if (username) {
    reportingUser.value = username
  }
})

function onReasonSelected(reason: any) {
  console.log('Report user reason selected:', reason)
}

function onSuccessReport(message: string) {
  toastMessage.value = message
  successToast.value?.open()
  
  // Navigate back after 2 seconds
  setTimeout(() => {
    router.back()
  }, 2000)
}

async function handleReportSubmit(data: any) {
  try {
    // Set loading state
    reasonSelector.value?.setLoading(true)

    // Simulate API call (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Report submitted:', data)

    // Set success state and show toast
    reasonSelector.value?.setSuccess('Report submitted successfully! Thank you for helping keep our community safe.')

    // Reset after 2 seconds
    setTimeout(() => {
      reasonSelector.value?.reset()
    }, 2000)
  } catch (error) {
    console.error('Error submitting report:', error)
    reasonSelector.value?.setError('Failed to submit report. Please try again.')
  }
}
</script>
