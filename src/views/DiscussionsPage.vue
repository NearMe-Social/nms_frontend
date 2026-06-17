<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import PostOptionsMenu from '@/components/PostOptionsMenu.vue'
import PostImageViewer from '@/components/PostImageViewer.vue'
import { postApi, type ApiPost } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import {
  AlertCircle,
  Clock3,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-vue-next'

type PostFilter = 'all' | 'active' | 'expired'

type MyPost = {
  id: number
  ownerId?: number
  title: string
  body: string
  visibility: number
  timeLabel: string
  likes: number
  comments: number
  category: string
  images: string[]
  active: boolean
}

const tabs: Array<{ key: PostFilter; label: string }> = [
  { key: 'all', label: 'All posts' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
]

const auth = useAuthStore()
const router = useRouter()
const activeTab = ref<PostFilter>('all')
const searchTerm = ref('')
const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')

const myPosts = computed<MyPost[]>(() => {
  const userId = auth.user?.userId ?? auth.user?.user_id

  return posts.value
    .filter((post) => !userId || post.user?.user_id === userId)
    .map((post) => ({
      id: post.post_id,
      ownerId: post.user?.user_id,
      title: post.title,
      body: post.content,
      visibility: post.visibility_radius,
      timeLabel: timeAgo(post.created_at),
      likes: post.reactions?.length ?? post.reactions_count ?? 0,
      comments: post.comments?.length ?? post.comments_count ?? 0,
      category: post.status,
      images: post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : [],
      active: new Date(post.expires_at).getTime() > Date.now(),
    }))
})

const filteredPosts = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase()

  return myPosts.value.filter((post) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'active' && post.active) ||
      (activeTab.value === 'expired' && !post.active)
    const matchesSearch =
      !needle ||
      post.title.toLowerCase().includes(needle) ||
      post.body.toLowerCase().includes(needle) ||
      post.category.toLowerCase().includes(needle)

    return matchesTab && matchesSearch
  })
})

const stats = computed(() => ({
  total: myPosts.value.length,
  active: myPosts.value.filter((post) => post.active).length,
  responses: myPosts.value.reduce((sum, post) => sum + post.likes + post.comments, 0),
}))

