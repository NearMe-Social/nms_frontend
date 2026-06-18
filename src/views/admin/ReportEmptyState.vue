<template>
  <div class="report-state">
    <Inbox class="state-icon" />
    <div>
      <p class="state-title">{{ title }}</p>
      <p class="state-copy">{{ copy }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    copy?: string
  }>(),
  {
    title: 'No reports found',
    copy: 'Try another search or filter.',
  },
)
</script>

<style scoped>
.report-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #6b7280;
}

.state-icon {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.9rem;
  background: #ecfeff;
  color: #0f9488;
  padding: 0.55rem;
}

.state-title {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: left;
}

.state-copy {
  margin-top: 0.125rem;
  color: #9ca3af;
  font-size: 0.75rem;
  text-align: left;
}
</style>
