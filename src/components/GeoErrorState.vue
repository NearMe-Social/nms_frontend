<script setup lang="ts">
import type { GeoStatus } from '@/composables/useGeolocation'

defineProps<{
  status: GeoStatus
  message: string | null
}>()

defineEmits<{ retry: [] }>()

const icons: Record<string, string> = {
  denied: '⊘',
  unavailable: '◌',
  error: '⚠',
}
</script>

<template>
  <div class="geo-error">
    <div class="geo-icon">{{ icons[status] ?? '?' }}</div>
    <p class="geo-message">{{ message ?? 'Location unavailable.' }}</p>

    <div v-if="status === 'denied'" class="geo-hint">
      <p>To enable location:</p>
      <ul>
        <li>Click the 🔒 or ⓘ icon in your browser's address bar</li>
        <li>Find <strong>Location</strong> and set it to <strong>Allow</strong></li>
        <li>Reload the page</li>
      </ul>
    </div>

    <button v-if="status !== 'denied'" class="retry-btn" @click="$emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600&family=DM+Mono:wght@300&display=swap');

.geo-error {
  margin: 40px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.geo-icon {
  font-size: 40px;
  color: #334155;
}
.geo-message {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  color: #8899aa;
  margin: 0;
  max-width: 280px;
  line-height: 1.6;
}
.geo-hint {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  max-width: 300px;
  width: 100%;
}
.geo-hint p {
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  color: #5a6a7a;
  margin: 0 0 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.geo-hint ul {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.geo-hint li {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #4a5568;
  line-height: 1.5;
}
.geo-hint strong {
  color: #6a7a8a;
}
.retry-btn {
  background: rgba(0, 255, 195, 0.08);
  border: 1px solid rgba(0, 255, 195, 0.2);
  color: #00ffc3;
  border-radius: 10px;
  padding: 10px 28px;
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.retry-btn:hover {
  background: rgba(0, 255, 195, 0.14);
}
</style>
