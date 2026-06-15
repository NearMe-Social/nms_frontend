<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Flag,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-vue-next'
import { useNearbyStore, type NearbyUser } from '@/stores/nearbyStore'
import { useNearbyLocation } from '@/composables/useNearbyLocation'
import { useAuthStore } from '@/stores/auth'
import GeoErrorState from '@/components/GeoErrorState.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import Navbar from '@/components/Navbar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import LocationFallbackNotice from '@/components/LocationFallbackNotice.vue'
import * as L from 'leaflet'

const nearbyStore = useNearbyStore()
const auth = useAuthStore()
const geo = useNearbyLocation()

const mapElement = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const userCircle = ref<L.Circle | null>(null)
const userMarker = ref<L.CircleMarker | null>(null)
const nearbyMarkers = ref<L.CircleMarker[]>([])

const radius = ref(100)
const sortMode = ref<'latest' | 'active'>('latest')
const privacyMode = ref<'Neighbors Only' | 'Approximate Distance Only' | 'Hidden From Search'>(
  'Neighbors Only',
)

const radiusOptions = [50, 100, 200]

const filteredUsers = computed(() => {
  const inRadius = nearbyStore.users.filter((user) => user.distance_m <= radius.value)

  return [...inRadius].sort((a, b) => {
    if (sortMode.value === 'latest') return a.distance_m - b.distance_m
    return b.distance_m - a.distance_m
  })
})

const detectedLabel = computed(() => {
  const count = filteredUsers.value.length
  return `${count} user${count === 1 ? '' : 's'} detected`
})

