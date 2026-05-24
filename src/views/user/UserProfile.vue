<template>
  <div class="profile-page">
    <Navbar />

    <div class="profile-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <p v-if="loading" class="state-card">Loading profile...</p>
        <p v-else-if="error" class="state-card error-state">{{ error }}</p>

        <section v-else class="profile-header">
          <div class="cover-map">
            <div class="map-grid"></div>
            <div class="signal-ring"></div>
          </div>

          <div class="profile-summary">
            <div class="avatar-wrap">
              <img
                :src="profileImage"
                :alt="`${displayName} profile photo`"
                class="avatar"
              />
              <span class="status-dot" />
            </div>

            <div class="summary-copy">
              <p class="eyebrow">Verified neighbor</p>
              <h1>{{ displayName }}</h1>
              <p class="handle">@{{ username }}</p>
              <p class="bio">{{ bio }}</p>

              <div class="meta-row">
                <span>
                  <MapPin class="icon" />
                  Oak Ridge Commons
                </span>
                <span>
                  <ShieldCheck class="icon" />
                  Approximate radius only
                </span>
              </div>
            </div>

            <div class="actions">
              <RouterLink v-if="isOwnProfile" to="/profile/edit" class="secondary-action">Edit profile</RouterLink>
              <UserOptionsMenu v-else :user-id="profileUserId" />
              <RouterLink v-if="isOwnProfile" to="/create-post" class="primary-action">
                <Plus class="icon" />
                Create post
              </RouterLink>
            </div>
          </div>
        </section>

        <section v-if="!loading && !error" class="stats-grid" aria-label="Profile stats">
          <article v-for="stat in stats" :key="stat.label" class="stat-card">
            <component :is="stat.icon" class="stat-icon" />
            <div>
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </article>
        </section>

        <div v-if="!loading && !error" class="content-grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">About</p>
                <h2>Community profile</h2>
              </div>
            </div>

            <p class="panel-text">{{ bio }}</p>

            <div class="tag-row">
              <span v-for="tag in tags" :key="tag">{{ tag }}</span>
            </div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Activity</p>
                <h2>Recent posts</h2>
              </div>
              <RouterLink to="/discussions">View all</RouterLink>
            </div>

            <div class="activity-list">
              <article v-for="post in recentPosts" :key="post.title" class="activity-item">
                <div class="activity-icon">
                  <MessageSquare class="icon" />
                </div>
                <div>
                  <strong>{{ post.title }}</strong>
                  <span>{{ post.meta }}</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ClipboardList,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import UserOptionsMenu from '@/components/UserOptionsMenu.vue'
import { userApi, type UserProfile } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const profile = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref('')

const routeUserId = computed(() => Number(route.params.userId))
const authUserId = computed(() => auth.user?.userId ?? auth.user?.user_id ?? null)
const isPublicProfile = computed(() => Number.isInteger(routeUserId.value) && routeUserId.value > 0)
const isOwnProfile = computed(() => !isPublicProfile.value || routeUserId.value === authUserId.value)
const profileUserId = computed(() => profile.value?.userId ?? profile.value?.user_id ?? routeUserId.value)
const username = computed(() => profile.value?.username ?? auth.user?.username ?? 'neighbor')
const displayName = computed(() =>
  username.value
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Nearme Neighbor',
)
const profileImage = computed(
  () => profile.value?.profile_image || `https://i.pravatar.cc/150?u=${encodeURIComponent(username.value)}`,
)

const bio = computed(
  () =>
    profile.value?.bio ||
    'Sharing useful local updates, nearby questions, and quick notices for neighbors in the commons.',
)

const tags = ['Local updates', 'Safety aware', 'Community helper']

const stats = [
  { label: 'Posts', value: 'Live', icon: ClipboardList },
  { label: 'Neighbors', value: 'Nearby', icon: Users },
  { label: 'Helpful actions', value: 'Active', icon: Heart },
]

const recentPosts = [
  {
    title: 'Neighborhood updates',
    meta: 'Your posts now load from the backend in My Posts.',
  },
  {
    title: 'Nearby visibility',
    meta: 'Location is protected with approximate distance only.',
  },
  {
    title: 'Private chat ready',
    meta: 'Message neighbors from the shared navigation.',
  },
]

