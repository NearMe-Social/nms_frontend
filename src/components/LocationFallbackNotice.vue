<script setup lang="ts">
import { MapPinned, RefreshCw } from 'lucide-vue-next'

defineProps<{
  refreshing?: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
  >
    <span class="flex items-center gap-2">
      <MapPinned class="h-4 w-4 shrink-0" />
      Showing your last verified area while Nearme refreshes your location.
    </span>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 font-bold text-teal-700 transition hover:text-teal-900"
      :disabled="refreshing"
      @click="$emit('refresh')"
    >
      <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': refreshing }" />
      {{ refreshing ? 'Refreshing...' : 'Refresh location' }}
    </button>
  </div>
</template>
