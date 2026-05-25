<template>
  <div class="p-6 flex flex-col gap-5">

   
    <div class="flex items-center justify-between animate-fade-down">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Report Management</h1>
        <p class="text-gray-400 text-sm mt-0.5">Review and resolve community flagged content.</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm">
        <Download class="w-4 h-4" />
        Export Log
      </button>
    </div>


    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-up">

   
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-wrap">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
          <div class="flex items-center gap-1 ml-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="selectedStatus = option.value"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                selectedStatus === option.value
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-1.5 ml-4">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</span>
          <div class="relative ml-2">
            <select
              v-model="selectedType"
              class="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 outline-none pr-7 cursor-pointer hover:bg-gray-50 transition"
            >
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <ChevronDown class="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div class="ml-auto flex items-center gap-3">
        
          <div class="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 gap-2 w-56">
            <Search class="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              v-model="search"
              type="text"
              placeholder="Search reports, users..."
              class="bg-transparent text-xs text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>
          <span class="text-xs text-gray-400">
            Showing {{ filteredReports.length }} of {{ reports.length }}
          </span>
        </div>
      </div>

  
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report ID</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reporter</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Target</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>

       
          <tbody v-if="isLoading">
            <tr v-for="n in 5" :key="n" class="border-b border-gray-50">
              <td class="px-5 py-4"><div class="h-3 w-20 bg-gray-100 rounded-full animate-pulse"></div></td>
              <td class="px-5 py-4"><div class="h-3 w-24 bg-gray-100 rounded-full animate-pulse"></div></td>
              <td class="px-5 py-4"><div class="h-3 w-28 bg-gray-100 rounded-full animate-pulse"></div></td>
              <td class="px-5 py-4"><div class="h-3 w-32 bg-gray-100 rounded-full animate-pulse"></div></td>
              <td class="px-5 py-4"><div class="h-3 w-20 bg-gray-100 rounded-full animate-pulse"></div></td>
              <td class="px-5 py-4"><div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div></td>
            </tr>
          </tbody>

     
          <tbody v-else-if="filteredReports.length === 0">
            <tr>
              <td colspan="6" class="px-5 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <FolderOpen class="w-6 h-6 text-gray-300" />
                  </div>
                  <p class="text-sm font-semibold text-gray-500">No reports found</p>
                  <p class="text-xs text-gray-400">Try adjusting your filters</p>
                  <button
                    v-if="search || selectedStatus !== 'all' || selectedType !== 'all'"
                    @click="clearFilters"
                    class="text-xs text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

       
          <TransitionGroup v-else name="row" tag="tbody" class="divide-y divide-gray-50">
            <tr
              v-for="report in filteredReports"
              :key="report.id"
              class="hover:bg-blue-50/20 transition-colors duration-150 cursor-pointer group"
              @click="goToDetail(report)"
            >
              <td class="px-5 py-3.5">
                <span class="text-blue-600 font-semibold text-xs hover:underline">
                  #REP-{{ report.id }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <img :src="report.reportedBy.avatar" class="w-6 h-6 rounded-full object-cover" />
                  <span class="text-xs text-gray-700 font-medium">{{ report.reportedBy.name }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs text-gray-500">{{ report.target }}</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs text-gray-600">{{ report.reason }}</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs text-gray-400">{{ formatDate(report.created_at) }}</span>
              </td>
              <td class="px-5 py-3.5">
                <ReportStatusBadge :status="report.status" />
              </td>
            </tr>
          </TransitionGroup>

        </table>
      </div>

      
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <p class="text-xs text-gray-400">
          Showing <span class="font-semibold text-gray-600">1-{{ filteredReports.length }}</span> of
          <span class="font-semibold text-gray-600">{{ reports.length }}</span>
        </p>
        <div class="flex items-center gap-1">
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-semibold">1</button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Download, ChevronDown,
  ChevronLeft, ChevronRight, FolderOpen
} from 'lucide-vue-next'
import ReportStatusBadge from '@/views/admin/ReportStatusBadge.vue'

const router = useRouter()
const search = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const isLoading = ref(false)

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'post', label: 'Post' },
  { value: 'user', label: 'User' },
  { value: 'comment', label: 'Comment' },
]


// STATIC MOCK DATA 

const reports = ref([
  {
    id: 92841,
    reportedBy: { name: 'alex_rivera', avatar: 'https://i.pravatar.cc/150?img=1' },
    target: 'POST ID: PST-1029',
    reason: 'Harassment',
    status: 'pending',
    created_at: '2023-10-24T14:32:00',
    content: 'Just saw the craziest thing downtown! This shouldn\'t be allowed in our neighborhood.',
    priority: 'high',
  },
  {
    id: 92840,
    reportedBy: { name: 'maria_j', avatar: 'https://i.pravatar.cc/150?img=3' },
    target: 'CMT ID: CMT-442',
    reason: 'Spam',
    status: 'resolved',
    created_at: '2023-10-24T10:15:00',
    content: 'Buy cheap products at www.spam.com click here now!!!',
    priority: 'low',
  },
  {
    id: 92839,
    reportedBy: { name: 'tom_k', avatar: 'https://i.pravatar.cc/150?img=5' },
    target: 'USER ID: USR-991',
    reason: 'Inappropriate Profile',
    status: 'rejected',
    created_at: '2023-10-23T09:00:00',
    content: 'This user has an inappropriate profile picture.',
    priority: 'medium',
  },
  {
    id: 92838,
    reportedBy: { name: 'liam_jones', avatar: 'https://i.pravatar.cc/150?img=8' },
    target: 'POST ID: PST-1088',
    reason: 'Hate Speech',
    status: 'pending',
    created_at: '2023-10-23T08:30:00',
    content: 'This post contains hateful content targeting a specific group.',
    priority: 'high',
  },
  {
    id: 92837,
    reportedBy: { name: 'anna_lee', avatar: 'https://i.pravatar.cc/150?img=9' },
    target: 'USER ID: USR-445',
    reason: 'Fake Account',
    status: 'pending',
    created_at: '2023-10-22T16:00:00',
    content: 'This account is impersonating a real person.',
    priority: 'medium',
  },
])



// DYNAMIC API 

// import { useAuthStore } from '@/stores/auth'
// const auth = useAuthStore()
//
// async function fetchReports() {
//   try {
//     isLoading.value = true
//     const response = await fetch('http://localhost:3000/reports', {
//       headers: { Authorization: `Bearer ${auth.token}` },
//     })
//     reports.value = await response.json()
//   } catch (error) {
//     console.error('Failed to fetch reports:', error)
//   } finally {
//     isLoading.value = false
//   }
// }
// onMounted(() => { fetchReports() })


const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchSearch =
      search.value === '' ||
      report.reason.toLowerCase().includes(search.value.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(search.value.toLowerCase()) ||
      String(report.id).includes(search.value)
    const matchStatus = selectedStatus.value === 'all' || report.status === selectedStatus.value
    const matchType = selectedType.value === 'all' ||
      report.target.toLowerCase().includes(selectedType.value)
    return matchSearch && matchStatus && matchType
  })
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function goToDetail(report) {
  router.push({ name: 'AdminReportDetail', params: { id: report.id }, state: { report } })
}

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
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.row-enter-active { transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.row-leave-active { transition: all 0.25s ease; position: absolute; width: 100%; }
.row-enter-from { opacity: 0; transform: translateY(-6px); }
.row-leave-to { opacity: 0; transform: translateY(6px); }
.row-move { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
</style>