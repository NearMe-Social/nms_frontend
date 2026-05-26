<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-6 py-6 flex flex-col gap-6">

      <!-- Page header -->
      <div class="flex items-center justify-between animate-fade-down">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Admin Reports</h1>
          <p class="text-gray-400 text-sm mt-1">Manage and review all user submitted reports</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Flag class="w-4 h-4 text-red-400" />
            <span class="text-sm font-semibold text-gray-700">
              {{ pendingCount }} Pending
            </span>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="animate-fade-down-delay">
        <ReportFilterBar
          v-model:search="search"
          v-model:status="selectedStatus"
          v-model:type="selectedType"
          @clear="clearFilters"
        />
      </div>
      <!-- Trends -->
      <div class="animate-fade-up">
        <ReportingTrendsSection :reports="reports" />
      </div>

      <!-- Table -->
      <div class="animate-fade-up">
        <ReportTableComponent
          :reports="filteredReports"
          :is-loading="isLoading"
          :error="errorMessage"
          @retry="fetchReports"
          @selectReport="selectedReport = $event"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Flag } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import ReportFilterBar from '@/views/admin/ReportFilterBar.vue'
import ReportTableComponent from '@/views/admin/ReportTableComponent.vue'
import { adminReportsApi } from '@/services/api'
import ReportingTrendsSection from '@/views/admin/ReportingTrendsSection.vue'

const search = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const selectedReport = ref(null)
const reports = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

function mapReport(report) {
  const reporterName = report.reporter?.username || report.reporter?.email || 'Unknown user'

  return {
    ...report,
    id: report.reportId,
    reportedBy: {
      name: reporterName,
      email: report.reporter?.email || '',
      avatar: '',
    },
    type: report.targetType.toLowerCase(),
    status: report.status.toLowerCase(),
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

onMounted(fetchReports)

const pendingCount = computed(() =>
  reports.value.filter(r => r.status === 'pending').length
)

const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchSearch =
      search.value === '' ||
      report.reason.toLowerCase().includes(search.value.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(search.value.toLowerCase()) ||
      report.reportedBy.email.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = selectedStatus.value === 'all' || report.status === selectedStatus.value
    const matchType = selectedType.value === 'all' || report.type === selectedType.value
    return matchSearch && matchStatus && matchType
  })
})

function clearFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedType.value = 'all'
}
</script>

<style scoped>
.animate-fade-down {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-fade-down-delay {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
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
