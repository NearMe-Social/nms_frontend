<template>
  <Transition name="panel">
    <div
      v-if="report"
      class="fixed inset-0 z-50 flex items-center justify-end"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Panel -->
      <div class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <Flag class="w-4 h-4 text-red-400" />
            <h2 class="text-base font-bold text-gray-800">Report #{{ report.id }}</h2>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <X class="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          <!-- Status badge -->
          <div class="flex items-center justify-between">
            <ReportStatusBadge :status="report.status" />
            <span class="text-xs text-gray-400">{{ formatDate(report.created_at) }}</span>
          </div>

          <!-- Reported by -->
          <div class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reported By</p>
            <div class="flex items-center gap-3">
              <img
                :src="report.reportedBy.avatar"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ report.reportedBy.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Submitted this report</p>
              </div>
            </div>
          </div>

          <!-- Report type -->
          <div class="flex flex-col gap-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Type</p>
            <span :class="typeClass(report.type)" class="px-3 py-1.5 rounded-xl text-xs font-semibold w-fit">
              {{ report.type }}
            </span>
          </div>

          <!-- Reason -->
          <div class="flex flex-col gap-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</p>
            <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {{ report.reason }}
            </p>
          </div>

          <!-- Moderator note -->
          <div class="flex flex-col gap-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Moderator Note</p>
            <textarea
              v-model="moderatorNote"
              placeholder="Add a note about this report..."
              rows="3"
              class="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none resize-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
            ></textarea>
          </div>

        </div>

        <!-- Action buttons -->
        <div class="px-6 py-4 border-t border-gray-100 flex flex-col gap-2">
          <ReportActionButtons
            :status="report.status"
            :loading="actionLoading"
            @approve="handleAction('resolved')"
            @reject="handleAction('rejected')"
            @review="handleAction('reviewed')"
          />
          <button
            @click="$emit('close')"
            class="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all duration-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { Flag, X } from 'lucide-vue-next'
import ReportStatusBadge from './ReportStatusBadge.vue'
import ReportActionButtons from './ReportActionButtons.vue'

const props = defineProps({
  report: { type: Object, default: null },
})

const emit = defineEmits(['close', 'updateStatus'])

const moderatorNote = ref('')
const actionLoading = ref(false)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
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

async function handleAction(newStatus) {
  actionLoading.value = true
  // simulate API call
  await new Promise(resolve => setTimeout(resolve, 600))
  emit('updateStatus', { id: props.report.id, status: newStatus })
  actionLoading.value = false
}
</script>

<style scoped>
.panel-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
}
.panel-enter-from .panel-leave-to {
  opacity: 0;
}
.panel-enter-from > div:last-child {
  transform: translateX(100%);
}
.panel-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>