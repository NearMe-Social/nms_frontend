<template>
  <div class="report-state">
    <Loader2 class="state-icon" />
    <p>Loading reports...</p>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<style scoped>
.report-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
}

.state-icon {
  width: 1rem;
  height: 1rem;
  color: #0f9488;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
