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
