<template>
  <article class="summary-card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <component :is="icon" :class="['card-icon', iconClass]" />
    </div>
    <div class="card-content">
      <div class="card-value">{{ value }}</div>
      <div :class="['card-change', { negative }]">{{ note }}</div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: number | string
  note: string
  icon: Component
  iconClass?: string
  negative?: boolean
}>()
</script>

<style scoped>
.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.card-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #d1d5db;
}

.users-icon {
  color: #3b82f6;
}

.posts-icon {
  color: #8b5cf6;
}

.reports-icon {
  color: #ef4444;
}

.blocked-icon {
  color: #f59e0b;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.card-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #059669;
}

.card-change.negative {
  color: #dc2626;
}
</style>
