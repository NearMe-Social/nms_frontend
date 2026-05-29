<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between animate-fade-down">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Dashboard Overview</h1>
        <p class="text-gray-400 text-sm mt-0.5">
          Real-time metrics and moderation queue for NearMe Social.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm"
        >
          Generate Report
        </button>
        <button
          class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          <Plus class="w-4 h-4" /> New Alert
        </button>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users class="w-5 h-5 text-blue-500" />
          </div>
          <span class="text-xs font-semibold text-emerald-500">↑ 12.5%</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Users</p>
          <p class="text-2xl font-black text-gray-800 mt-0.5">1.28M</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <FileText class="w-5 h-5 text-teal-500" />
          </div>
          <span class="text-xs font-semibold text-emerald-500">↑ 4.2%</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Posts</p>
          <p class="text-2xl font-black text-gray-800 mt-0.5">42.9K</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertCircle class="w-5 h-5 text-red-500" />
          </div>
          <span class="text-xs font-semibold text-red-400">↓ 2.1%</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Reported Content
          </p>
          <p class="text-2xl font-black text-gray-800 mt-0.5">842</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <Ban class="w-5 h-5 text-gray-500" />
          </div>
          <span class="text-xs font-semibold text-gray-400">— 0.0%</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Blocked Users</p>
          <p class="text-2xl font-black text-gray-800 mt-0.5">3.1K</p>
        </div>
      </div>
    </div>

    <!-- Recent Reports Queue -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-up">
      <!-- Queue header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-base font-bold text-gray-800">Recent Reports Queue</h2>
        <RouterLink to="/admin/reports" class="text-sm font-semibold text-blue-600 hover:underline">
          View All
        </RouterLink>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col divide-y divide-gray-50">
        <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div class="h-3 bg-gray-100 rounded-full w-24" />
          <div class="h-3 bg-gray-100 rounded-full w-20" />
          <div class="h-3 bg-gray-100 rounded-full w-28" />
          <div class="h-6 bg-gray-100 rounded-full w-24 ml-auto" />
          <div class="h-3 bg-gray-100 rounded-full w-12" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="px-6 py-10 text-center">
        <AlertCircle class="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p class="text-sm text-red-500 font-semibold">{{ error }}</p>
        <button
          class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
          @click="fetchRecentReports"
        >
          Retry
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="recentReports.length === 0" class="px-6 py-12 text-center">
        <CheckCircle class="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <p class="text-sm font-bold text-gray-700">No pending reports</p>
        <p class="text-xs text-gray-400 mt-1">The queue is clear. Great work!</p>
      </div>

      <!-- Table -->
      <div v-else>
        <!-- Table header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span class="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Item</span
          >
          <span class="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Type</span
          >
          <span class="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Reporter</span
          >
          <span class="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Status/Priority</span
          >
          <span
            class="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right"
            >Actions</span
          >
        </div>

        <!-- Table rows -->
        <div class="divide-y divide-gray-50">
          <div
            v-for="report in recentReports"
            :key="report.id"
            class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition items-center"
          >
            <!-- Item -->
            <div class="col-span-3">
              <p class="text-sm font-semibold text-gray-800">{{ report.target }}</p>
            </div>

            <!-- Type -->
            <div class="col-span-2">
              <p class="text-sm text-gray-600">{{ report.reason }}</p>
            </div>

            <!-- Reporter -->
            <div class="col-span-3 flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0"
              >
                <Bot v-if="report.reportedBy.name === 'System AI'" class="w-3 h-3 text-blue-500" />
                <span v-else class="text-xs font-bold text-blue-600">{{
                  report.reportedBy.name.charAt(0).toUpperCase()
                }}</span>
              </div>
              <span class="text-sm text-blue-600 font-medium truncate"
                >@{{ report.reportedBy.name }}</span
              >
            </div>

            <!-- Status/Priority -->
            <div class="col-span-2">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="statusClass(report.status)"
              >
                {{ statusLabel(report.status) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-2 flex justify-end">
              <button
                class="text-sm font-semibold text-blue-600 hover:underline"
                @click="goToDetail(report)"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Plus, Users, FileText, AlertCircle, Ban, CheckCircle, Bot } from 'lucide-vue-next'
import { adminReportsApi, type ApiAdminReport } from '@/services/api'

interface MappedReport {
  id: number
  target: string
  reason: string
  status: string
  reportedBy: {
    name: string
    email: string
  }
}

const router = useRouter()
const recentReports = ref<MappedReport[]>([])
const isLoading = ref(false)
const error = ref('')

function mapReport(report: ApiAdminReport): MappedReport {
  const reporterName = report.reporter?.username ?? report.reporter?.email ?? 'System AI'
  const targetType = report.targetType?.toLowerCase() ?? 'unknown'
  return {
    id: report.reportId,
    reportedBy: {
      name: reporterName,
      email: report.reporter?.email ?? '',
    },
    target: `${targetType.toUpperCase()} #${report.targetId}`,
    reason: report.reason ?? 'Unknown',
    status: report.status?.toLowerCase() ?? 'pending',
  }
}

async function fetchRecentReports() {
  try {
    isLoading.value = true
    error.value = ''
    const data = await adminReportsApi.list()
    recentReports.value = data.slice(0, 5).map(mapReport)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load reports'
    recentReports.value = []
  } finally {
    isLoading.value = false
  }
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-orange-50 text-orange-500 border border-orange-200',
    reviewed: 'bg-gray-100 text-gray-500 border border-gray-200',
    critical: 'bg-red-50 text-red-500 border border-red-200',
    resolved: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  }
  return map[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending Review',
    reviewed: 'In Review',
    critical: 'Critical',
    resolved: 'Resolved',
  }
  return map[status] ?? status
}

function goToDetail(report: MappedReport) {
  router.push({ name: 'AdminReportDetail', params: { id: report.id } })
}

onMounted(fetchRecentReports)
</script>

<style scoped>
.animate-fade-down {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
