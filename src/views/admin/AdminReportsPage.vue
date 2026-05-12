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

      <!-- Table -->
      <div class="animate-fade-up">
        <ReportTableComponent
          :reports="filteredReports"
          @selectReport="selectedReport = $event"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Flag } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import ReportFilterBar from '@/views/admin/ReportFilterBar.vue'
import ReportTableComponent from '@/views/admin/ReportTableComponent.vue'

const search = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const selectedReport = ref(null)


// STATIC MOCK DATA

const reports = ref([
  {
    id: 1001,
    reportedBy: { name: 'Mesa Gaming', avatar: 'https://i.pravatar.cc/150?img=1' },
    type: 'post',
    reason: 'This post contains inappropriate content and spam links',
    status: 'pending',
    created_at: '2026-05-01T10:30:00',
  },
  {
    id: 1002,
    reportedBy: { name: 'David Chen', avatar: 'https://i.pravatar.cc/150?img=3' },
    type: 'user',
    reason: 'User is harassing other members in public posts',
    status: 'reviewed',
    created_at: '2026-05-02T14:20:00',
  },
  {
    id: 1003,
    reportedBy: { name: 'Hello BBy', avatar: 'https://i.pravatar.cc/150?img=5' },
    type: 'comment',
    reason: 'Hate speech and offensive language in comment',
    status: 'resolved',
    created_at: '2026-05-03T09:15:00',
  },
  {
    id: 1004,
    reportedBy: { name: 'James Park', avatar: 'https://i.pravatar.cc/150?img=8' },
    type: 'post',
    reason: 'Misleading information about local events',
    status: 'rejected',
    created_at: '2026-05-04T16:45:00',
  },
  {
    id: 1005,
    reportedBy: { name: 'Anna Lee', avatar: 'https://i.pravatar.cc/150?img=9' },
    type: 'user',
    reason: 'Fake account impersonating a real person',
    status: 'pending',
    created_at: '2026-05-05T11:00:00',
  },
  {
    id: 1006,
    reportedBy: { name: 'Tom Wilson', avatar: 'https://i.pravatar.cc/150?img=11' },
    type: 'comment',
    reason: 'Spam comments with promotional links',
    status: 'pending',
    created_at: '2026-05-06T08:30:00',
  },
])


// DYNAMIC API — uncomment 

// import { useAuthStore } from '@/stores/auth'
// const auth = useAuthStore()
// const isLoading = ref(false)
//
// async function fetchReports() {
//   try {
//     isLoading.value = true
//     const response = await fetch('http://localhost:3000/reports', {
//       headers: {
//         Authorization: `Bearer ${auth.token}`,
//       },
//     })
//     const data = await response.json()
//     reports.value = data
//   } catch (error) {
//     console.error('Failed to fetch reports:', error)
//   } finally {
//     isLoading.value = false
//   }
// }
//
// onMounted(() => {
//   fetchReports()
// })

const pendingCount = computed(() =>
  reports.value.filter(r => r.status === 'pending').length
)

const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchSearch =
      search.value === '' ||
      report.reason.toLowerCase().includes(search.value.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(search.value.toLowerCase())
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