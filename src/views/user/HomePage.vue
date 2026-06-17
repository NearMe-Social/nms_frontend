<template>
  <div class="min-h-screen bg-[#f4f7fb]">
    <Navbar />
    <div class="flex w-full gap-4 xl:gap-6">
      <AppSidebar class="hidden md:flex" />

      <main class="flex-1 flex flex-col gap-4 min-w-0 px-4 py-5 md:px-6">
        <!-- Header -->
        <div class="flex flex-wrap items-end justify-between gap-3 animate-fade-down">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Nearby Feed
            </h1>
            <p class="mt-1 text-sm text-slate-400 font-medium">
              See what's happening <span class="text-teal-500 font-semibold">right now</span> in
              your immediate circle.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ease-in-out"
                :class="
                  sortMode === 'latest'
                    ? 'bg-gray-800 text-white scale-105 shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:scale-105'
                "
                @click="setSort('latest')"
              >
                Latest
              </button>
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ease-in-out"
                :class="
                  sortMode === 'active'
                    ? 'bg-gray-800 text-white scale-105 shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:scale-105'
                "
                @click="setSort('active')"
              >
                Most Active
              </button>
            </div>
            <RouterLink
              to="/create-post"
              class="hidden md:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl no-underline transition-all duration-200 shadow-sm shadow-teal-200 hover:shadow-teal-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus class="w-3.5 h-3.5" /> Create Post
            </RouterLink>
          </div>
        </div>

        <LocationFallbackNotice
          v-if="geo.locationSource.value === 'cached' || geo.locationSource.value === 'account'"
          @refresh="retryLocation"
        />

        <!-- LOCATION LOADING STATE -->
        <div
          v-if="
            loading &&
            posts.length === 0 &&
            (geo.status.value === 'idle' || geo.status.value === 'requesting')
          "
          class="home-location-card animate-fade-up"
          aria-live="polite"
        >
          <div class="home-location-icon">
            <MapPin class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <p class="text-[0.68rem] font-black uppercase tracking-[0.16em] text-teal-700">
              Finding your area
            </p>
            <h2 class="mt-1 text-lg font-black tracking-tight text-slate-800">
              Preparing your nearby feed
            </h2>
            <p class="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-400">
              Nearme is checking your current area so only posts inside their visibility radius
              appear here.
            </p>
          </div>
          <div class="home-loading-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- LOADING SKELETON -->
        <div v-else-if="loading" class="flex flex-col gap-4 animate-fade-up">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-white rounded-[18px] p-5 flex flex-col gap-4 shadow-sm ring-1 ring-slate-200/70 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full bg-gray-200 shrink-0"></div>
              <div class="flex-1 flex flex-col gap-2">
                <div class="h-3 bg-gray-200 rounded-full w-1/4"></div>
                <div class="h-2.5 bg-gray-100 rounded-full w-1/3"></div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="h-3 bg-gray-200 rounded-full w-1/3"></div>
              <div class="h-3 bg-gray-100 rounded-full w-full"></div>
              <div class="h-3 bg-gray-100 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- LOCATION PERMISSION STATE -->
        <div
          v-else-if="geo.status.value === 'denied'"
          class="home-error-card animate-fade-up"
        >
          <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-[0_0_0_8px_rgba(244,63,94,0.04)]">
            <AlertCircle class="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p class="text-[0.68rem] font-black uppercase tracking-[0.16em] text-rose-500">
              Location needed
            </p>
            <p class="mt-2 text-sm font-bold leading-6 text-rose-600">
              {{
                geo.errorMessage.value ||
                'Location access was denied. Enable it in browser settings.'
              }}
            </p>
          </div>
          <button
            @click="retryLocation"
            class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md hover:shadow-teal-100"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            Try again
          </button>
        </div>

        <!-- ERROR STATE -->
        <div
          v-else-if="error"
          class="home-error-card animate-fade-up"
        >
          <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-[0_0_0_8px_rgba(244,63,94,0.04)]">
            <AlertCircle class="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p class="text-[0.68rem] font-black uppercase tracking-[0.16em] text-rose-500">
              Feed paused
            </p>
            <p class="mt-2 text-sm font-bold leading-6 text-rose-600">{{ error }}</p>
          </div>
          <button
            @click="retryLocation"
            class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md hover:shadow-teal-100"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            Try again
          </button>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else-if="posts.length === 0"
          class="home-empty-card animate-fade-up"
        >
          <div class="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
            <MapPin class="w-7 h-7 text-teal-500" />
          </div>
          <div>
            <p class="text-[0.68rem] font-black uppercase tracking-[0.16em] text-teal-700">
              Nothing in range yet
            </p>
            <p class="mt-2 text-base font-black text-gray-700">No posts nearby</p>
            <p class="text-sm text-gray-400 mt-1 font-medium leading-6">
              Be the first to share something useful with people around your current area.
            </p>
          </div>
          <RouterLink
            to="/create-post"
            class="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl no-underline hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <Plus class="w-4 h-4" /> Create Post
          </RouterLink>
        </div>

        <!-- POSTS -->
        <TransitionGroup v-else name="post" tag="section" class="feed-post-list flex flex-col gap-4">
          <div
            v-for="post in posts"
            :key="post.post_id"
            class="bg-white rounded-[18px] p-5 md:p-6 flex flex-col gap-4 shadow-sm ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-1 hover:ring-teal-200 transition-all duration-300 ease-in-out cursor-pointer group"
            @click="navigateToPost(post.post_id)"
            @keydown.enter="navigateToPost(post.post_id)"
            role="link"
            tabindex="0"
          >
            <!-- Post header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <RouterLink :to="profileRoute(post.user?.user_id)" class="shrink-0" @click.stop>
                  <UserAvatar
                    :src="post.user?.profile_image"
                    :username="post.user?.username || 'Neighbor'"
                    :alt="`${post.user?.username || 'Neighbor'} profile`"
                    class="w-10 h-10 md:w-11 md:h-11 rounded-full"
                  />
                </RouterLink>
                <div class="min-w-0">
                  <RouterLink
                    :to="profileRoute(post.user?.user_id)"
                    class="text-sm font-bold text-gray-800 hover:text-teal-700 no-underline transition-colors duration-200"
                    @click.stop
                  >
                    {{ post.user?.username || 'Neighbor' }}
                  </RouterLink>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      class="text-xs bg-teal-50 text-teal-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors duration-200 group-hover:bg-teal-100"
                    >
                      <MapPin class="w-3 h-3" /> {{ post.visibility_radius }}m
                    </span>
                    <span class="text-xs text-gray-400 font-medium">{{
                      timeAgo(post.created_at)
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span
                  v-if="!isExpired(post.expires_at)"
                  class="text-xs bg-orange-50 text-orange-500 font-semibold border border-orange-200 px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-200 hover:bg-orange-100"
                >
                  <Clock class="w-3 h-3" /> {{ timeLeft(post.expires_at) }}
                </span>
                <span
                  v-else
                  class="text-xs bg-gray-100 text-gray-400 font-medium px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <Clock class="w-3 h-3" /> Expired
                </span>
                <PostOptionsMenu
                  :post-id="post.post_id"
                  :user-id="post.user?.user_id"
                  allow-owner-actions
                  @edit="navigateToPostEdit"
                  @deleted="removePostFromFeed"
                  @click.stop
                />
              </div>
            </div>

            <!-- Post content -->
            <div>
              <h2
                class="line-clamp-2 text-base font-black text-gray-900 group-hover:text-teal-700 transition-colors duration-200 leading-snug"
              >
                {{ post.title }}
              </h2>

              <p class="mt-1.5 text-sm text-gray-600 leading-relaxed line-clamp-4 font-medium">
                {{ post.content }}
              </p>
            </div>

            <PostImageViewer
              v-if="postImageUrls(post).length"
              :images="postImageUrls(post)"
              :alt="post.title"
              variant="feed"
            />

            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex gap-1">
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold"
                  :class="{ 'bg-red-50 text-red-500': post.user_reacted }"
                  :disabled="reactingPostId === post.post_id"
                  @click.stop="toggleReaction(post)"
                  :aria-pressed="post.user_reacted ? 'true' : 'false'"
                  aria-label="Like post"
                >
                  <Heart
                    class="w-4 h-4 transition-transform duration-200 hover:scale-110"
                    :class="{ 'fill-current': post.user_reacted }"
                  />
                  <span class="text-xs font-bold">{{ postReactionCount(post) }}</span>
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-teal-50 hover:text-teal-500 hover:scale-105 active:scale-95 transition-all duration-200"
                  @click.stop="navigateToComments(post.post_id)"
                  aria-label="Open comments"
                >
                  <MessageCircle
                    class="w-4 h-4 transition-transform duration-200 hover:scale-110"
                  />
                  <span class="text-xs font-bold">{{
                    post.comments?.length ?? post.comments_count ?? 0
                  }}</span>
                </button>
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
                @click.stop
              >
                <Share2 class="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </main>

      <!-- RIGHT PANEL -->
      <aside
        class="feed-side-panel hidden lg:flex w-56 xl:w-64 shrink-0 flex-col gap-4 py-5 pr-4 md:pr-6 animate-fade-up"
      >
        <div class="flex items-center gap-2">
          <p class="text-xs font-black uppercase tracking-widest text-gray-400">Feed at a glance</p>
        </div>

        <!-- Live posts count -->
        <div
          class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-black text-teal-600 uppercase tracking-wide">Nearby Posts</p>
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600"
            >
              <MapPin class="h-4 w-4" />
            </span>
          </div>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-black text-gray-800">{{ posts.length }}</p>
            <p class="text-xs text-gray-400 mb-1 font-semibold">
              {{ posts.length === 1 ? 'post in range' : 'posts in range' }}
            </p>
          </div>
          <div class="flex items-start gap-2 border-t border-slate-100 pt-3">
            <ShieldCheck class="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
            <p class="text-xs font-medium leading-5 text-slate-400">
              {{
                posts.length
                  ? 'Matched to your current location and each post radius.'
                  : 'No location-matched posts are available yet.'
              }}
            </p>
          </div>
        </div>

        <!-- Active posts count -->
        <div
          class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-black text-orange-500 uppercase tracking-wide">Active Now</p>
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500"
            >
              <Clock class="h-4 w-4" />
            </span>
          </div>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-black text-gray-800">{{ activePosts }}</p>
            <p class="mb-1 text-xs font-semibold text-gray-400">
              {{ activePosts === 1 ? 'post available' : 'posts available' }}
            </p>
          </div>
          <p class="border-t border-slate-100 pt-3 text-xs font-medium leading-5 text-gray-400">
            {{
              activePosts
                ? 'Open these posts before their sharing time expires.'
                : 'New nearby posts will appear here when shared.'
            }}
          </p>
        </div>

        <!-- Community engagement -->
        <div
          class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-black text-blue-500 uppercase tracking-wide">
              Community Activity
            </p>
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500"
            >
              <MessageCircle class="h-4 w-4" />
            </span>
          </div>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-black text-gray-800">{{ totalInteractions }}</p>
            <p class="mb-1 text-xs font-semibold text-gray-400">interactions</p>
          </div>
          <div class="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Heart class="h-3.5 w-3.5 text-rose-400" />
              {{ totalReactions }} reactions
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <MessageCircle class="h-3.5 w-3.5 text-blue-400" />
              {{ totalComments }} replies
            </div>
          </div>
        </div>

        <!-- Create post CTA -->
        <RouterLink
          to="/create-post"
          class="bg-teal-600 hover:bg-teal-700 text-white rounded-[18px] p-5 flex flex-col gap-2 no-underline transition-all duration-300 shadow-sm shadow-teal-200 hover:shadow-teal-300 hover:shadow-lg group hover:-translate-y-1"
        >
          <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <p class="text-sm font-black">
            {{ posts.length ? 'Share an update nearby' : 'Start the conversation' }}
          </p>
          <p class="text-xs leading-5 text-teal-100 font-medium">
            Choose exactly how far your post can be seen.
          </p>
        </RouterLink>
      </aside>
    </div>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import PostOptionsMenu from '@/components/PostOptionsMenu.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PostImageViewer from '@/components/PostImageViewer.vue'
import LocationFallbackNotice from '@/components/LocationFallbackNotice.vue'
import { postApi, reactionApi, userApi, type ApiPost } from '@/services/api'
import { useNearbyLocation } from '@/composables/useNearbyLocation'
import {
  MapPin,
  MessageCircle,
  Plus,
  Heart,
  Share2,
  Clock,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-vue-next'

const router = useRouter()
const geo = useNearbyLocation()
const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')
const sortMode = ref<'latest' | 'active'>('latest')
const reactingPostId = ref<number | null>(null)
let locationPermission: PermissionStatus | null = null

const activePosts = computed(() => posts.value.filter((p) => !isExpired(p.expires_at)).length)
const totalReactions = computed(() =>
  posts.value.reduce((total, post) => total + postReactionCount(post), 0),
)
const totalComments = computed(() =>
  posts.value.reduce(
    (total, post) => total + (post.comments?.length ?? post.comments_count ?? 0),
    0,
  ),
)
const totalInteractions = computed(() => totalReactions.value + totalComments.value)

function navigateToPost(postId: number) {
  router.push(`/posts/${postId}`)
}

function navigateToComments(postId: number) {
  router.push({ path: `/posts/${postId}`, query: { focus: 'comment' } })
}

function navigateToPostEdit(postId: number) {
  router.push(`/posts/${postId}/edit`)
}

function removePostFromFeed(postId: number) {
  posts.value = posts.value.filter((post) => post.post_id !== postId)
}

function postImageUrls(post: ApiPost) {
  return post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : []
}

function postReactionCount(post: ApiPost) {
  return post.reactions_count ?? post.reactions?.length ?? 0
}

async function toggleReaction(post: ApiPost) {
  if (reactingPostId.value) return

  reactingPostId.value = post.post_id
  try {
    const result = await reactionApi.togglePost(post.post_id)
    post.user_reacted = result.liked
    post.reactions_count = result.reactions_count
    post.reactions = undefined
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Could not update reaction.'
  } finally {
    reactingPostId.value = null
  }
}

function profileRoute(userId?: number | null) {
  return userId ? `/users/${userId}` : '/profile'
}

interface LoadPostsOptions {
  forceLocation?: boolean
  showLoading?: boolean
}

const RESUME_REFRESH_AGE_MS = 2 * 60_000
let lastFeedRefreshAt = 0
let resumeRefreshInFlight = false

async function loadPosts(options: LoadPostsOptions = {}) {
  const showLoading = options.showLoading ?? true
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const position = await geo.request({ forceRefresh: options.forceLocation })
    if (!position) {
      posts.value = []
      error.value =
        geo.errorMessage.value || 'Location is required to show posts that are visible near you.'
      return
    }

    if (geo.isFresh()) {
      await userApi.updateLocation(position.lat, position.lng).catch(() => undefined)
    }
    posts.value = await postApi.nearby(position.lat, position.lng, sortMode.value)
    lastFeedRefreshAt = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts.'
  } finally {
    if (showLoading) loading.value = false
  }
}

function setSort(sort: 'latest' | 'active') {
  sortMode.value = sort
  void loadPosts()
}

function retryLocation() {
  void loadPosts({
    forceLocation: true,
    showLoading: geo.locationSource.value !== 'cached',
  })
}

function isExpired(value: string) {
  return new Date(value).getTime() < Date.now()
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function timeLeft(value: string) {
  const targetDate = new Date(value).getTime()
  if (isNaN(targetDate)) return 'Expired'

  const diffMs = targetDate - Date.now()
  if (diffMs <= 0) return 'Expired'

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 30) return '30d+ left'
  if (days > 0) return `${days}d left`
  return `${hours}h left`
}

async function watchLocationPermission() {
  if (!navigator.permissions) return

  try {
    locationPermission = await navigator.permissions.query({ name: 'geolocation' })
    locationPermission.onchange = () => {
      if (locationPermission?.state === 'granted') {
        void loadPosts()
      }
    }
  } catch {
    locationPermission = null
  }
}

async function refreshAfterResume() {
  if (
    document.visibilityState !== 'visible' ||
    resumeRefreshInFlight ||
    Date.now() - lastFeedRefreshAt < RESUME_REFRESH_AGE_MS
  ) {
    return
  }

  resumeRefreshInFlight = true
  try {
    await loadPosts({ showLoading: false })
  } finally {
    resumeRefreshInFlight = false
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    void refreshAfterResume()
  }
}

function handlePageShow() {
  void refreshAfterResume()
}

watch(
  () => geo.locationSource.value,
  (source, previousSource) => {
    if (source && previousSource && source !== previousSource) {
      void loadPosts({ showLoading: false })
    }
  },
)

onMounted(() => {
  lastFeedRefreshAt = Date.now()
  void watchLocationPermission()
  void loadPosts()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handlePageShow)
  window.addEventListener('pageshow', handlePageShow)
})

onBeforeUnmount(() => {
  if (locationPermission) {
    locationPermission.onchange = null
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handlePageShow)
  window.removeEventListener('pageshow', handlePageShow)
})
</script>

<style scoped>
.animate-fade-down {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.post-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}
.post-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.post-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
.post-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.feed-post-list {
  width: min(100%, 760px);
  align-self: center;
}

.feed-side-panel {
  position: sticky;
  top: 5.25rem;
  align-self: flex-start;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  scrollbar-width: none;
}

.feed-side-panel::-webkit-scrollbar {
  display: none;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-location-card,
.home-error-card,
.home-empty-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(38, 65, 82, 0.06);
}

.home-location-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(140px, 210px);
  gap: 18px;
  align-items: center;
  border: 1px solid #dce8ee;
  background:
    radial-gradient(circle at top left, rgba(15, 138, 124, 0.1), transparent 34%),
    #fff;
  padding: 22px;
}

