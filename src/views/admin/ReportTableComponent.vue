<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report ID</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reported By</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>

        <tbody v-if="isLoading">
          <tr>
            <td colspan="7" class="px-5 py-12 text-center text-sm text-gray-400">
              <ReportLoadingState />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="error">
          <tr>
            <td colspan="7" class="px-5 py-12 text-center">
              <div class="flex flex-col items-center gap-3">
                <p class="text-sm font-medium text-red-500">{{ error }}</p>
                <button
                  @click="$emit('retry')"
                  class="px-3 py-2 rounded-lg bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all duration-200"
                >
                  Try again
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="reports.length === 0">
          <tr>
            <td colspan="7" class="px-5 py-12 text-center text-sm text-gray-400">
              <ReportEmptyState />
            </td>
          </tr>
        </tbody>

        <TransitionGroup v-else name="row" tag="tbody" class="divide-y divide-gray-50">
          <tr
            v-for="report in paginatedReports"
            :key="report.id"
            class="hover:bg-teal-50/20 transition-colors duration-200 ease-out cursor-pointer group"
            @click="$emit('selectReport', report)"
          >
            <td class="px-5 py-4 text-gray-400 font-mono text-xs">#{{ report.id }}</td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-2.5">
                <img
                  v-if="report.reportedBy.avatar"
                  :src="report.reportedBy.avatar"
                  class="w-7 h-7 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-300 ease-out"
                />
                <span
                  v-else
                  class="w-7 h-7 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-300 ease-out"
                >
                  {{ initials(report.reportedBy.name) }}
                </span>
                <span class="font-medium text-gray-700">{{ report.reportedBy.name }}</span>
              </div>
            </td>
            <td class="px-5 py-4">
              <span
                :class="typeClass(report.type)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                {{ report.type }}
              </span>
            </td>
            <td class="px-5 py-4 text-gray-600 max-w-xs truncate">{{ report.reason }}</td>
            <td class="px-5 py-4">
              <ReportStatusBadge :status="report.status" />
            </td>
            <td class="px-5 py-4 text-gray-400 text-xs">{{ formatDate(report.created_at) }}</td>
            <td class="px-5 py-4">
              <button
                @click.stop="$emit('selectReport', report)"
                class="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-all duration-200"
              >
                <Eye class="w-3.5 h-3.5" /> View
              </button>
            </td>
          </tr>
        </TransitionGroup>

      </table>
    </div>

    <!-- Footer -->
    <div class="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p class="text-xs text-gray-400">
        Showing
        <span class="font-semibold text-gray-600">{{ paginationStart }}</span>-<span class="font-semibold text-gray-600">{{ paginationEnd }}</span>
        of <span class="font-semibold text-gray-600">{{ reports.length }}</span> reports
      </p>
      <div v-if="totalPages > 1" class="flex items-center gap-1">
        <button
          type="button"
          :disabled="currentPage === 1"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePageNumbers"
          :key="page"
          type="button"
          :class="[
            'w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200',
            page === currentPage
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50',
          ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ReportEmptyState from './ReportEmptyState.vue'
import ReportLoadingState from './ReportLoadingState.vue'
import ReportStatusBadge from './ReportStatusBadge.vue'

const props = defineProps({
  reports: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['selectReport', 'retry'])

const currentPage = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(props.reports.length / pageSize)))

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.reports.slice(start, start + pageSize)
})

const paginationStart = computed(() => {
  if (props.reports.length === 0) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const paginationEnd = computed(() =>
  Math.min(currentPage.value * pageSize, props.reports.length),
)

const visiblePageNumbers = computed(() => {
  const maxButtons = 5
  const total = totalPages.value
  const half = Math.floor(maxButtons / 2)
  let start = Math.max(1, currentPage.value - half)
  const end = Math.min(total, start + maxButtons - 1)

  start = Math.max(1, end - maxButtons + 1)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

watch(
  () => props.reports,
  () => {
    currentPage.value = 1
  },
)

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function goToPage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function typeClass(type) {
  const map = {
    post: 'bg-purple-50 text-purple-700',
    user: 'bg-blue-50 text-blue-700',
    comment: 'bg-orange-50 text-orange-700',
    message: 'bg-teal-50 text-teal-700',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
}

function initials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<style scoped>
/* Row transitions */
.row-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.row-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
  position: absolute;
  width: 100%;
}
.row-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.row-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.row-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
