<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Flag, Lock, MapPin, MessageCircle, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-vue-next'
import { useNearbyStore, type NearbyUser } from '@/stores/nearbyStore'
import { useGeolocation } from '@/composables/useGeolocation'
import { useAuthStore } from '@/stores/auth'
import GeoErrorState from '@/components/GeoErrorState.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Navbar from '@/components/Navbar.vue'

const nearbyStore = useNearbyStore()
const auth = useAuthStore()
const geo = useGeolocation()

const radius = ref(100)
const sortMode = ref<'latest' | 'active'>('latest')
const privacyMode = ref('Neighbors Only')

const radiusOptions = [50, 100, 200]
const mapPins = [
  { id: 'northwest', left: '18%', top: '18%', color: 'green' },
  { id: 'west', left: '32%', top: '55%', color: 'blue' },
  { id: 'northeast', left: '59%', top: '28%', color: 'pink' },
  { id: 'southeast', left: '72%', top: '82%', color: 'orange' },
]

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
const profileImage = computed(
  () => `https://i.pravatar.cc/150?u=${encodeURIComponent(username.value)}`,
)

function approximateDistance(meters: number) {
  if (meters <= 50) return 'within 50m'
  if (meters <= 100) return 'within 100m'
  if (meters <= 200) return 'within 200m'
  return 'outside radius'
}

function userDistance(user: NearbyUser) {
  return user.distance_label ?? approximateDistance(user.distance_m)
}

function pinForUser(user: NearbyUser, index: number) {
  const pin = mapPins[index % mapPins.length]
  return {
    ...pin,
    id: user.id,
    label: user.username.slice(0, 1).toUpperCase(),
  }
}

async function init() {
  await geo.request()
}

async function refreshNearby() {
  const position = geo.coords.value
  if (!position) return
  await nearbyStore.fetchNearby(position.lat, position.lng, radius.value)
  nearbyStore.startPolling(position.lat, position.lng, radius.value)
}

onMounted(init)
onUnmounted(() => nearbyStore.stopPolling())

watch(radius, refreshNearby)
watch(() => geo.coords.value, refreshNearby)
</script>

<template>
  <div class="nearby-page">
    <Navbar />

    <div class="nearby-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">

      <section class="page-heading">
        <div>
          <h1>Nearby Users</h1>
          <p>{{ formattedTime }}</p>
        </div>
        <span class="detected-pill">{{ detectedLabel }}</span>
      </section>

      <section class="identity-card">
        <div class="identity-left">
          <img
            :src="profileImage"
            :alt="`${displayName} profile photo`"
            class="mini-avatar image-avatar"
          />
          <div>
            <strong>{{ displayName }}</strong>
            <span>Posting as @{{ username }}</span>
          </div>
        </div>

        <div class="privacy-control">
          <Lock />
          <select v-model="privacyMode" aria-label="Privacy mode">
            <option>Neighbors Only</option>
            <option>Approximate Distance Only</option>
            <option>Hidden From Search</option>
          </select>
        </div>
      </section>

      <section class="control-row" aria-label="Nearby controls">
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

        <div class="segmented compact">
          <button
            type="button"
            :class="{ selected: sortMode === 'latest' }"
            @click="sortMode = 'latest'"
          >
            Latest
          </button>
          <button
            type="button"
            :class="{ selected: sortMode === 'active' }"
            @click="sortMode = 'active'"
          >
            Active
          </button>
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
        <div class="map-canvas">
          <div class="map-grid"></div>
          <div class="river"></div>
          <div class="road road-a"></div>
          <div class="road road-b"></div>
          <div class="road road-c"></div>
          <div class="privacy-radius" :style="{ '--radius-size': `${radius * 1.15}px` }">
            <span></span>
          </div>
          <div class="self-pin">
            <MapPin />
          </div>

          <template v-if="filteredUsers.length > 0">
            <button
              v-for="(user, index) in filteredUsers.slice(0, 4)"
              :key="user.id"
              type="button"
              class="user-pin"
              :class="pinForUser(user, index).color"
              :style="{ left: pinForUser(user, index).left, top: pinForUser(user, index).top }"
              :title="`${user.username}, ${userDistance(user)}`"
            >
              <UserRound />
            </button>
          </template>
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
          <h2>Nearby People</h2>
          <span v-if="nearbyStore.loading">Refreshing...</span>
        </div>

        <p v-if="nearbyStore.error" class="empty-state error-state">
          {{ nearbyStore.error }}
        </p>

        <div v-else-if="filteredUsers.length > 0" class="people-list">
          <article v-for="user in filteredUsers" :key="user.id" class="person-row">
            <div class="person-avatar">{{ user.username.slice(0, 2).toUpperCase() }}</div>
            <div>
              <strong>{{ user.username }}</strong>
              <span>{{ userDistance(user) }}</span>
            </div>
            <div class="person-actions">
              <RouterLink :to="{ path: '/chat', query: { userId: user.id } }">Message</RouterLink>
              <button type="button">Report</button>
            </div>
          </article>
        </div>

        <p v-else class="empty-state">
          No nearby users inside {{ radius }}m yet. The map keeps your exact location private.
        </p>
      </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.nearby-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #16374c;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.nearby-shell {
  display: flex;
  min-width: 0;
}

.page-heading p,
.identity-left span,
.status-card span,
.person-row span,
.list-header span {
  color: #7891a5;
  font-size: 0.78rem;
}

.privacy-control svg,
.status-card svg {
  width: 16px;
  height: 16px;
}

