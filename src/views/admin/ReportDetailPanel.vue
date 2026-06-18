<template>
  <section class="detail-panel">
    <div class="panel-header">
      <div class="panel-title">
        <slot name="icon" />
        <span>{{ title }}</span>
      </div>
      <span v-if="meta" class="panel-meta">{{ meta }}</span>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  meta?: string
}>()
</script>

<style scoped>
.detail-panel {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  padding: 0.875rem 1.25rem;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.panel-meta {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
