<template>
  <div class="min-h-screen bg-[#f4f7fb] text-slate-700">
    <Navbar />

    <div class="flex min-w-0">
      <AppSidebar class="hidden md:flex" />

      <div class="detail-page">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button class="back-btn" type="button" @click="goBack">
            <span aria-hidden="true">←</span>
            The Neighborhood
          </button>

          <div class="detail-context">
            <span>Courtyard</span>
            <span>Explore</span>
            <span>Alerts</span>
          </div>
        </div>

        <div class="detail-grid">
          <main class="min-w-0">
            <p v-if="loading" class="state-card">Loading post...</p>
            <p v-else-if="error" class="state-card error-state">{{ error }}</p>

            <article v-else-if="post" class="post-card">
              <div class="post-meta">
                <span class="post-tag">{{ post.status }}</span>
                <span class="post-time">{{ timeAgo(post.created_at) }}</span>
              </div>

              <h1 class="post-title">{{ post.title }}</h1>

              <div class="author-row">
                <button
                  class="author-avatar author-link"
                  type="button"
                  @click="goToProfile(post.user?.user_id)"
                >
                  {{ initials(post.user?.username || 'Neighbor') }}
                </button>
                <div class="author-copy">
                  <button
                    class="author-name author-name-button"
                    type="button"
                    @click="goToProfile(post.user?.user_id)"
                  >
                    {{ post.user?.username || 'Neighbor' }}
                  </button>
                  <div class="author-sub">
                    {{ post.visibility_radius }}m visibility ·
                    <span class="verified-badge">Verified Resident</span>
                  </div>
                </div>
                <UserOptionsMenu :user-id="post.user?.user_id" />
              </div>

              <div class="post-body">
                <p v-for="(para, i) in postParagraphs" :key="i">{{ para }}</p>
              </div>

              <img
                v-if="post.image_url"
                :src="post.image_url"
                :alt="post.title"
                class="post-image"
              />

              <div class="post-actions">
                <button
                  class="action-btn"
                  :class="{ upvoted: post.upvoted }"
                  type="button"
                  @click="toggleUpvote"
                >
                  {{ reactionsCount }} Upvotes
                </button>
                <button class="action-btn" type="button" @click="focusReply">
                  {{ commentCount }} Comments
                </button>
                <span class="action-note">{{ timeLeft(post.expires_at) }} left</span>
              </div>
            </article>

            <CommentSection
              v-if="post"
              ref="commentSectionRef"
              :comments="comments"
              :sort-by="sortBy"
              :submitting="commentSubmitting"
              :error-message="commentError"
              @update:sort-by="sortBy = $event"
              @add-comment="addComment"
              @submit-reply="submitReply"
            />
          </main>

          <aside class="detail-sidebar">
            <section class="side-card">
              <div class="side-title">Live Community Pulse</div>
              <div class="pulse-label">
                Activity Strength <span>{{ pulsePct }}%</span>
              </div>
              <div class="pulse-track">
                <div class="pulse-fill" :style="{ width: pulsePct + '%' }"></div>
              </div>
              <div class="pulse-stats">
                <div>
                  <strong>{{ reactionsCount }}</strong>
                  <span>Reactions</span>
                </div>
                <div>
                  <strong>{{ commentCount }}</strong>
                  <span>Comments</span>
                </div>
              </div>
            </section>

            <section class="map-card">
              <div class="map-grid"></div>
              <div class="map-pin"></div>
              <div class="map-caption">
                <span>Location Impact</span>
                <strong>{{
                  post?.distance_label || `${post?.visibility_radius ?? 0}m visibility`
                }}</strong>
              </div>
            </section>

            <section class="side-card">
              <div class="side-title">Discussion Tips</div>
              <div class="tips-list">
                <div v-for="t in tips" :key="t.text" class="tip-item">
                  <span></span>
                  <p>{{ t.text }}</p>
                </div>
              </div>
            </section>

            <section class="side-card">
              <div class="side-title">Related Topics</div>
              <div class="related-list">
                <button v-for="r in related" :key="r.title" type="button" class="related-item">
                  <strong>{{ r.title }}</strong>
                  <span>{{ r.meta }}</span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommentSection from './CommentSection.vue'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import UserOptionsMenu from '@/components/UserOptionsMenu.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import { commentApi, postApi, type ApiComment, type ApiPost } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

type ViewComment = {
  id: number
  name: string
  userId: number | null
  initials: string
  time: string
  color: string
  body: string
  likes: number
  showReply: boolean
  replyText: string
  replies: never[]
}