.workspace {
  min-width: 0;
  flex: 1;
  padding: 24px clamp(16px, 2vw, 30px) 56px;
}

.page-heading,
.identity-card,
.control-row,
.list-header,
.person-row,
.identity-left,
.privacy-control,
.status-card {
  display: flex;
  align-items: center;
}

.page-heading {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.875rem, 2.6vw, 2.25rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.detected-pill {
  border-radius: 999px;
  background: #bce8f5;
  color: #14546f;
  padding: 6px 18px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.identity-card {
  justify-content: space-between;
  gap: 18px;
  background: #fff;
  border: 1px solid #e6edf4;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 12px 28px rgba(35, 65, 85, 0.05);
  margin-bottom: 16px;
}

.identity-left {
  gap: 12px;
}

.identity-left div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.image-avatar {
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 6px 16px rgba(15, 45, 70, 0.12);
}

.privacy-control {
  gap: 8px;
  border-radius: 10px;
  background: #f5f7fa;
  padding: 9px 12px;
  color: #41576a;
}

.privacy-control select {
  border: 0;
  outline: 0;
  background: transparent;
  color: #32495c;
  font-weight: 700;
  font-size: 0.78rem;
}

.control-row {
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.segmented {
  display: inline-flex;
  gap: 6px;
  border-radius: 12px;
  background: #e9f0f6;
  padding: 5px;
}

.segmented button {
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #577085;
  padding: 8px 14px;
  font-weight: 800;
  font-size: 0.78rem;
  cursor: pointer;
}

.segmented button.selected {
  background: #fff;
  color: #164b66;
  box-shadow: 0 8px 18px rgba(38, 68, 88, 0.08);
}

.map-panel {
  display: flex;
  justify-content: center;
  margin: 10px 0 26px;
}

.map-canvas {
  position: relative;
  width: min(680px, 100%);
  aspect-ratio: 1.5;
  overflow: hidden;
  border: 3px solid #202020;
  background:
    linear-gradient(35deg, transparent 0 68%, rgba(174, 224, 244, 0.82) 68% 76%, transparent 76%),
    #edf0e6;
}

.map-grid {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    linear-gradient(32deg, transparent 46%, rgba(219, 205, 148, 0.78) 47% 50%, transparent 51%),
    linear-gradient(102deg, transparent 44%, rgba(226, 226, 214, 0.92) 45% 48%, transparent 49%),
    repeating-linear-gradient(8deg, rgba(138, 169, 120, 0.18) 0 3px, transparent 3px 24px),
    repeating-linear-gradient(96deg, rgba(194, 186, 164, 0.22) 0 2px, transparent 2px 34px);
}

.river {
  position: absolute;
  left: -12%;
  bottom: -18%;
  width: 46%;
  height: 58%;
  transform: rotate(-26deg);
  background: rgba(132, 207, 231, 0.85);
}

.road {
  position: absolute;
  border-radius: 999px;
  background: rgba(237, 224, 164, 0.85);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.75);
}

.road-a {
  width: 82%;
  height: 12px;
  top: 56%;
  left: 5%;
  transform: rotate(-29deg);
}

.road-b {
  width: 62%;
  height: 10px;
  top: 20%;
  left: 28%;
  transform: rotate(62deg);
}

.road-c {
  width: 50%;
  height: 8px;
  top: 78%;
  left: 38%;
  transform: rotate(-8deg);
}

.privacy-radius {
  --radius-size: 115px;
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--radius-size);
  height: var(--radius-size);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: rgba(75, 133, 239, 0.42);
  border: 4px solid rgba(75, 133, 239, 0.76);
}

.privacy-radius span,
.self-pin {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.privacy-radius span {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #3573e8;
}

.self-pin {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #114fbd;
}

.self-pin svg {
  width: 20px;
  height: 20px;
}

.user-pin {
  position: absolute;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #111;
  border-radius: 999px;
  color: #000;
  cursor: pointer;
}

.user-pin svg {
  width: 24px;
  height: 24px;
}

.user-pin.green {
  background: #cdebbd;
}

.user-pin.blue {
  background: #bcd2ff;
}

.user-pin.pink {
  background: #e8bdd8;
}

.user-pin.orange {
  background: #ffd49a;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.status-card {
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border: 1px solid #e6edf4;
  border-radius: 14px;
  padding: 14px;
}

.status-card svg {
  color: #1a6b84;
  flex: 0 0 auto;
  margin-top: 2px;
}

.status-card div,
.person-row div:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nearby-list {
  background: #fff;
  border: 1px solid #e6edf4;
  border-radius: 16px;
  padding: 16px;
}

.list-header {
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-header h2 {
  margin: 0;
  font-size: 1rem;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.person-row {
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fbff;
}

.person-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-size: 0.74rem;
}

.person-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.person-actions a,
.person-actions button {
  border: 1px solid #d9e5ee;
  border-radius: 999px;
  background: #fff;
  color: #244d64;
  padding: 7px 12px;
  text-decoration: none;
  font-weight: 750;
  font-size: 0.76rem;
  cursor: pointer;
}

.empty-state {
  margin: 0;
  padding: 26px 12px;
  text-align: center;
  color: #7891a5;
}

.error-state {
  color: #dc2626;
  font-weight: 700;
}

@media (max-width: 980px) {
  .workspace {
    padding-inline: 18px;
  }

  .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .topbar,
  .identity-card,
  .control-row,
  .page-heading,
  .person-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box,
  .segmented,
  .privacy-control,
  .person-actions {
    width: 100%;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .person-actions {
    margin-left: 0;
  }
}
</style>