async function loadPosts() {
  loading.value = true
  error.value = ''

  try {
    posts.value = await postApi.mine()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load your posts.'
  } finally {
    loading.value = false
  }
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function clearFilters() {
  searchTerm.value = ''
  activeTab.value = 'all'
}

function openEditPost(postId: number) {
  router.push(`/posts/${postId}/edit`)
}

function removePostFromList(postId: number) {
  posts.value = posts.value.filter((post) => post.post_id !== postId)
}

onMounted(loadPosts)
</script>

<template>
  <div class="posts-page">
    <Navbar />

    <div class="page-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <div class="heading-copy">
            <span class="eyebrow"><FileText /> Your activity</span>
            <h1>My posts</h1>
            <p>Review the updates you have shared and continue conversations with nearby people.</p>
          </div>

          <RouterLink to="/create-post" class="primary-action">
            <Plus />
            Create post
          </RouterLink>
        </header>

        <section class="summary-grid" aria-label="Post summary">
          <article class="summary-card">
            <span class="summary-icon"><FileText /></span>
            <div>
              <strong>{{ stats.total }}</strong>
              <span>Total posts</span>
            </div>
          </article>
          <article class="summary-card">
            <span class="summary-icon"><Clock3 /></span>
            <div>
              <strong>{{ stats.active }}</strong>
              <span>Currently active</span>
            </div>
          </article>
          <article class="summary-card">
            <span class="summary-icon"><MessageSquare /></span>
            <div>
              <strong>{{ stats.responses }}</strong>
              <span>Reactions and comments</span>
            </div>
          </article>
        </section>

        <section class="toolbar">
          <label class="search-field">
            <Search />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Search your posts..."
              aria-label="Search your posts"
            />
          </label>

          <div class="filter-tabs" aria-label="Filter posts">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </section>

        <section v-if="loading" class="post-grid" aria-label="Loading posts">
          <article v-for="item in 4" :key="item" class="post-card skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </article>
        </section>

        <section v-else-if="error" class="state-card error-state">
          <span class="state-icon"><AlertCircle /></span>
          <div>
            <h2>We could not load your posts</h2>
            <p>{{ error }}</p>
          </div>
          <button type="button" @click="loadPosts"><RefreshCw /> Try again</button>
        </section>

        <section v-else-if="myPosts.length === 0" class="state-card empty-state">
          <span class="state-icon"><FileText /></span>
          <div>
            <h2>Your first post starts here</h2>
            <p>Share a useful update, question, or notice with people near you.</p>
          </div>
          <RouterLink to="/create-post"><Plus /> Create your first post</RouterLink>
        </section>

        <section v-else-if="filteredPosts.length === 0" class="state-card empty-state">
          <span class="state-icon"><Search /></span>
          <div>
            <h2>No matching posts</h2>
            <p>Try another search term or choose a different filter.</p>
          </div>
          <button type="button" @click="clearFilters">Clear filters</button>
        </section>

        <section v-else class="post-grid">
          <article v-for="post in filteredPosts" :key="post.id" class="post-card">
            <PostImageViewer
              v-if="post.images.length"
              :images="post.images"
              :alt="post.title"
              variant="feed"
            />

            <div class="post-content">
              <div class="post-topline">
                <div class="post-labels">
                  <span class="status-chip" :class="{ expired: !post.active }">
                    {{ post.active ? 'Active' : 'Expired' }}
                  </span>
                  <span class="category-label">{{ post.category }}</span>
                </div>
                <PostOptionsMenu
                  :post-id="post.id"
                  :user-id="post.ownerId"
                  allow-owner-actions
                  @edit="openEditPost"
                  @deleted="removePostFromList"
                />
              </div>

              <RouterLink :to="`/posts/${post.id}`" class="post-copy">
                <h2>{{ post.title }}</h2>
                <p>{{ post.body }}</p>
              </RouterLink>

              <div class="post-meta">
                <span><Clock3 /> {{ post.timeLabel }}</span>
                <span><MapPin /> {{ post.visibility }}m reach</span>
              </div>

              <footer class="post-footer">
                <div class="engagement">
                  <span><Heart /> {{ post.likes }}</span>
                  <span><MessageSquare /> {{ post.comments }}</span>
                </div>
                <RouterLink :to="`/posts/${post.id}`">Open discussion</RouterLink>
              </footer>
            </div>
          </article>
        </section>
      </main>
    </div>

    <MobileBottomNav />
  </div>
</template>

<style scoped>
.posts-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f4054;
}

.page-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 24px clamp(16px, 3vw, 40px) 48px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.heading-copy {
  max-width: 720px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #0e7c86;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.eyebrow svg {
  width: 15px;
  height: 15px;
}

h1 {
  margin: 7px 0 0;
  color: #14263b;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1;
}

.heading-copy p {
  max-width: 620px;
  margin: 12px 0 0;
  color: #71869a;
  font-size: 0.94rem;
  line-height: 1.65;
}

.primary-action,
.state-card a,
.state-card button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: #0f8179;
  padding: 11px 16px;
  color: #fff;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.primary-action:hover,
.state-card a:hover,
.state-card button:hover {
  background: #0b6963;
  transform: translateY(-1px);
}

.primary-action svg,
.state-card a svg,
.state-card button svg {
  width: 17px;
  height: 17px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  border: 1px solid #e1eaf0;
  border-radius: 16px;
  background: #fff;
  padding: 16px 18px;
  box-shadow: 0 8px 24px rgba(20, 45, 70, 0.04);
}

.summary-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #e9f7f7;
  color: #0e7c86;
}

.summary-icon svg {
  width: 19px;
  height: 19px;
  display: block;
}

.summary-card div > strong,
.summary-card div > span {
  display: block;
}

.summary-card strong {
  color: #14263b;
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1;
}

.summary-card div > span {
  margin-top: 5px;
  color: #8294a5;
  font-size: 0.75rem;
  font-weight: 650;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  border: 1px solid #e1eaf0;
  border-radius: 16px;
  background: #fff;
  padding: 11px;
  box-shadow: 0 8px 24px rgba(20, 45, 70, 0.04);
}

.search-field {
  min-width: 220px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 11px;
  background: #f4f8fa;
  padding: 10px 13px;
  color: #8798a7;
}