type DetailPost = ApiPost & {
  upvoted: boolean
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref<DetailPost | null>(null)
const comments = ref<ViewComment[]>([])
const sortBy = ref('top')
const loading = ref(false)
const error = ref('')
const commentSubmitting = ref(false)
const commentError = ref('')
const commentSectionRef = ref<InstanceType<typeof CommentSection> | null>(null)
const commentCount = computed(() => comments.value.length)
const reactionsCount = computed(
  () => post.value?.reactions?.length ?? post.value?.reactions_count ?? 0,
)
const pulsePct = computed(() =>
  Math.min(100, Math.max(12, (commentCount.value + reactionsCount.value) * 12)),
)
const postParagraphs = computed(() =>
  (post.value?.content || '')
    .split(/\n+/)
    .map((para) => para.trim())
    .filter(Boolean),
)

const tips = [
  { text: "Stay polite and constructive; we're all neighbors here." },
  { text: 'Suggest solutions alongside identifying problems.' },
  { text: 'Mention neighbors who might have relevant expertise.' },
]

const related = [
  { title: 'Nearby visibility', meta: 'Posts are scoped to their local radius.' },
  { title: 'Community safety', meta: 'Report content that feels unsafe.' },
]

function toggleUpvote() {
  if (!post.value) return
  post.value.upvoted = !post.value.upvoted
}

function focusReply() {
  commentSectionRef.value?.focusMainReply()
}

async function addComment(text: string) {
  if (!text.trim()) return
  if (!post.value) return

  const userId = auth.user?.userId ?? auth.user?.user_id
  if (!userId) {
    commentError.value = 'You need to be logged in to comment.'
    return
  }

  commentSubmitting.value = true
  commentError.value = ''

  try {
    const created = await commentApi.create({
      post_id: post.value.post_id,
      user_id: userId,
      content: text.trim(),
    })
    comments.value = [
      toViewComment({
        ...created,
        user: {
          user_id: userId,
          username: auth.user?.username || 'Neighbor',
        },
      }),
      ...comments.value,
    ]
  } catch (err: unknown) {
    commentError.value = err instanceof Error ? err.message : 'Failed to add comment.'
  } finally {
    commentSubmitting.value = false
  }
}

function submitReply(comment: ViewComment, text: string) {
  if (!text.trim()) return
  commentError.value = 'Threaded replies are not supported by the comment API yet.'
  comment.replyText = ''
  comment.showReply = false
}

function goBack() {
  window.history.back()
}

function goToProfile(userId?: number | null) {
  if (!userId) return
  router.push(`/users/${userId}`)
}

async function loadPostDetail() {
  const postId = Number(route.params.postId)

  if (!Number.isInteger(postId) || postId <= 0) {
    error.value = 'Choose a post from the feed to view its discussion.'
    post.value = null
    comments.value = []
    return
  }

  loading.value = true
  error.value = ''
  commentError.value = ''

  try {
    const [postData, commentData] = await Promise.all([
      postApi.get(postId),
      commentApi.listByPost(postId),
    ])

    post.value = {
      ...postData,
      upvoted: false,
    }
    comments.value = commentData.filter(isActiveComment).map(toViewComment)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load post discussion.'
    post.value = null
    comments.value = []
  } finally {
    loading.value = false
  }
}

function toViewComment(comment: ApiComment): ViewComment {
  const username = comment.user?.username || 'Neighbor'

  return {
    id: comment.comment_id,
    name: username,
    userId: comment.user?.user_id ?? null,
    initials: initials(username),
    time: timeAgo(comment.created_at),
    color: avatarGradient(username),
    body: comment.content,
    likes: 0,
    showReply: false,
    replyText: '',
    replies: [],
  }
}

function isActiveComment(comment: ApiComment) {
  return comment.status === 'ACTIVE'
}

function initials(value: string) {
  return (
    value
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'N'
  )
}

function avatarGradient(value: string) {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff
  const hue = Math.abs(hash) % 360
  return `linear-gradient(135deg, hsl(${hue} 58% 32%), hsl(${(hue + 34) % 360} 66% 46%))`
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
  const diffMs = new Date(value).getTime() - Date.now()
  if (diffMs <= 0) return 'expired'
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.ceil(minutes / 60)
  return `${hours}h`
}

onMounted(loadPostDetail)
watch(() => route.params.postId, loadPostDetail)
</script>

<style scoped>
.detail-page {
  --accent: #0f766e;
  --accent-dark: #164e63;
  --accent-soft: #e7f7f7;
  --border: #dbe6ee;
  --card: #ffffff;
  --muted: #64748b;
  --text: #172033;
  --radius: 18px;
  --shadow: 0 16px 36px rgba(15, 35, 55, 0.08);
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 22px clamp(16px, 2vw, 28px) 40px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  align-items: start;
}

.back-btn,
.detail-context {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
}

.back-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--text);
}

