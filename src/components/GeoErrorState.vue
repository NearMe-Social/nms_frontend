<script setup lang="ts">
import type { GeoStatus } from '@/composables/useGeolocation'

defineProps<{
  status: GeoStatus
  message: string | null
}>()

defineEmits<{ retry: [] }>()

const icons: Record<string, string> = {
  denied: '!',
  unavailable: 'i',
  error: '!',
}

const titles: Record<string, string> = {
  denied: 'Location permission is off',
  unavailable: 'Location is unavailable',
  error: 'Location could not be loaded',
}

const descriptions: Record<string, string> = {
  denied: 'Allow location in your browser settings, then try again.',
  unavailable: 'Check that device location is enabled and try again.',
  error: 'Something interrupted the location check. Try again in a moment.',
}
</script>

<template>
  <div class="geo-error">
    <div class="geo-icon">{{ icons[status] ?? '?' }}</div>
    <div class="geo-copy">
      <span class="geo-label">Location needed</span>
      <h2>{{ titles[status] ?? 'Location unavailable' }}</h2>
      <p class="geo-message">{{ message ?? descriptions[status] ?? 'Location unavailable.' }}</p>
    </div>

    <div v-if="status === 'denied'" class="geo-hint">
      <p>Enable it in your browser</p>
      <ul>
        <li><span>1</span> Open the site controls beside the address bar.</li>
        <li><span>2</span> Set <strong>Location</strong> to <strong>Allow</strong>.</li>
        <li><span>3</span> Return here and try again.</li>
      </ul>
    </div>

    <button class="retry-btn" @click="$emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
.geo-error {
  width: 100%;
  margin: 0 auto 22px;
  background:
    radial-gradient(circle at top left, rgba(244, 63, 94, 0.08), transparent 34%),
    #fff;
  border: 1px solid #fee2e2;
  border-radius: 20px;
  padding: 28px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  box-shadow: 0 14px 34px rgba(38, 65, 82, 0.07);
}

.geo-icon {
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #fff1f2;
  color: #e11d48;
  font-size: 1.35rem;
  font-weight: 900;
  box-shadow: 0 0 0 8px rgba(244, 63, 94, 0.05);
}

.geo-copy {
  min-width: 0;
}

.geo-label {
  color: #be123c;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.geo-copy h2 {
  margin: 5px 0 0;
  color: #17384a;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: 850;
  letter-spacing: -0.02em;
}

.geo-message {
  margin: 8px 0 0;
  max-width: 620px;
  color: #71879a;
  font-size: 0.86rem;
  font-weight: 550;
  line-height: 1.6;
}

.geo-hint {
  grid-column: 2;
  width: min(100%, 620px);
  background: #f8fbfd;
  border: 1px solid #e3ecf2;
  border-radius: 16px;
  padding: 15px 17px;
}

.geo-hint p {
  margin: 0 0 8px;
  color: #315064;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.geo-hint ul {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
}

.geo-hint li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #71879a;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.5;
}

.geo-hint li span {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e4f6f4;
  color: #0f8179;
  font-size: 0.72rem;
  font-weight: 850;
}

.geo-hint strong {
  color: #315064;
}

.retry-btn {
  grid-column: 2;
  justify-self: start;
  background: #0f8179;
  border: 0;
  color: #fff;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.retry-btn:hover {
  background: #0b6f68;
  box-shadow: 0 10px 22px rgba(15, 129, 121, 0.18);
  transform: translateY(-1px);
}

@media (max-width: 767px) {
  .geo-error {
    grid-template-columns: 1fr;
    margin-bottom: 16px;
    border-radius: 17px;
    padding: 20px;
  }

  .geo-hint,
  .retry-btn {
    grid-column: auto;
  }

  .geo-icon {
    width: 54px;
    height: 54px;
  }

  .retry-btn {
    width: 100%;
  }
}
</style>