.home-location-icon {
  position: relative;
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #edf8f7;
  color: #0f8179;
}

.home-location-icon::after {
  position: absolute;
  inset: -8px;
  border: 1px solid rgba(15, 129, 121, 0.24);
  border-radius: 22px;
  content: '';
  animation: homeLocationPulse 1.5s ease-out infinite;
}

.home-loading-lines {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.home-loading-lines span {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf3f7 25%, #f8fcfd 50%, #edf3f7 75%);
  background-size: 220% 100%;
  animation: homeShimmerLine 1.35s ease-in-out infinite;
}

.home-loading-lines span:nth-child(2) {
  width: 78%;
  animation-delay: 0.1s;
}

.home-loading-lines span:nth-child(3) {
  width: 52%;
  animation-delay: 0.2s;
}

.home-error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  border: 1px solid #fee2e2;
  background:
    radial-gradient(circle at top, rgba(244, 63, 94, 0.08), transparent 34%),
    #fff;
  padding: 34px 28px;
  text-align: center;
}

.home-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 44px 28px;
  text-align: center;
}

@keyframes homeLocationPulse {
  0% {
    opacity: 0.9;
    transform: scale(0.88);
  }

  100% {
    opacity: 0;
    transform: scale(1.18);
  }
}

@keyframes homeShimmerLine {
  0% {
    background-position: 220% 0;
  }

  100% {
    background-position: -220% 0;
  }
}

@media (max-width: 767px) {
  .home-location-card {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 18px;
  }

  .home-location-icon {
    width: 54px;
    height: 54px;
  }

  .home-loading-lines {
    display: none;
  }

  .home-error-card,
  .home-empty-card {
    padding: 28px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-location-icon::after,
  .home-loading-lines span {
    animation: none;
  }
}

</style>