.detail-context span {
  border-radius: 999px;
  background: #fff;
  padding: 7px 11px;
  box-shadow: 0 1px 0 rgba(15, 35, 55, 0.04);
}

.post-card,
.side-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: var(--shadow);
}

.post-card {
  padding: clamp(20px, 2vw, 28px);
  border-left: 4px solid var(--accent);
}

.post-meta,
.post-actions,
.pulse-stats {
  display: flex;
  align-items: center;
}

.post-meta {
  justify-content: space-between;
  gap: 12px;
}

.post-tag {
  border-radius: 999px;
  background: var(--accent-soft);
  padding: 5px 10px;
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 950;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.post-time,
.author-sub,
.action-note {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.post-title {
  margin: 18px 0 14px;
  color: var(--text);
  font-size: clamp(1.6rem, 2.4vw, 2.15rem);
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.12;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.author-avatar {
  border: 0;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), #22c1b6);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 900;
}

.author-link {
  cursor: pointer;
}

.author-link:hover {
  filter: brightness(0.95);
}

.author-copy {
  min-width: 0;
  flex: 1;
}

.author-name {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 900;
}

.author-name-button {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.author-name-button:hover {
  color: var(--accent);
}

.verified-badge {
  color: var(--accent);
}

.post-body {
  max-width: 72ch;
}

.post-body p {
  margin: 0 0 14px;
  color: #334155;
  font-size: 0.94rem;
  line-height: 1.75;
}

.post-image {
  width: 100%;
  max-height: 560px;
  display: block;
  margin-top: 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  object-fit: cover;
}

.post-actions {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.action-btn {
  border: 0;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 8px 12px;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 900;
}

.action-btn:hover,
.action-btn.upvoted {
  background: var(--accent-soft);
  color: var(--accent);
}

.action-note {
  margin-left: auto;
}

.detail-sidebar {
  display: grid;
  gap: 16px;
}

.side-card {
  padding: 18px;
}

.side-title {
  margin-bottom: 13px;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 950;
}

.pulse-label {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.pulse-label span {
  color: var(--accent);
}

.pulse-track {
  height: 8px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.pulse-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), #22c1b6);
}

.pulse-stats {
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.pulse-stats div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
  text-align: center;
}

.pulse-stats strong {
  display: block;
  color: var(--text);
  font-size: 1.35rem;
  font-weight: 950;
}

.pulse-stats span {
  display: block;
  margin-top: 3px;
  color: var(--muted);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.map-card {
  position: relative;
  min-height: 170px;
  overflow: hidden;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #164e63, #0f766e);
  box-shadow: var(--shadow);
}

.map-grid {
  position: absolute;
  inset: 0;
  opacity: 0.34;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.45) 1px, transparent 1px);
  background-size: 26px 26px;
}

.map-pin {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 11px;
  height: 11px;
  border-radius: 999px;
  background: #083344;
  box-shadow:
    0 0 0 18px rgba(186, 230, 253, 0.35),
    0 0 0 44px rgba(186, 230, 253, 0.22);
}

.map-caption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 14px 16px;
  background: linear-gradient(transparent, rgba(8, 47, 73, 0.9));
  color: #fff;
}

.map-caption span {
  display: block;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  opacity: 0.72;
  text-transform: uppercase;
}

.map-caption strong {
  display: block;
  margin-top: 3px;
  font-size: 0.94rem;
}

.tips-list,
.related-list {
  display: grid;
  gap: 10px;
}

.tip-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 9px;
}

.tip-item span {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--accent-soft);
}

.tip-item p,
.related-item span {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.related-item {
  border: 0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.related-item strong {
  display: block;
  color: var(--text);
  font-size: 0.82rem;
}

@media (max-width: 1120px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .detail-page {
    padding: 16px 14px 32px;
  }

  .detail-sidebar {
    grid-template-columns: 1fr;
  }

  .detail-context {
    display: none;
  }

  .post-meta,
  .post-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .action-note {
    margin-left: 0;
  }
}
</style>
