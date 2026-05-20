<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-up">

    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
      <FolderOpen class="w-9 h-9 text-gray-300" />
    </div>

    <h3 class="text-base font-semibold text-gray-700 mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-400 max-w-xs leading-relaxed">{{ message }}</p>

    <button
      v-if="showClear"
      @click="$emit('clear')"
      class="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-teal-600 bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-all duration-200"
    >
      <X class="w-4 h-4" /> Clear filters
    </button>

  </div>
</template>

<script setup>
import { FolderOpen, X } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'No reports found' },
  message: { type: String, default: 'There are no reports matching your current filters.' },
  showClear: { type: Boolean, default: false },
})

defineEmits(['clear'])
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>