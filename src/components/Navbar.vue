<template>
  <nav class="top-nav">
    <RouterLink to="/" class="logo">
      <span class="logo-main">Nearme</span>
      <span class="logo-sub">Social</span>
    </RouterLink>

    <div ref="searchArea" class="search-area" :class="{ 'mobile-open': mobileSearchOpen }">
      <div class="search-box">
        <Search class="icon" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="search"
          placeholder="Search users or posts..."
          autocomplete="off"
          aria-label="Search users and posts"
          @focus="searchFocused = true"
          @keydown.esc="closeSearch"
        />
        <LoaderCircle v-if="searching" class="search-spinner" />
        <button
          v-else-if="searchQuery"
          type="button"
          class="clear-search"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <X />
        </button>
      </div>

      <div v-if="showSearchResults" class="search-results">
        <p v-if="searchError" class="search-message search-error">{{ searchError }}</p>
        <p v-else-if="searching && !hasResults" class="search-message">Searching...</p>
        <p v-else-if="!searching && !hasResults" class="search-message">No users or posts found.</p>

        <template v-else>
          <section v-if="searchUsers.length" class="result-section">
            <p class="result-heading">People</p>
            <RouterLink
              v-for="user in searchUsers"
              :key="`user-${user.user_id}`"
              :to="`/users/${user.user_id}`"
              class="result-item"
              @click="closeSearch"
            >
              <img
                :src="
                  user.profile_image ||
                  `https://i.pravatar.cc/80?u=${encodeURIComponent(user.username)}`
                "
                :alt="`${user.username} profile`"
              />
              <span>
                <strong>{{ user.username }}</strong>
                <small>{{ [user.first_name, user.last_name].filter(Boolean).join(' ') }}</small>
              </span>
            </RouterLink>
          </section>

          <section v-if="searchPosts.length" class="result-section">
            <p class="result-heading">Posts</p>
            <RouterLink
              v-for="post in searchPosts"
              :key="`post-${post.post_id}`"
              :to="`/posts/${post.post_id}`"
              class="result-item post-result"
              @click="closeSearch"
            >
              <span class="result-icon"><FileText /></span>
              <span>
                <strong>{{ post.title }}</strong>
                <small>{{ postExcerpt(post.content) }}</small>
              </span>
            </RouterLink>
          </section>
        </template>
      </div>
    </div>

    <div class="nav-links">
      <RouterLink to="/" :class="{ active: route.path === '/' }">Feed</RouterLink>
      <RouterLink to="/nearby" :class="{ active: route.path.startsWith('/nearby') }">
        Nearby
      </RouterLink>
      <RouterLink to="/discussions" :class="{ active: route.path.startsWith('/discussion') }">
        Discussions
      </RouterLink>
      <RouterLink to="/chat" :class="{ active: route.path.startsWith('/chat') }">Chat</RouterLink>
    </div>

    <div class="actions">
      <button
        class="mobile-search"
        type="button"
        title="Search"
        aria-label="Open search"
        @click.stop="openMobileSearch"
      >
        <Search class="icon" />
      </button>
      <RouterLink to="/notifications" class="icon-link" title="Notifications">
        <Bell class="icon" />
        <span class="notification-dot"></span>
      </RouterLink>
      <RouterLink to="/settings" class="icon-link" title="Settings">
        <Settings class="icon" />
      </RouterLink>
      <RouterLink to="/profile" class="profile-link" title="Profile">
        <img :src="profileImage" :alt="`${username} profile`" />
      </RouterLink>
      <button class="icon-link logout-button" type="button" title="Log out" @click="handleLogout">
        <LogOut class="icon" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Bell, FileText, LoaderCircle, LogOut, Search, Settings, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { searchApi, type ApiPost, type ApiSearchUser } from '@/services/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const searchArea = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const searchUsers = ref<ApiSearchUser[]>([])
const searchPosts = ref<ApiPost[]>([])
const searching = ref(false)
const searchError = ref('')
const searchFocused = ref(false)
const mobileSearchOpen = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

const username = computed(() => auth.user?.username || 'neighbor')
const hasResults = computed(() => searchUsers.value.length > 0 || searchPosts.value.length > 0)
const showSearchResults = computed(
  () => searchFocused.value && searchQuery.value.trim().length >= 2,
)
const profileImage = computed(() => {
  const profile = auth.user?.profile as { profile_image?: string } | undefined
  return (
    profile?.profile_image || `https://i.pravatar.cc/150?u=${encodeURIComponent(username.value)}`
  )
})

watch(searchQuery, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchError.value = ''
  const requestId = ++searchRequestId

  const query = value.trim()
  if (query.length < 2) {
    searching.value = false
    searchUsers.value = []
    searchPosts.value = []
    return
  }

  searching.value = true
  searchTimer = setTimeout(() => void runSearch(query, requestId), 300)
})

