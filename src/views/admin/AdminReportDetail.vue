<template>
  <div class="p-6 flex flex-col gap-5 animate-fade-up">
    
    <div class="flex items-center gap-3">
      <button
        @click="router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <ArrowLeft class="w-4 h-4 text-gray-500" />
      </button>
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold text-gray-800">Case #{{ report?.id }}</h1>
        <span :class="priorityClass" class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          {{ report?.priority }} Priority
        </span>
      </div>
      <p class="text-xs text-gray-400 ml-1">
        Inappropriate Content Report • Opened {{ timeAgo(report?.created_at) }}
      </p>
    </div>

    <div class="flex gap-5 items-start">
  
      <div class="flex-1 flex flex-col gap-4 min-w-0">
        
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-semibold text-gray-700">Reported Content</span>
            </div>
            <button class="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline transition">
              <ExternalLink class="w-3.5 h-3.5" />
              View Original Post
            </button>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-3 mb-3">
              <img
                :src="report?.reportedBy?.avatar"
                class="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ report?.reportedBy?.name }}</p>
                <p class="text-xs text-gray-400">Posted {{ formatDate(report?.created_at) }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">{{ report?.content }}</p>
            <div class="w-full h-48 bg-gray-900 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer"
              @click="showContent = !showContent">
              <template v-if="!showContent">
                <EyeOff class="w-8 h-8 text-gray-500" />
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Potentially Sensitive</p>
                <p class="text-xs text-gray-500">Hover to reveal</p>
              </template>
              <template v-else>
                <img
                  :src="report?.reportedBy?.avatar"
                  class="w-full h-full object-cover rounded-xl opacity-80"
                />
              </template>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Clock class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-semibold text-gray-700">Investigation Timeline</span>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div v-for="event in timeline" :key="event.id" class="flex gap-3">
              <div class="flex flex-col items-center">
                <div :class="[
                  'w-3 h-3 rounded-full shrink-0 mt-0.5',
                  event.active ? 'bg-blue-500' : 'bg-gray-200'
                ]"></div>
                <div class="w-0.5 flex-1 bg-gray-100 mt-1"></div>
              </div>
              <div class="flex-1 pb-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-gray-700">{{ event.title }}</p>
                  <span class="text-xs text-gray-400">{{ event.time }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ event.description }}</p>
                <div v-if="event.confidence"
                  class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg w-fit">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  Confidence Score: {{ event.confidence }}
                </div>
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
                  <option value="in_review">In Review</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Internal Notes</p>
              <textarea
                v-model="internalNote"
                placeholder="Add investigation details..."
                rows="4"
                class="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              ></textarea>
            </div>
            <div class="flex flex-col gap-2">
              <button
                @click="handleAction('resolved')"
                :disabled="actionLoading"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" />
                <Trash2 v-else class="w-4 h-4" />
                Remove Content
              </button>
              <button
                @click="handleAction('suspended')"
                :disabled="actionLoading"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <UserX class="w-4 h-4" />
                Suspend User
              </button>
              <button
                @click="handleAction('rejected')"
                :disabled="actionLoading"
                class="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <XCircle class="w-4 h-4" />
                Reject Report (Keep Content)
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
                <span class="text-sm font-bold text-gray-600">
                  {{ report?.reportedBy?.name?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ report?.reportedBy?.name }}</p>
                <p class="text-xs text-gray-400">Member since 2021</p>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="font-semibold text-gray-500 uppercase tracking-wider">Trust Score</span>
                <span class="font-bold text-blue-600">98 / 100</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style="width: 98%"></div>
              </div>
            </div>
            <p class="text-xs text-gray-400 leading-relaxed">
              Reporter has submitted 4 previous reports. 100% accuracy rate.
            </p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-bold text-gray-800">Target User Context</span>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FileText class="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-700">Report #6542</p>
                  <p class="text-xs text-gray-400">Spam / Duplicate</p>
                </div>
              </div>
              <ReportStatusBadge status="rejected" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, Eye, EyeOff, ExternalLink, Clock,
  AlertTriangle, Zap, ChevronDown, Trash2, UserX,
  XCircle, Loader2, FileText
} from 'lucide-vue-next'
import ReportStatusBadge from '@/views/admin/ReportStatusBadge.vue'

const router = useRouter()
const route = useRoute()


// ALL MOCK REPORTS — must match AdminReportsPage.vue

const allReports = [
  {
    id: 92841,
    reportedBy: { name: 'alex_rivera', avatar: 'https://i.pravatar.cc/150?img=1' },
    target: 'POST ID: PST-1029',
    reason: 'Harassment',
    status: 'pending',
    priority: 'high',
    created_at: '2023-10-24T14:32:00',
    content: 'Just saw the craziest thing downtown! This shouldn\'t be allowed in our neighborhood. Complete garbage. #citylife #unbelievable',
  },
  {
    id: 92840,
    reportedBy: { name: 'maria_j', avatar: 'https://i.pravatar.cc/150?img=3' },
    target: 'CMT ID: CMT-442',
    reason: 'Spam',
    status: 'resolved',
    priority: 'low',
    created_at: '2023-10-24T10:15:00',
    content: 'Buy cheap products at www.spam.com click here now!!!',
  },
  {
    id: 92839,
    reportedBy: { name: 'tom_k', avatar: 'https://i.pravatar.cc/150?img=5' },
    target: 'USER ID: USR-991',
    reason: 'Inappropriate Profile',
    status: 'rejected',
    priority: 'medium',
    created_at: '2023-10-23T09:00:00',
    content: 'This user has an inappropriate profile picture.',
  },
  {
    id: 92838,
    reportedBy: { name: 'liam_jones', avatar: 'https://i.pravatar.cc/150?img=8' },
    target: 'POST ID: PST-1088',
    reason: 'Hate Speech',
    status: 'pending',
    priority: 'high',
    created_at: '2023-10-23T08:30:00',
    content: 'This post contains hateful content targeting a specific group.',
  },
  {
    id: 92837,
    reportedBy: { name: 'anna_lee', avatar: 'https://i.pravatar.cc/150?img=9' },
    target: 'USER ID: USR-445',
    reason: 'Fake Account',
    status: 'pending',
    priority: 'medium',
    created_at: '2023-10-22T16:00:00',
    content: 'This account is impersonating a real person.',
  },
]


// Find report by route param ID or fall back to history state
const report = ref(
  history.state?.report ||
  allReports.find(r => r.id === Number(route.params.id)) ||
  allReports[0]
)

const showContent = ref(false)
const currentStatus = ref('in_review')
const internalNote = ref('')
const actionLoading = ref(false)

const priorityClass = computed(() => {
  const map = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-orange-100 text-orange-600',
    low: 'bg-gray-100 text-gray-500',
  }
  return map[report.value?.priority] || 'bg-gray-100 text-gray-500'
})

const timeline = ref([
  {
    id: 1,
    title: 'Moderator Assigned',
    description: 'Case assigned to you for manual review.',
    time: 'Just now',
    active: true,
  },
  {
    id: 2,
    title: 'AI Pre-screening',
    description: 'Automated system flagged image content.',
    time: '1 hour ago',
    active: false,
    confidence: '87%',
  },
  {
    id: 3,
    title: 'Report Submitted',
    description: 'User submitted report for review.',
    time: '2 hours ago',
    active: false,
  },
])

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hours ago`
  return `${Math.floor(hours / 24)} days ago`
}

async function handleAction() {
  actionLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  actionLoading.value = false
  router.back()
}
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>