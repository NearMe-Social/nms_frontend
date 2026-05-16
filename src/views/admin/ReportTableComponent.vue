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

        <TransitionGroup name="row" tag="tbody" class="divide-y divide-gray-50">
          <tr
            v-for="report in reports"
            :key="report.id"
            class="hover:bg-teal-50/20 transition-colors duration-200 ease-out cursor-pointer group"
            @click="$emit('selectReport', report)"
          >
            <td class="px-5 py-4 text-gray-400 font-mono text-xs">#{{ report.id }}</td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-2.5">
                <img
                  :src="report.reportedBy.avatar"
                  class="w-7 h-7 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-300 ease-out"
                />
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
    <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
      <p class="text-xs text-gray-400">
        Showing <span class="font-semibold text-gray-600">{{ reports.length }}</span> reports
      </p>
      <div class="flex items-center gap-1">
        <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-teal-600 text-white text-xs font-semibold">
          1
        </button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ReportStatusBadge from './ReportStatusBadge.vue'

defineProps({
  reports: { type: Array, default: () => [] },
})

defineEmits(['selectReport'])

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
  }
  return map[type] || 'bg-gray-100 text-gray-600'
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