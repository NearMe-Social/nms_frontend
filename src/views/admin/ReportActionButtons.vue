<template>
  <div class="flex flex-col gap-2 w-full">

    <!-- Already resolved -->
    <div
      v-if="status === 'resolved'"
      class="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-green-50 text-green-600 border border-green-200 flex items-center justify-center gap-2"
    >
      <CheckCircle class="w-4 h-4" />
      Already Resolved
    </div>

    <!-- Already rejected -->
    <div
      v-else-if="status === 'rejected'"
      class="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-red-50 text-red-500 border border-red-200 flex items-center justify-center gap-2"
    >
      <XCircle class="w-4 h-4" />
      Already Rejected
    </div>

    <!-- Action buttons -->
    <template v-else>

      <!-- Approve / Resolve -->
      <button
        @click="$emit('approve')"
        :disabled="loading"
        class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <CheckCircle v-else class="w-4 h-4" />
        {{ loading ? 'Processing...' : 'Approve & Resolve' }}
      </button>

      <!-- Mark as reviewed -->
      <button
        v-if="status === 'pending'"
        @click="$emit('review')"
        :disabled="loading"
        class="w-full py-2.5 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Eye class="w-4 h-4" />
        Mark as Reviewed
      </button>

      <!-- Reject -->
      <button
        @click="$emit('reject')"
        :disabled="loading"
        class="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <XCircle class="w-4 h-4" />
        Reject Report
      </button>

    </template>

  </div>
</template>

<script setup>
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-vue-next'

defineProps({
  status: { type: String, default: 'pending' },
  loading: { type: Boolean, default: false },
})

defineEmits(['approve', 'reject', 'review'])
</script>