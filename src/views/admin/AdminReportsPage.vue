<template>
  <div class="p-4 sm:p-6 flex flex-col gap-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-down">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Report Management</h1>
        <p class="text-gray-400 text-sm mt-0.5">Review and resolve community flagged content.</p>
      </div>
      <button
        type="button"
        @click="fetchReports"
        :disabled="isLoading"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-60"
      >
        <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
        Refresh reports
      </button>
    </div>

    <!-- Trends -->
    <div class="animate-fade-up">
      <ReportingTrendsSection :reports="reports" />
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 animate-fade-up">
      <ReportFilterBar
        :status="selectedStatus"
        :type="selectedType"
        @update:status="selectedStatus = $event"
        @update:type="selectedType = $event"
        @clear="clearFilters"
      />

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="w-full sm:w-64">
          <ReportSearchInput v-model="search" />
        </div>
        <span class="text-xs text-gray-400 whitespace-nowrap">
          Showing {{ filteredReports.length }} of {{ reports.length }}
        </span>
      </div>
    </div>

    <div class="animate-fade-up">
      <ReportTableComponent
        :reports="filteredReports"
        :is-loading="isLoading"
        :error="errorMessage"
        @retry="fetchReports"
        @selectReport="goToDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw } from 'lucide-vue-next'
import ReportFilterBar from '@/views/admin/ReportFilterBar.vue'
import ReportSearchInput from '@/views/admin/ReportSearchInput.vue'
import ReportTableComponent from '@/views/admin/ReportTableComponent.vue'
import { adminReportsApi } from '@/services/api'
import ReportingTrendsSection from '@/views/admin/ReportingTrendsSection.vue'

const router = useRouter()
const search = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const reports = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

function mapReport(report) {
  const reporterName = report.reporter?.username || report.reporter?.email || 'Unknown user'
  const targetType = report.targetType?.toLowerCase() || 'unknown'

  return {
    ...report,
    id: report.reportId,
    reportedBy: {
      name: reporterName,
      email: report.reporter?.email || '',
      avatar: '',
    },
    target: `${targetType.toUpperCase()} ID: ${report.targetId}`,
    type: targetType,
    status: report.status?.toLowerCase() || 'pending',
    created_at: report.createdAt,
  }
}

async function fetchReports() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const data = await adminReportsApi.list()
    reports.value = data.map(mapReport)
  } catch (error) {
    console.error('Failed to fetch admin reports:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load reports'
    reports.value = []
  } finally {
    isLoading.value = false
  }
}

const filteredReports = computed(() => {
  const query = search.value.trim().toLowerCase()

  return reports.value.filter((report) => {
    const matchesSearch =
      query === '' ||
      report.reason.toLowerCase().includes(query) ||
      report.target.toLowerCase().includes(query) ||
      report.reportedBy.name.toLowerCase().includes(query) ||
      report.reportedBy.email.toLowerCase().includes(query)

    const matchesStatus = selectedStatus.value === 'all' || report.status === selectedStatus.value
    const matchesType = selectedType.value === 'all' || report.type === selectedType.value

    return matchesSearch && matchesStatus && matchesType
  })
})

function goToDetail(report) {
  router.push({
    name: 'AdminReportDetail',
    params: { id: report.id },
  })
}

function clearFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedType.value = 'all'
}

onMounted(fetchReports)
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
