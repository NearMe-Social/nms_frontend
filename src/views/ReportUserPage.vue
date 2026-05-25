<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-6 py-6">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <button type="button" class="text-teal-600 hover:text-teal-700 flex items-center gap-1" @click="router.back()">
              <ChevronLeft class="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Report a User</h1>
          <p class="text-gray-600">Tell us why you're reporting this user</p>
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
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import ReportReasonSelector from '@/components/ReportReasonSelector.vue'
import Toast from '@/components/Toast.vue'
import { reportApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const reasonSelector = ref()
const successToast = ref()
const toastTitle = ref('Report Submitted')
const toastMessage = ref('Thank you for helping keep our community safe.')

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
    reasonSelector.value?.setLoading(true)

    const reporterId = auth.user?.userId ?? auth.user?.user_id
    const targetId = Number(route.query.userId)

    if (!reporterId) {
      throw new Error('Please log in again before submitting a report.')
    }

    if (!Number.isInteger(targetId)) {
      throw new Error('Missing user to report.')
    }

    await reportApi.create({
      reporter_id: reporterId,
      target_type: 'USER',
      target_id: targetId,
      reason: buildReason(data),
    })

    reasonSelector.value?.setSuccess('Report submitted successfully! Thank you for helping keep our community safe.')

    setTimeout(() => {
      reasonSelector.value?.reset()
    }, 2000)
  } catch (error) {
    console.error('Error submitting report:', error)
    reasonSelector.value?.setError(error instanceof Error ? error.message : 'Failed to submit report. Please try again.')
  }
}

function buildReason(data: any) {
  const selectedReasons = Array.isArray(data.reasons)
    ? data.reasons.map((reason: any) => reason.label).filter(Boolean)
    : []
  const customDetails = data.customDetails?.trim()

  return [...selectedReasons, customDetails].filter(Boolean).join('; ')
}
</script>
