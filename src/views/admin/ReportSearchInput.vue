<template>
  <div
    :class="[
      'flex items-center bg-white border rounded-xl px-3 py-2 gap-2 shadow-sm transition-all duration-300 ease-out',
      isFocused
        ? 'border-teal-400 ring-2 ring-teal-100 shadow-md'
        : 'border-gray-200'
    ]"
  >
    <Search class="w-4 h-4 text-gray-400 shrink-0 transition-colors duration-300" />
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
      placeholder="Search by name or reason..."
      class="text-sm text-gray-600 outline-none w-full placeholder-gray-400 bg-transparent"
    />
    <Transition name="pop">
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        class="shrink-0 text-gray-300 hover:text-gray-500 transition-colors duration-200"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

defineProps({
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const isFocused = ref(false)
</script>

<style scoped>
.pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-leave-active {
  transition: all 0.15s ease-out;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>