.search-field:focus-within {
  box-shadow: inset 0 0 0 1px #78b9bd;
  background: #fff;
}

.search-field svg {
  width: 17px;
  height: 17px;
}

.search-field input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #243c50;
  font: inherit;
  font-size: 0.84rem;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-tabs button {
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 9px 13px;
  color: #71869a;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
}

.filter-tabs button:hover {
  background: #f2f7f8;
}

.filter-tabs button.active {
  background: #e6f5f5;
  color: #0d7478;
}

.post-grid {
  width: min(100%, 760px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-inline: auto;
}

.post-card {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e1eaf0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(20, 45, 70, 0.045);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.post-card:hover {
  border-color: #c8dcdf;
  box-shadow: 0 14px 30px rgba(20, 45, 70, 0.08);
  transform: translateY(-2px);
}

.post-content {
  padding: 18px;
}

.post-topline,
.post-footer,
.post-meta,
.engagement,
.post-labels {
  display: flex;
  align-items: center;
}

.post-topline {
  justify-content: space-between;
  gap: 14px;
}

.post-labels {
  min-width: 0;
  gap: 8px;
}

.status-chip {
  border-radius: 999px;
  background: #e9f7f0;
  padding: 5px 9px;
  color: #147454;
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-chip.expired {
  background: #f0f3f5;
  color: #778895;
}

.category-label {
  overflow: hidden;
  color: #91a0ad;
  font-size: 0.68rem;
  font-weight: 750;
  text-overflow: ellipsis;
  text-transform: capitalize;
  white-space: nowrap;
}

.post-copy {
  display: block;
  margin-top: 15px;
  color: inherit;
  text-decoration: none;
}

.post-copy h2 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #172b3e;
  font-size: 1.06rem;
  font-weight: 850;
  letter-spacing: -0.015em;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-copy p {
  display: -webkit-box;
  overflow: hidden;
  margin: 8px 0 0;
  color: #61788c;
  font-size: 0.84rem;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.post-meta {
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
  color: #8092a2;
  font-size: 0.72rem;
  font-weight: 700;
}

.post-meta span,
.engagement span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.post-meta svg,
.engagement svg {
  width: 14px;
  height: 14px;
}

.post-footer {
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  border-top: 1px solid #edf2f5;
  padding-top: 14px;
}

.engagement {
  gap: 13px;
  color: #7890a2;
  font-size: 0.75rem;
  font-weight: 750;
}

.post-footer > a {
  color: #0e777a;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 850;
}

.post-footer > a:hover {
  text-decoration: underline;
}

.state-card {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  border: 1px solid #e1eaf0;
  border-radius: 18px;
  background: #fff;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(20, 45, 70, 0.04);
}

.state-icon {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #eaf6f6;
  color: #0e7c86;
}

.state-icon svg {
  width: 24px;
  height: 24px;
}

.state-card h2 {
  margin: 0;
  color: #172b3e;
  font-size: 1.05rem;
  font-weight: 850;
}

.state-card p {
  max-width: 460px;
  margin: 6px 0 0;
  color: #75899a;
  font-size: 0.82rem;
  line-height: 1.6;
}

.error-state .state-icon {
  background: #fff0f1;
  color: #c84b5e;
}

.skeleton-card {
  min-height: 210px;
  padding: 22px;
}

.skeleton-line {
  height: 11px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #eef2f5 25%, #f8fafb 50%, #eef2f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line.short {
  width: 25%;
}

.skeleton-line.title {
  width: 62%;
  height: 18px;
  margin-top: 24px;
}

.skeleton-line.medium {
  width: 74%;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 900px) {
  .workspace {
    padding: 20px 18px 100px;
  }
}

@media (max-width: 680px) {
  .workspace {
    padding: 18px 14px 96px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 18px;
  }

  .primary-action {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .summary-card {
    padding: 12px 14px;
  }

  .summary-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field {
    min-width: 0;
  }

  .filter-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-tabs button {
    padding-inline: 7px;
  }

  .post-content {
    padding: 16px;
  }

  .image-link {
    height: 230px;
  }
}

@media (max-width: 420px) {
  .image-link {
    height: 200px;
  }
}
</style>