async function runSearch(query: string, requestId: number) {
  try {
    const results = await searchApi.search(query)
    if (requestId !== searchRequestId) return

    searchUsers.value = results.users
    searchPosts.value = results.posts
  } catch (error: unknown) {
    if (requestId !== searchRequestId) return

    searchUsers.value = []
    searchPosts.value = []
    searchError.value = error instanceof Error ? error.message : 'Search failed.'
  } finally {
    if (requestId === searchRequestId) searching.value = false
  }
}

function postExcerpt(content: string) {
  return content.length > 72 ? `${content.slice(0, 72)}...` : content
}

function clearSearch() {
  searchQuery.value = ''
  searchInput.value?.focus()
}

function closeSearch() {
  searchFocused.value = false
  mobileSearchOpen.value = false
}

async function openMobileSearch() {
  mobileSearchOpen.value = true
  searchFocused.value = true
  await nextTick()
  searchInput.value?.focus()
}

function handleDocumentClick(event: MouseEvent) {
  if (!searchArea.value?.contains(event.target as Node)) closeSearch()
}

function handleLogout() {
  auth.logout()
  router.replace('/login')
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1100;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid #e7edf3;
  background: rgba(255, 255, 255, 0.96);
  padding: 0 clamp(16px, 3vw, 28px);
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
  backdrop-filter: blur(12px);
}

.logo {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  flex: 0 0 auto;
  text-decoration: none;
}

.logo-main {
  color: #0f5f71;
  font-size: 1.2rem;
  font-weight: 900;
}

.logo-sub {
  color: #8b9aaa;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.search-area {
  width: min(320px, 28vw);
  position: relative;
}

.search-box {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  background: #f0f5f8;
  padding: 0 14px;
  color: #8495a3;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #29475b;
  font-size: 0.86rem;
}

.search-box input::-webkit-search-cancel-button {
  display: none;
}

.clear-search {
  width: 24px;
  height: 24px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #718396;
  cursor: pointer;
}

.clear-search:hover {
  background: #e2e8f0;
}

.clear-search svg,
.search-spinner {
  width: 15px;
  height: 15px;
}

.search-spinner {
  flex: 0 0 auto;
  animation: spin 0.8s linear infinite;
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 70;
  width: min(420px, 88vw);
  max-height: min(520px, 70vh);
  overflow-y: auto;
  border: 1px solid #dfe8ee;
  border-radius: 16px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 18px 45px rgba(15, 45, 70, 0.16);
}

.result-section + .result-section {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #edf2f5;
}

.result-heading {
  margin: 0;
  padding: 7px 10px;
  color: #8293a2;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 11px;
  padding: 9px 10px;
  color: #29475b;
  text-decoration: none;
}

.result-item:hover {
  background: #f0f7f8;
}

.result-item img,
.result-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 999px;
}

.result-item img {
  object-fit: cover;
}

.result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e5f5f6;
  color: #0f7180;
}

.result-icon svg {
  width: 17px;
  height: 17px;
}

.result-item > span:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.result-item strong,
.result-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item strong {
  font-size: 0.83rem;
}

.result-item small {
  margin-top: 2px;
  color: #8193a2;
  font-size: 0.72rem;
}

.search-message {
  margin: 0;
  padding: 18px 14px;
  color: #728596;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.search-error {
  color: #dc2626;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.nav-links {
  display: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav-links a {
  border-radius: 999px;
  padding: 8px 12px;
  color: #607486;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 800;
}

.nav-links a.active {
  background: #e0f4f8;
  color: #0f6378;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex: 0 0 auto;
}

.icon-link,
.mobile-search,
.profile-link {
  position: relative;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #516a7d;
  cursor: pointer;
}

.logout-button:hover {
  background: #fff1f2;
  color: #e11d48;
}

.icon {
  width: 18px;
  height: 18px;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #ef4444;
}

.profile-link img {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 0 0 2px #2dd4bf;
}

.mobile-search {
  display: none;
}

@media (max-width: 980px) {
  .search-area {
    margin-left: auto;
    width: min(280px, 38vw);
  }
}

@media (min-width: 641px) and (max-width: 767px) {
  .nav-links {
    display: flex;
  }
}

@media (max-width: 640px) {
  .top-nav {
    gap: 10px;
  }

  .search-area,
  .nav-links,
  .actions .icon-link[title='Settings'] {
    display: none;
  }

  .mobile-search {
    display: inline-flex;
  }

  .search-area.mobile-open {
    position: absolute;
    top: 58px;
    left: 12px;
    right: 12px;
    display: block;
    width: auto;
    margin: 0;
  }

  .search-area.mobile-open .search-box {
    border: 1px solid #dbe7ed;
    background: #fff;
    box-shadow: 0 10px 25px rgba(15, 45, 70, 0.12);
  }

  .search-area.mobile-open .search-results {
    width: 100%;
  }
}
</style>