async function loadProfile() {
  loading.value = true
  error.value = ''

  try {
    profile.value = isPublicProfile.value
      ? await userApi.getById(routeUserId.value)
      : await userApi.getProfile()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load profile.'
    profile.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
watch(() => route.params.userId, loadProfile)
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f4054;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.profile-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 24px clamp(16px, 3vw, 32px) 40px;
}

.state-card {
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  color: #587083;
  font-size: 0.92rem;
  font-weight: 800;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
}

.error-state {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.profile-header,
.panel,
.stat-card {
  border: 1px solid #e3ebf2;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
}

.profile-header {
  overflow: hidden;
  border-radius: 18px;
}

.cover-map {
  position: relative;
  height: 170px;
  overflow: hidden;
  background: #dfeaf0;
}

.map-grid {
  position: absolute;
  inset: 0;
  opacity: 0.72;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.78) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.78) 1px, transparent 1px);
  background-size: 34px 34px;
}

.signal-ring {
  position: absolute;
  left: 50%;
  top: 54%;
  width: 118px;
  height: 118px;
  transform: translate(-50%, -50%);
  border: 1px solid #50b6cc;
  border-radius: 999px;
  background: rgba(80, 182, 204, 0.14);
  box-shadow: 0 0 0 20px rgba(80, 182, 204, 0.08);
}

.profile-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
  padding: 24px 24px 24px;
}

.avatar-wrap {
  position: relative;
  margin-top: 0;
  align-self: start;
}

.avatar {
  width: 104px;
  height: 104px;
  border: 4px solid #fff;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: 0 14px 28px rgba(15, 45, 70, 0.16);
}

.status-dot {
  position: absolute;
  right: 9px;
  bottom: 9px;
  width: 16px;
  height: 16px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: #0f8a7c;
}

.summary-copy {
  min-width: 0;
  padding-top: 0;
}

.eyebrow {
  margin: 0;
  color: #0e6378;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: #17364a;
  letter-spacing: 0;
}

h1 {
  margin-top: 4px;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 850;
}

h2 {
  margin-top: 4px;
  font-size: 1.05rem;
  font-weight: 850;
}

.handle {
  margin: 4px 0 0;
  color: #7990a2;
  font-size: 0.86rem;
  font-weight: 700;
}

.bio,
.panel-text {
  color: #5d7285;
  line-height: 1.65;
}

.bio {
  max-width: 760px;
  margin: 12px 0 0;
  font-size: 0.92rem;
}

.meta-row,
.actions,
.tag-row,
.panel-header,
.activity-item,
.stat-card {
  display: flex;
  align-items: center;
}

.meta-row {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.meta-row span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #f0f5f8;
  padding: 7px 10px;
  color: #4f687d;
  font-size: 0.78rem;
  font-weight: 800;
}

.actions {
  gap: 10px;
  align-self: center;
}

.primary-action,
.secondary-action,
.panel-header a {
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 850;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0f8a7c;
  color: #fff;
  padding: 10px 14px;
  box-shadow: 0 12px 22px rgba(15, 138, 124, 0.18);
}

.secondary-action,
.panel-header a {
  border: 1px solid #dce7ee;
  background: #f8fbff;
  color: #4f687d;
  padding: 10px 14px;
}

.icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.stat-card {
  gap: 12px;
  border-radius: 14px;
  padding: 16px;
}

.stat-icon {
  width: 20px;
  height: 20px;
  color: #0f8a7c;
}

.stat-card strong {
  display: block;
  color: #17364a;
  font-size: 1.3rem;
  font-weight: 900;
}

.stat-card span,
.activity-item span {
  color: #7890a2;
  font-size: 0.78rem;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
  gap: 16px;
  margin-top: 16px;
}

.panel {
  border-radius: 18px;
  padding: 20px;
}

.panel-header {
  justify-content: space-between;
  gap: 12px;
}

.panel-text {
  margin: 16px 0 0;
  font-size: 0.9rem;
}

.tag-row {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-row span {
  border-radius: 999px;
  background: #e8f7f4;
  padding: 7px 10px;
  color: #0f766e;
  font-size: 0.76rem;
  font-weight: 850;
}

.activity-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.activity-item {
  gap: 12px;
  border-radius: 14px;
  background: #f8fbff;
  padding: 12px;
}

.activity-icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e0f4f8;
  color: #0e6378;
}

.activity-item strong {
  display: block;
  color: #263f52;
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .profile-summary,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .profile-summary {
    align-items: start;
  }

  .actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .workspace {
    padding: 16px 12px 32px;
  }

  .profile-summary {
    padding: 0 16px 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
