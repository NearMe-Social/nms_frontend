<template>
  <label class="report-search">
    <Search class="search-icon" />
    <input
      :value="modelValue"
      type="text"
      placeholder="Search reports, users..."
      class="search-input"
      @input="onInput"
    />
  </label>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.report-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.search-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #4b5563;
  font-size: 0.75rem;
}

.search-input::placeholder {
  color: #9ca3af;
}
</style>