const formattedTime = computed(() => {
  if (!nearbyStore.lastFetchedAt) return 'Waiting for live update'
  return `Updated ${nearbyStore.lastFetchedAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
})

const username = computed(() => auth.user?.username ?? 'neighbor')
const displayName = computed(
  () =>
    username.value
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Nearme Neighbor',
)
const profileImage = computed(() => {
  const profile = auth.user?.profile as { profile_image?: string | null } | undefined
  return auth.user?.profile_image || profile?.profile_image || null
})

function approximateDistance(meters: number) {
  if (meters <= 50) return 'within 50m'
  if (meters <= 100) return 'within 100m'
  if (meters <= 200) return 'within 200m'
  return 'outside radius'
}

function userDistance(user: NearbyUser) {
  return user.distance_label ?? approximateDistance(user.distance_m)
}

function getPrivacyPinPosition(user: NearbyUser) {
  const base = geo.coords.value
  if (!base) {
    return { lat: 0, lng: 0 }
  }

  const distance = Math.min(user.distance_m, radius.value)
  const angle = Math.random() * Math.PI * 2
  const ring = 0.3 + Math.random() * 0.5
  const offset = Math.max(20, distance * ring)

  const latOffset = (Math.cos(angle) * offset) / 111300
  const lngOffset = (Math.sin(angle) * offset) / (111300 * Math.cos((base.lat * Math.PI) / 180))

  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset,
  }
}

function clearNearbyMarkers() {
  nearbyMarkers.value.forEach((marker) => marker.remove())
  nearbyMarkers.value = []
}

function createMap(position: { lat: number; lng: number }) {
  if (!mapElement.value || map.value) return

  map.value = L.map(mapElement.value, {
    zoomControl: true,
    attributionControl: false,
  }).setView([position.lat, position.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)

  map.value.invalidateSize()

  userCircle.value = L.circle([position.lat, position.lng], {
    radius: radius.value,
    color: '#3b82f6',
    fillColor: '#bfdbfe',
    fillOpacity: 0.18,
    weight: 2,
  }).addTo(map.value)

  userMarker.value = L.circleMarker([position.lat, position.lng], {
    radius: 8,
    color: '#047857',
    fillColor: '#22c55e',
    fillOpacity: 0.9,
    weight: 2,
  }).addTo(map.value)
}

function updateMap(position: { lat: number; lng: number }) {
  if (!map.value) {
    createMap(position)
    return
  }

  map.value.invalidateSize()
  map.value.setView([position.lat, position.lng], map.value.getZoom())
  userMarker.value?.setLatLng([position.lat, position.lng])
  userCircle.value?.setLatLng([position.lat, position.lng]).setRadius(radius.value)
}

function drawNearbyMarkers() {
  clearNearbyMarkers()

  const currentMap = map.value
  if (privacyMode.value === 'Hidden From Search' || !currentMap) {
    return
  }

  filteredUsers.value.slice(0, 10).forEach((user) => {
    const coords = getPrivacyPinPosition(user)
    const marker = L.circleMarker([coords.lat, coords.lng], {
      radius: 7,
      color: '#1d4ed8',
      fillColor: '#93c5fd',
      fillOpacity: 0.9,
      weight: 2,
    }).addTo(currentMap)

    marker.bindTooltip(`${user.username} • ${userDistance(user)}`, {
      permanent: false,
      direction: 'top',
    })

    nearbyMarkers.value.push(marker)
  })
}

async function refreshNearby(restartPolling = true) {
  const position = geo.coords.value
  if (!position) return

  const shareLocation = privacyMode.value !== 'Hidden From Search' && geo.isFresh()
  await nearbyStore.fetchNearby(position.lat, position.lng, radius.value, shareLocation)

  if (!map.value) {
    createMap(position)
  } else {
    updateMap(position)
  }

  drawNearbyMarkers()
  if (restartPolling) {
    nearbyStore.startPolling(refreshLocationAndNearby)
  }
}

async function refreshLocationAndNearby() {
  await refreshNearby(false)
}

async function init() {
  await geo.request()

  if (geo.coords.value) {
    createMap(geo.coords.value)
    await refreshNearby()
  }
}

function retryLiveLocation() {
  void geo.request({ forceRefresh: true })
}

watch(radius, async () => {
  if (!geo.coords.value) return
  if (userCircle.value) {
    userCircle.value.setRadius(radius.value)
  }
  await refreshNearby()
})

watch(privacyMode, async () => {
  if (!geo.coords.value) return
  await refreshNearby()
})

watch(
  () => geo.locationSource.value,
  (source, previousSource) => {
    if (previousSource === 'cached' && source === 'live' && geo.coords.value) {
      updateMap(geo.coords.value)
      void refreshNearby()
    }
  },
)

onMounted(init)
onUnmounted(() => nearbyStore.stopPolling())
</script>

<template>
  <div class="nearby-page">
    <Navbar />

    <div class="nearby-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <section class="page-heading">
          <div class="heading-copy">
            <span class="eyebrow"><MapPin /> Local discovery</span>
            <h1>People near you</h1>
            <p>Find nearby connections while keeping your exact location private.</p>
          </div>
          <div class="live-summary">
            <span class="live-status">
              <span class="live-dot"></span>
              {{ detectedLabel }}
            </span>
            <span>{{ formattedTime }}</span>
          </div>
        </section>

        <LocationFallbackNotice
          v-if="geo.locationSource.value === 'cached'"
          class="location-fallback"
          @refresh="retryLiveLocation"
        />

        <section class="identity-card">
          <div class="identity-left">
            <UserAvatar
              :src="profileImage"
              :username="username"
              :alt="`${displayName} profile photo`"
              class="mini-avatar image-avatar"
            />
            <div>
              <span class="section-label">Your nearby presence</span>
              <strong>{{ displayName }}</strong>
              <span>Posting as @{{ username }}</span>
            </div>
          </div>

          <div class="privacy-control">
            <Lock />
            <div>
              <span>Who can find you</span>
              <select v-model="privacyMode" aria-label="Privacy mode">
                <option>Neighbors Only</option>
                <option>Approximate Distance Only</option>
                <option>Hidden From Search</option>
              </select>
            </div>
          </div>
        </section>

        <section class="control-row" aria-label="Nearby controls">
          <div class="control-group">
            <span class="control-label">Search radius</span>
            <div class="segmented">
              <button
                v-for="option in radiusOptions"
                :key="option"
                type="button"
                :class="{ selected: radius === option }"
                @click="radius = option"
              >
                {{ option }}m
              </button>
            </div>
          </div>

          <div class="control-group align-right">
            <span class="control-label">Sort results</span>
            <div class="segmented compact">
              <button
                type="button"
                :class="{ selected: sortMode === 'latest' }"
                @click="sortMode = 'latest'"
              >
                Nearest
              </button>
              <button
                type="button"
                :class="{ selected: sortMode === 'active' }"
                @click="sortMode = 'active'"
              >
                Farthest
              </button>
            </div>
          </div>
        </section>

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

        <section v-else class="map-panel" aria-label="Approximate nearby map">
          <div class="map-header">
            <div>
              <span class="section-label">Approximate map</span>
              <strong>{{ radius }}m around your location</strong>
            </div>
            <span class="privacy-badge"><ShieldCheck /> Exact position hidden</span>
          </div>
          <div ref="mapElement" id="nearby-map" class="map-canvas"></div>
          <div class="map-caption">
            <MapPin />
            <span>People markers are offset to protect everyone's precise location.</span>
          </div>
        </section>

        <section class="status-grid">
          <article class="status-card">
            <SlidersHorizontal />
            <div>
              <strong>Visibility Radius</strong>
              <span>Posts and users are filtered to {{ radius }}m.</span>
            </div>
          </article>
          <article class="status-card">
            <ShieldCheck />
            <div>
              <strong>Location Privacy</strong>
              <span>Exact location is hidden; only approximate distance is shown.</span>
            </div>
          </article>
          <article class="status-card">
            <Flag />
            <div>
              <strong>Moderation</strong>
              <span>Report and block controls are available for unsafe behavior.</span>
            </div>
          </article>
          <article class="status-card">
            <MessageCircle />
            <div>
              <strong>Notifications</strong>
              <span>Replies and nearby posts can trigger alerts.</span>
            </div>
          </article>
        </section>

        <section class="nearby-list">
          <div class="list-header">
            <div>
              <span class="section-label">Your local circle</span>
              <h2>Nearby people</h2>
            </div>
            <span v-if="nearbyStore.loading" class="refreshing">
              <span class="loading-dot"></span>
              Refreshing
            </span>
            <span v-else>{{ filteredUsers.length }} within {{ radius }}m</span>
          </div>

          <p v-if="nearbyStore.error" class="empty-state error-state">
            {{ nearbyStore.error }}
          </p>

          <div v-else-if="filteredUsers.length > 0" class="people-list">
            <article v-for="user in filteredUsers" :key="user.id" class="person-row">
              <div class="person-avatar">{{ user.username.slice(0, 2).toUpperCase() }}</div>
              <div class="person-details">
                <strong>{{ user.username }}</strong>
                <span><MapPin /> {{ userDistance(user) }}</span>
              </div>
              <div class="person-actions">
                <RouterLink :to="{ path: '/chat', query: { userId: user.id } }">
                  <MessageCircle />
                  Message
                </RouterLink>
                <button type="button" aria-label="Report nearby user">
                  <Flag />
                  Report
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <span class="empty-icon"><UserRound /></span>
            <strong>No one nearby just yet</strong>
            <p>
              There are no users inside {{ radius }}m. Try a wider radius while we keep your exact
              location private.
            </p>
          </div>
        </section>
      </main>
    </div>
    <MobileBottomNav />
  </div>
</template>

<style scoped>
.nearby-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1e3a4b;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.nearby-shell {
  display: flex;
  min-width: 0;
  width: 100%;
}

.page-heading p,
.status-card span,
.person-row span,
.list-header span {
  color: #71879a;
  font-size: 0.8rem;
}

.privacy-control svg,
.status-card svg,
.person-actions svg,
.person-details svg,
.map-caption svg,
.privacy-badge svg,
.eyebrow svg {
  width: 16px;
  height: 16px;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 30px clamp(18px, 2.5vw, 38px) 64px;
}

.page-heading,
.identity-card,
.control-row,
.list-header,
.person-row,
.identity-left,
.privacy-control,
.status-card,
.live-status,
.privacy-badge,
.map-caption,
.refreshing {
  display: flex;
  align-items: center;
}

.page-heading {
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.location-fallback {
  margin-bottom: 18px;
}

.heading-copy {
  max-width: 650px;
}

.eyebrow,
.section-label,
.control-label {
  color: #27828d;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 3vw, 2.65rem);
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.page-heading p {
  margin: 10px 0 0;
  max-width: 540px;
  color: #718096;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.6;
}

.live-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  color: #8295a5;
  font-size: 0.74rem;
  font-weight: 650;
}

.live-status {
  gap: 8px;
  border: 1px solid #d5ebe9;
  border-radius: 999px;
  background: #f0faf8;
  color: #236c70;
  padding: 8px 13px;
  font-size: 0.76rem;
  font-weight: 800;
}

.live-dot,
.loading-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22a987;
  box-shadow: 0 0 0 4px rgba(34, 169, 135, 0.12);
}

.identity-card {
  justify-content: space-between;
  gap: 18px;
  background: #fff;
  border: 1px solid #e1eaf1;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(42, 67, 83, 0.055);
  margin-bottom: 18px;
}

.identity-left {
  gap: 14px;
}

.identity-left div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.identity-left strong {
  color: #18394a;
  font-size: 0.95rem;
}

.identity-left span:not(.section-label) {
  color: #8294a3;
  font-size: 0.78rem;
}

.mini-avatar,
.person-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dff3f3;
  color: #1a6973;
  font-weight: 800;
}

.mini-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.image-avatar {
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow:
    0 0 0 1px #dce9ee,
    0 7px 18px rgba(15, 45, 70, 0.12);
}

.privacy-control {
  gap: 10px;
  min-width: 230px;
  border: 1px solid #dfebef;
  border-radius: 13px;
  background: #f7fafb;
  padding: 10px 13px;
  color: #287781;
}

.privacy-control > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.privacy-control span {
  color: #8294a3;
  font-size: 0.66rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.privacy-control select {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #244a5c;
  font-weight: 750;
  font-size: 0.8rem;
}

.control-row {
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 22px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group.align-right {
  align-items: flex-end;
}

.segmented {
  display: inline-flex;
  gap: 4px;
  border: 1px solid #dfe8ef;
  border-radius: 13px;
  background: #edf3f7;
  padding: 4px;
}

.segmented button {
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #647b8e;
  padding: 8px 15px;
  font-weight: 750;
  font-size: 0.79rem;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.segmented button.selected {
  background: #fff;
  color: #176171;
  box-shadow: 0 3px 10px rgba(38, 68, 88, 0.1);
}

.map-panel {
  position: relative;
  z-index: 0;
  isolation: isolate;
  width: 100%;
  margin: 0 auto 22px;
  overflow: hidden;
  border: 1px solid #dde7ee;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(38, 65, 82, 0.07);
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.map-header > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-header strong {
  color: #18394a;
  font-size: 0.92rem;
}

.privacy-badge {
  gap: 6px;
  border-radius: 999px;
  background: #edf8f6;
  color: #26747a;
  padding: 7px 11px;
  font-size: 0.72rem;
  font-weight: 750;
}

.map-canvas {
  position: relative;
  z-index: 0;
  width: 100%;
  min-height: 360px;
  height: min(46vw, 450px);
  overflow: hidden;
  border-block: 1px solid #e1e9ee;
  background: #edf0e6;
}

.leaflet-container {
  width: 100%;
  height: 100%;
  z-index: 0;
}

.map-caption {
  gap: 8px;
  padding: 12px 18px;
  color: #71879a;
  font-size: 0.76rem;
  font-weight: 600;
}

.map-caption svg {
  flex: 0 0 auto;
  color: #35838c;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.status-card {
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #e1eaf1;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 7px 20px rgba(42, 67, 83, 0.035);
}

.status-card svg {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: #edf8f7;
  color: #247682;
  padding: 8px;
  margin-top: 0;
}

.status-card strong {
  color: #254558;
  font-size: 0.82rem;
}

.status-card span {
  line-height: 1.5;
}

.status-card div,
.person-details {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nearby-list {
  background: #fff;
  border: 1px solid #e1eaf1;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 28px rgba(42, 67, 83, 0.045);
}

.list-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.list-header > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-header h2 {
  margin: 0;
  color: #17384a;
  font-size: 1.12rem;
  letter-spacing: -0.01em;
}

.list-header .section-label {
  color: #27828d;
  font-size: 0.7rem;
}

.refreshing {
  gap: 8px;
  color: #287781 !important;
  font-weight: 750;
}

.loading-dot {
  animation: loading-pulse 1.2s ease-in-out infinite;
}

@keyframes loading-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.8);
  }
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.person-row {
  gap: 13px;
  border: 1px solid transparent;
  border-radius: 15px;
  background: #f7fafc;
  padding: 13px 14px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.person-row:hover {
  transform: translateY(-1px);
  border-color: #dce9ee;
  background: #fbfdfd;
}

.person-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border: 2px solid #fff;
  border-radius: 13px;
  background: linear-gradient(145deg, #d9f0ef, #e9f4fa);
  color: #266b75;
  box-shadow: 0 0 0 1px #dce9ee;
  font-size: 0.75rem;
}

.person-details strong {
  color: #244558;
  font-size: 0.88rem;
}

.person-details span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.person-details svg {
  width: 12px;
  height: 12px;
  color: #4c9097;
}

.person-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.person-actions a,
.person-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d7e4eb;
  border-radius: 10px;
  background: #fff;
  color: #31576b;
  padding: 8px 11px;
  text-decoration: none;
  font-weight: 750;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease;
}

.person-actions a:hover {
  border-color: #9fd2d3;
  background: #eef9f8;
  color: #176d72;
}

.person-actions button:hover {
  border-color: #f0c6c6;
  background: #fff5f5;
  color: #b64b4b;
}

.segmented button:focus-visible,
.person-actions a:focus-visible,
.person-actions button:focus-visible,
.privacy-control select:focus-visible {
  outline: 3px solid rgba(39, 130, 141, 0.22);
  outline-offset: 2px;
}

.empty-state {
  display: flex;
  min-height: 220px;
  margin: 0;
  padding: 30px 16px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  color: #7891a5;
}

.empty-state strong {
  margin-top: 12px;
  color: #315064;
  font-size: 0.95rem;
}

.empty-state p {
  max-width: 420px;
  margin: 7px 0 0;
  font-size: 0.82rem;
  line-height: 1.6;
}

.empty-icon {
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: #edf7f7;
  color: #39818a;
}

.empty-icon svg {
  width: 22px;
  height: 22px;
}

.error-state {
  min-height: auto;
  color: #c94f4f;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .workspace {
    padding-inline: 18px;
  }

  .page-heading {
    gap: 18px;
  }

  .identity-card {
    padding: 16px 18px;
  }

  .map-canvas {
    height: min(52vw, 430px);
  }
}

@media (max-width: 767px) {
  .nearby-page {
    padding-bottom: calc(84px + env(safe-area-inset-bottom));
  }

  .workspace {
    padding: 20px 14px 30px;
  }

  .page-heading,
  .identity-card,
  .control-row,
  .person-row {
    align-items: stretch;
    flex-direction: column;
  }

  .page-heading {
    gap: 16px;
    margin-bottom: 18px;
  }

  .heading-copy {
    max-width: none;
  }

  .eyebrow {
    margin-bottom: 8px;
    font-size: 0.65rem;
  }

  .page-heading h1 {
    font-size: clamp(1.85rem, 9vw, 2.25rem);
    line-height: 1.08;
  }

  .page-heading p {
    margin-top: 8px;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .live-summary {
    width: 100%;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
    border-top: 1px solid #e2eaf0;
    padding-top: 12px;
  }

  .live-summary > span:last-child {
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .live-status {
    padding: 7px 11px;
    font-size: 0.7rem;
  }

  .identity-card {
    gap: 15px;
    margin-bottom: 16px;
    border-radius: 16px;
    padding: 15px;
  }

  .identity-left {
    gap: 12px;
  }

  .mini-avatar {
    width: 42px;
    height: 42px;
  }

  .privacy-control,
  .segmented,
  .person-actions {
    width: 100%;
  }

  .privacy-control {
    min-width: 0;
  }

  .control-row {
    gap: 14px;
    margin-bottom: 18px;
    border: 1px solid #e1eaf1;
    border-radius: 16px;
    background: #fff;
    padding: 14px;
    box-shadow: 0 7px 20px rgba(42, 67, 83, 0.035);
  }

  .control-group,
  .control-group.align-right {
    width: 100%;
    align-items: stretch;
  }

  .control-label {
    font-size: 0.65rem;
  }

  .segmented button {
    flex: 1;
    padding: 9px 8px;
  }

  .map-panel {
    margin-bottom: 16px;
    border-radius: 17px;
  }

  .map-header {
    align-items: flex-start;
    padding: 14px 15px;
  }

  .map-header strong {
    font-size: 0.86rem;
  }

  .privacy-badge {
    padding: 6px 9px;
    font-size: 0.66rem;
  }

  .map-canvas {
    min-height: 300px;
    height: 46vh;
    max-height: 380px;
  }

  .map-caption {
    align-items: flex-start;
    padding: 11px 14px;
    font-size: 0.7rem;
    line-height: 1.45;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 9px;
    margin-bottom: 16px;
  }

  .status-card {
    align-items: center;
    padding: 13px 14px;
  }

  .status-card svg {
    width: 32px;
    height: 32px;
  }

  .nearby-list {
    border-radius: 17px;
    padding: 15px;
  }

  .list-header {
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 13px;
  }

  .list-header > span {
    text-align: right;
    white-space: nowrap;
  }

  .person-row {
    gap: 11px;
    padding: 12px;
  }

  .person-actions {
    margin-left: 0;
  }

  .person-actions a,
  .person-actions button {
    justify-content: center;
    flex: 1;
  }

  .empty-state {
    min-height: 190px;
    padding-inline: 8px;
  }
}

@media (max-width: 420px) {
  .workspace {
    padding-inline: 12px;
  }

  .live-summary {
    gap: 8px;
  }

  .live-summary > span:last-child {
    font-size: 0.67rem;
  }

  .map-header {
    flex-direction: column;
    gap: 10px;
  }

  .privacy-badge {
    align-self: flex-start;
  }

  .map-canvas {
    min-height: 270px;
    height: 40vh;
    max-height: 340px;
  }

  .list-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .list-header > span {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-dot,
  .person-row {
    animation: none;
    transition: none;
  }
}
</style>
