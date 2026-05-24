<template>
  <div class="flex flex-wrap items-center gap-2">

    <!-- Search input -->
    <div class="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2 w-64 shadow-sm transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-teal-400 focus-within:shadow-md">
      <Search class="w-4 h-4 text-gray-400 shrink-0 transition-colors duration-300" />
      <input
        type="text"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        placeholder="Search reports..."
        class="text-sm text-gray-600 outline-none w-full placeholder-gray-400 bg-transparent"
      />
    </div>

    <!-- Status filter -->
    <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        @click="$emit('update:status', option.value)"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-out',
          status === option.value
            ? 'bg-gray-800 text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Type filter -->
    <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        @click="$emit('update:type', option.value)"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-out',
          type === option.value
            ? 'bg-gray-800 text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Clear filters -->
    <Transition name="pop">
      <button
        v-if="search || status !== 'all' || type !== 'all'"
        @click="$emit('clear')"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all duration-300 ease-out"
      >
        <X class="w-3.5 h-3.5" /> Clear
      </button>
    </Transition>

  </div>
</template>

<script setup>
import { Search, X } from 'lucide-vue-next'

defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: 'all' },
  type: { type: String, default: 'all' },
})

defineEmits(['update:search', 'update:status', 'update:type', 'clear'])

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'post', label: 'Post' },
  { value: 'user', label: 'User' },
  { value: 'comment', label: 'Comment' },
  { value: 'message', label: 'Message' },
]
</script>

<style scoped>
.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-leave-active {
  transition: all 0.2s cubic-bezier(0.36, 0, 0.66, -0.56);
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
