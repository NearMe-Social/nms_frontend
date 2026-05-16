<template>
  <span
    :class="badgeClass"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ease-out"
  >
    <span :class="[dotClass, isPending ? 'animate-pulse' : '']" class="w-1.5 h-1.5 rounded-full"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const config = {
  pending: {
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    label: 'Pending',
  },
  reviewed: {
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    label: 'Reviewed',
  },
  resolved: {
    badge: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    label: 'Resolved',
  },
  rejected: {
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
}

const badgeClass = computed(() => config[props.status]?.badge || 'bg-gray-50 text-gray-600 border border-gray-200')
const dotClass = computed(() => config[props.status]?.dot || 'bg-gray-400')
const label = computed(() => config[props.status]?.label || props.status)
const isPending = computed(() => props.status === 'pending')
</script>