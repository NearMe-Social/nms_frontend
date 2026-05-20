<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useNearbyStore } from '@/stores/nearbyStore'
import { useGeolocation } from '@/composables/useGeolocation'
import NearbyUserCard from '@/components/NearbyUserCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import GeoErrorState from '@/components/GeoErrorState.vue'

const nearbyStore = useNearbyStore()
const geo = useGeolocation()

const skeletonCount = 5

const isFirstLoad = computed(() => nearbyStore.loading && nearbyStore.lastFetchedAt === null)

async function init() {
  const position = await geo.request()
  if (!position) return
  await nearbyStore.fetchNearby(position.lat, position.lng)
  nearbyStore.startPolling(position.lat, position.lng)
}

const formattedTime = computed(() => {
  if (!nearbyStore.lastFetchedAt) return null
  return nearbyStore.lastFetchedAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
})

onMounted(init)
onUnmounted(() => nearbyStore.stopPolling())
</script>

<template>
  <div class="nearby-view">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>

    <header class="view-header">
      <div class="header-left">
        <span class="logo-mark">◎</span>
        <div>
          <h1 class="view-title">Nearby</h1>
          <p v-if="formattedTime" class="last-updated">updated {{ formattedTime }}</p>
        </div>
      </div>
      <div class="signal-indicator" :class="{ active: geo.status.value === 'granted' }">
        <span class="signal-dot"></span>
        <span class="signal-label">{{
          geo.status.value === 'granted' ? 'live' : geo.status.value
        }}</span>
      </div>
    </header>

    <!-- Geo error -->
    <GeoErrorState
      v-if="
        geo.status.value === 'denied' ||
        geo.status.value === 'unavailable' ||
        geo.status.value === 'error'
      "
      :status="geo.status.value"
      :message="geo.errorMessage.value"
      @retry="init"
    />

    <!-- Requesting location -->
    <div v-else-if="geo.status.value === 'requesting'" class="geo-requesting">
      <div class="pulse-ring"></div>
      <p class="geo-requesting-text">Locating you…</p>
    </div>

    <!-- API error -->
    <div v-else-if="nearbyStore.error && !isFirstLoad" class="api-error">
      <span class="error-icon">⚠</span>
      <p>{{ nearbyStore.error }}</p>
      <button class="retry-btn" @click="init">Retry</button>
    </div>

    <!-- Main content -->
    <main v-else class="user-list">
      <template v-if="isFirstLoad">
        <SkeletonCard v-for="i in skeletonCount" :key="i" />
      </template>

      <template v-else-if="nearbyStore.users.length > 0">
        <NearbyUserCard v-for="user in nearbyStore.users" :key="user.id" :user="user" />
      </template>

      <template v-else>
        <p class="no-users">No users nearby</p>
      </template>
    </main>
  </div>
</template>

<style scoped>
.nearby-view {
  min-height: 100dvh;
  background: #060810;
  color: #e8eaf6;
  font-family: 'Syne', sans-serif;
  padding: 0 0 48px;
  position: relative;
  overflow-x: hidden;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.18;
  animation: drift 20s ease-in-out infinite alternate;
}
.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #00ffc3 0%, transparent 70%);
  top: -180px;
  left: -160px;
}
.orb-2 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, #5b8fff 0%, transparent 70%);
  bottom: 10%;
  right: -120px;
  animation-duration: 18s;
  animation-delay: -9s;
}
@keyframes drift {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(30px, 40px) scale(1.08);
  }
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 24px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(6, 8, 16, 0.95) 80%, transparent);
  backdrop-filter: blur(8px);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-mark {
  font-size: 28px;
  color: #00ffc3;
  display: inline-block;
  animation: spin-slow 12s linear infinite;
}
@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

.view-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0;
  color: #e8eaf6;
}
.last-updated {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #4a5568;
  margin: 3px 0 0;
}

.signal-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 5px 12px;
}
.signal-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4a5568;
  transition: background 0.4s;
  display: inline-block;
}
.signal-indicator.active .signal-dot {
  background: #00ffc3;
  box-shadow: 0 0 8px #00ffc3;
  animation: blink 2.5s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.signal-label {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #8899aa;
}

.geo-requesting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  gap: 24px;
}
.pulse-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid #00ffc3;
  animation: pulse-out 1.8s ease-out infinite;
}
@keyframes pulse-out {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.geo-requesting-text {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #4a5568;
}

.api-error {
  margin: 32px 24px;
  background: rgba(255, 80, 80, 0.06);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.error-icon {
  font-size: 24px;
  color: #ff6b6b;
}
.api-error p {
  font-size: 14px;
  color: #8899aa;
  margin: 0;
}
.retry-btn {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e8eaf6;
  border-radius: 8px;
  padding: 8px 20px;
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.retry-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.user-list {
  padding: 8px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-users {
  text-align: center;
  padding: 80px 24px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #2a3545;
}

.card-enter {
  animation: card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.refresh-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(to right, transparent, #00ffc3, #5b8fff, transparent);
  animation: sweep 1.4s ease-in-out infinite;
  z-index: 100;
}
@keyframes sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
