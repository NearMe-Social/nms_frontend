<template>
  <div class="p-6 flex flex-col gap-5 animate-fade-up">
    <div class="flex items-center gap-3">
      <button
        @click="router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <ArrowLeft class="w-4 h-4 text-gray-500" />
      </button>
      <div class="flex items-center gap-3 min-w-0">
        <h1 class="text-lg font-bold text-gray-800">Report #{{ report?.reportId || route.params.id }}</h1>
        <ReportStatusBadge v-if="report" :status="reportStatus" />
      </div>
      <p v-if="report" class="text-xs text-gray-400 ml-1">
        {{ targetLabel }} report opened {{ timeAgo(report.createdAt) }}
      </p>
    </div>

    <div v-if="isLoading" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      <Loader2 class="w-6 h-6 text-blue-500 animate-spin mx-auto mb-3" />
      <p class="text-sm text-gray-500">Loading report details...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <p class="text-sm font-semibold text-red-500">{{ errorMessage }}</p>
      <button
        @click="fetchReportDetail"
        class="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
      >
        Try again
      </button>
    </div>

    <div v-else-if="report" class="flex gap-5 items-start">
      <div class="flex-1 flex flex-col gap-4 min-w-0">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-semibold text-gray-700">Reported Target</span>
            </div>
            <span class="text-xs font-semibold text-gray-400">{{ targetIdLabel }}</span>
          </div>

          <div class="p-5 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
                {{ targetInitial }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ targetTitle }}</p>
                <p class="text-xs text-gray-400">{{ targetSubtitle }}</p>
              </div>
            </div>

            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Report Reason</p>
              <p class="text-sm text-gray-700 leading-relaxed">{{ report.reason }}</p>
            </div>

            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Snapshot</p>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ targetContent }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="rounded-xl border border-gray-100 p-3">
                <p class="text-xs text-gray-400 mb-1">Target Type</p>
                <p class="text-sm font-semibold text-gray-700">{{ targetLabel }}</p>
              </div>
              <div class="rounded-xl border border-gray-100 p-3">
                <p class="text-xs text-gray-400 mb-1">Target Status</p>
                <p class="text-sm font-semibold text-gray-700">{{ targetStatus }}</p>
              </div>
              <div class="rounded-xl border border-gray-100 p-3">
                <p class="text-xs text-gray-400 mb-1">Created</p>
                <p class="text-sm font-semibold text-gray-700">{{ formatDate(targetCreatedAt || report.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Clock class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-semibold text-gray-700">Investigation Timeline</span>
          </div>
          <div class="p-5 flex flex-col">
            <div v-for="(event, index) in timeline" :key="event.id" class="flex gap-3">
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-4 h-4 rounded-full shrink-0 mt-0.5 border-2 transition-all duration-200',
                    timelineDotClass(event.state)
                  ]"
                ></div>
                <div
                  v-if="index < timeline.length - 1"
                  :class="[
                    'w-0.5 h-12 mt-1 transition-colors duration-200',
                    event.state === 'completed' ? 'bg-blue-200' : 'bg-gray-100'
                  ]"
                ></div>
              </div>
              <div class="flex-1 pb-5">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <p :class="timelineTitleClass(event.state)" class="text-sm font-semibold">{{ event.title }}</p>
                    <span
                      :class="timelineBadgeClass(event.state)"
                      class="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                    >
                      {{ event.label }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400 whitespace-nowrap">{{ event.time }}</span>
                </div>
                <p :class="event.state === 'upcoming' ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-0.5 leading-relaxed">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-72 shrink-0 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <Zap class="w-4 h-4 text-orange-400 fill-orange-400" />
              <span class="text-sm font-bold text-gray-800">Resolution</span>
            </div>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Status</p>
              <div class="relative">
                <select
                  v-model="currentStatus"
                  class="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition pr-8"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                </select>
                <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Moderator Note</p>
              <textarea
                v-model="internalNote"
                placeholder="Add investigation details..."
                rows="4"
                class="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              ></textarea>
            </div>
            <div class="flex flex-col gap-2">
              <button
                @click="saveReportStatus"
                :disabled="actionLoading"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" />
                <CheckCircle2 v-else class="w-4 h-4" />
                Save Review Status
              </button>
              <button
                v-if="canModerateTarget"
                @click="removeTarget"
                :disabled="contentActionLoading"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Loader2 v-if="contentActionLoading" class="w-4 h-4 animate-spin" />
                <Trash2 v-else class="w-4 h-4" />
                Remove {{ targetLabel }}
              </button>
              <button
                @click="router.push({ name: 'AdminReports' })"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all duration-200"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-bold text-gray-800">Reporter Details</span>
          </div>
          <div class="p-5 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                <span class="text-sm font-bold text-gray-600">{{ reporterInitial }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ reporterName }}</p>
                <p class="text-xs text-gray-400 truncate">{{ report.reporter?.email || 'No email available' }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-xl bg-gray-50 p-3">
                <p class="text-gray-400 mb-1">User ID</p>
                <p class="font-semibold text-gray-700">{{ report.reporter?.userId || 'Unknown' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-3">
                <p class="text-gray-400 mb-1">Submitted</p>
                <p class="font-semibold text-gray-700">{{ formatDate(report.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-bold text-gray-800">Review Details</span>
          </div>
          <div class="p-4 flex flex-col gap-3 text-xs">
            <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <span class="font-semibold text-gray-500">Reviewed By</span>
              <span class="text-gray-700">{{ report.reviewedBy?.username || 'Not reviewed' }}</span>
            </div>
            <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <span class="font-semibold text-gray-500">Reviewed At</span>
              <span class="text-gray-700">{{ report.reviewedAt ? formatDate(report.reviewedAt) : 'Not reviewed' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Trash2,
  Zap,
} from 'lucide-vue-next'
import ReportStatusBadge from '@/views/admin/ReportStatusBadge.vue'
import { adminContentApi, adminReportsApi } from '@/services/api'

const router = useRouter()
const route = useRoute()

const report = ref(null)
const target = ref(null)
const isLoading = ref(false)
const actionLoading = ref(false)
const contentActionLoading = ref(false)
const errorMessage = ref('')
const currentStatus = ref('PENDING')
const internalNote = ref('')

const reportStatus = computed(() => report.value?.status?.toLowerCase() || 'pending')
const reporterName = computed(() => report.value?.reporter?.username || report.value?.reporter?.email || 'Unknown user')
const reporterInitial = computed(() => reporterName.value.charAt(0).toUpperCase())
const targetLabel = computed(() => titleCase(report.value?.targetType || target.value?.type || 'Target'))
const targetIdLabel = computed(() => `${report.value?.targetType || 'TARGET'} ID: ${report.value?.targetId || target.value?.id || '-'}`)
const targetInitial = computed(() => targetLabel.value.charAt(0).toUpperCase())
const targetStatus = computed(() => target.value?.status || userActiveLabel.value || 'Snapshot unavailable')
const targetCreatedAt = computed(() => target.value?.createdAt)
const userActiveLabel = computed(() => {
  if (typeof target.value?.isActive !== 'boolean') return ''
  return target.value.isActive ? 'Active' : 'Suspended'
})
const canModerateTarget = computed(() => ['POST', 'COMMENT'].includes(report.value?.targetType))

const targetTitle = computed(() => {
  if (!target.value) return 'Target snapshot unavailable'
  if (target.value.title) return target.value.title
  if (target.value.username) return `@${target.value.username}`
  if (target.value.author?.username) return `By @${target.value.author.username}`
  return targetIdLabel.value
})

const targetSubtitle = computed(() => {
  if (!target.value) return 'The target may have been deleted or is not exposed by the backend.'
  if (target.value.author?.username) return `Author: @${target.value.author.username}`
  if (target.value.email) return target.value.email
  if (target.value.note) return target.value.note
  return `${targetLabel.value} snapshot`
})

const targetContent = computed(() => {
  if (!target.value) return 'No target snapshot was returned for this report.'
  if (target.value.content) return target.value.content
  if (target.value.note) return target.value.note
  if (target.value.username) {
    const parts = [`Username: ${target.value.username}`]
    if (target.value.email) parts.push(`Email: ${target.value.email}`)
    if (target.value.role) parts.push(`Role: ${target.value.role}`)
    if (typeof target.value.isActive === 'boolean') parts.push(`Status: ${userActiveLabel.value}`)
    return parts.join('\n')
  }
  return 'This target does not expose readable content.'
})

const timeline = computed(() => {
  const isReviewed = report.value?.status === 'REVIEWED'
  const hasReviewDetails = Boolean(report.value?.reviewedAt)

  return [
    {
      id: 'submitted',
      title: 'Report Submitted',
      description: `${reporterName.value} submitted this ${targetLabel.value.toLowerCase()} report.`,
      time: timeAgo(report.value?.createdAt),
      state: 'completed',
      label: 'Done',
    },
    {
      id: 'awaiting-review',
      title: 'Awaiting Review',
      description: isReviewed
        ? 'The report moved out of the pending queue.'
        : 'This report is waiting for an admin decision.',
      time: isReviewed ? 'Completed' : 'Current step',
      state: isReviewed ? 'completed' : 'current',
      label: isReviewed ? 'Done' : 'Current',
    },
    {
      id: 'reviewed',
      title: 'Report Reviewed',
      description: isReviewed
        ? reviewedDescription.value
        : 'An admin will mark this report reviewed after making a decision.',
      time: hasReviewDetails ? timeAgo(report.value.reviewedAt) : 'Not yet',
      state: isReviewed ? 'completed' : 'upcoming',
      label: isReviewed ? 'Done' : 'Next',
    },
  ]
})

const reviewedDescription = computed(() => {
  const reviewer = report.value?.reviewedBy?.username
  const note = report.value?.moderatorNote?.trim()
  const reviewedBy = reviewer ? `Reviewed by ${reviewer}.` : 'Report was reviewed by an admin.'
  return note ? `${reviewedBy} Note: ${note}` : reviewedBy
})

async function fetchReportDetail() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const reportId = Number(route.params.id)
    const data = await adminReportsApi.get(reportId)
    report.value = data
    currentStatus.value = data.status
    internalNote.value = data.moderatorNote || ''
    await fetchTargetSnapshot(data.reportId)
  } catch (error) {
    console.error('Failed to fetch report detail:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load report detail'
    report.value = null
    target.value = null
  } finally {
    isLoading.value = false
  }
}

async function fetchTargetSnapshot(reportId) {
  target.value = null
  try {
    const flaggedItems = await adminContentApi.flagged()
    const match = flaggedItems.find((item) => item.report.reportId === reportId)
    target.value = match?.target || null
  } catch (error) {
    console.warn('Failed to fetch target snapshot:', error)
  }
}

async function saveReportStatus() {
  if (!report.value) return

  try {
    actionLoading.value = true
    const updated = await adminReportsApi.updateStatus(report.value.reportId, {
      status: currentStatus.value,
      moderatorNote: internalNote.value,
    })
    report.value = updated
    currentStatus.value = updated.status
    internalNote.value = updated.moderatorNote || ''
  } catch (error) {
    console.error('Failed to update report status:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update report status'
  } finally {
    actionLoading.value = false
  }
}

async function removeTarget() {
  if (!report.value || !canModerateTarget.value) return

  try {
    contentActionLoading.value = true
    target.value = await adminContentApi.updateStatus(report.value.targetType, report.value.targetId, 'remove')
  } catch (error) {
    console.error('Failed to remove reported target:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to remove reported target'
  } finally {
    contentActionLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function titleCase(value) {
  return value.toString().toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
}

function timelineDotClass(state) {
  const map = {
    completed: 'bg-blue-500 border-blue-500 shadow-sm',
    current: 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-sm',
    upcoming: 'bg-white border-gray-200',
  }
  return map[state] || map.upcoming
}

function timelineTitleClass(state) {
  const map = {
    completed: 'text-gray-800',
    current: 'text-blue-700',
    upcoming: 'text-gray-400',
  }
  return map[state] || map.upcoming
}

function timelineBadgeClass(state) {
  const map = {
    completed: 'bg-blue-50 text-blue-700',
    current: 'bg-amber-50 text-amber-700',
    upcoming: 'bg-gray-50 text-gray-400',
  }
  return map[state] || map.upcoming
}

onMounted(fetchReportDetail)
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
