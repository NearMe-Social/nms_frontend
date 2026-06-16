<template>
  <div class="discussion-page">
    <Navbar />

    <div class="page-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <button class="back-button" type="button" @click="goBack">
            <ArrowLeft />
            Back
          </button>

          <div class="heading-copy">
            <span class="eyebrow"><MessageCircle /> Community discussion</span>
            <h1>{{ post?.title || 'Join the conversation' }}</h1>
            <p>
              {{
                post
                  ? 'Read the full update and share a helpful response.'
                  : 'Choose a post from the nearby feed to read and respond.'
              }}
            </p>
          </div>
        </header>

        <section v-if="loading" class="state-card loading-state">
          <span class="loading-mark"></span>
          <div>
            <h2>Loading discussion</h2>
            <p>Getting the post and its latest comments.</p>
          </div>
        </section>

        <section v-else-if="error" class="state-card error-state">
          <span class="state-icon"><FileText /></span>
          <div>
            <h2>{{ hasPostId ? 'Discussion unavailable' : 'Choose a post to discuss' }}</h2>
            <p>{{ error }}</p>
          </div>
          <button v-if="hasPostId" type="button" @click="loadPostDetail">
            <RefreshCw />
            Try again
          </button>
          <RouterLink v-else to="/">
            Browse nearby posts
            <ArrowRight />
          </RouterLink>
        </section>

        <div v-else-if="post" class="detail-grid">
          <div class="discussion-column">
            <article class="post-card">
              <div class="post-topline">
                <div class="post-labels">
                  <span class="post-tag">{{ post.status }}</span>
                  <span class="post-time"><Clock3 /> {{ timeAgo(post.created_at) }}</span>
                </div>
                <PostOptionsMenu
                  :post-id="post.post_id"
                  :user-id="post.user?.user_id"
                  allow-owner-actions
                  @edit="openEditPost"
                  @deleted="handlePostDeleted"
                />
              </div>

              <div class="author-row">
                <button
                  class="author-link"
                  type="button"
                  :disabled="!post.user?.user_id"
                  @click="goToProfile(post.user?.user_id)"
                >
                  <UserAvatar
                    :src="post.user?.profile_image"
                    :username="post.user?.username || 'Neighbor'"
                    :alt="`${post.user?.username || 'Neighbor'} profile`"
                    class="author-avatar"
                  />
                </button>
                <div class="author-copy">
                  <button
                    class="author-name"
                    type="button"
                    :disabled="!post.user?.user_id"
                    @click="goToProfile(post.user?.user_id)"
                  >
                    {{ post.user?.username || 'Neighbor' }}
                  </button>
                  <span><MapPin /> Shared within {{ post.visibility_radius }}m</span>
                </div>
              </div>

              <h2 class="post-title">{{ post.title }}</h2>

              <div class="post-body">
                <p v-for="(paragraph, index) in postParagraphs" :key="index">
                  {{ paragraph }}
                </p>
              </div>

              <PostImageViewer
                v-if="postImageUrls.length"
                :images="postImageUrls"
                :alt="post.title"
                class="post-image"
                variant="detail"
              />

              <footer class="post-actions">
                <button
                  type="button"
                  :class="{ active: post.upvoted }"
                  @click="toggleUpvote"
                >
                  <Heart />
                  <span>{{ reactionsCount }}</span>
                  <small>{{ post.upvoted ? 'Reacted' : 'React' }}</small>
                </button>
                <button type="button" @click="focusReply">
                  <MessageCircle />
                  <span>{{ commentCount }}</span>
                  <small>Comments</small>
                </button>
                <span class="expiry-note"><Clock3 /> {{ timeLeft(post.expires_at) }} left</span>
              </footer>
            </article>

            <CommentSection
              ref="commentSectionRef"
              :comments="comments"
              :sort-by="sortBy"
              :submitting="commentSubmitting"
              :error-message="commentError"
              :highlight-comment-id="highlightCommentId"
              @update:sort-by="sortBy = $event"
              @add-comment="addComment"
              @submit-reply="submitReply"
            />
          </div>

          <aside class="detail-sidebar">
            <section class="side-card overview-card">
              <span class="side-eyebrow">At a glance</span>
              <h2>Discussion activity</h2>
              <div class="stat-grid">
                <div>
                  <strong>{{ reactionsCount }}</strong>
                  <span>Reactions</span>
                </div>
                <div>
                  <strong>{{ commentCount }}</strong>
                  <span>Comments</span>
                </div>
                <div>
                  <strong>{{ post.visibility_radius }}m</strong>
                  <span>Visibility</span>
                </div>
              </div>
            </section>

            <section class="side-card privacy-card">
              <span class="side-icon"><ShieldCheck /></span>
              <div>
                <h2>Location stays approximate</h2>
                <p>The post radius is shown, but the author's precise position is not shared.</p>
              </div>
            </section>

            <section class="side-card">
              <span class="side-eyebrow">Keep it useful</span>
              <h2>Good discussion habits</h2>
              <ul class="tips-list">
                <li v-for="tip in tips" :key="tip">
                  <CheckCircle2 />
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>

    <div v-if="editingPost" class="modal-backdrop" @click.self="closeEditPost">
      <form class="edit-modal" @submit.prevent="savePostEdit">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">Manage post</span>
            <h2>Edit this post</h2>
            <p>Update the message people see around this location.</p>
          </div>
          <button type="button" class="modal-close" @click="closeEditPost">×</button>
        </div>

        <label>
          <span>Title</span>
          <input v-model="editTitle" type="text" maxlength="120" />
        </label>

        <label>
          <span>Content</span>
          <textarea v-model="editContent" rows="6" maxlength="1200"></textarea>
        </label>

        <section class="edit-image-panel">
          <span>Post pictures</span>
          <div class="edit-image-content">
            <div v-if="editImagePreviews.length" class="edit-image-preview-grid">
              <button
                v-for="(image, index) in editImagePreviews"
                :key="`${image}-${index}`"
                type="button"
                class="edit-image-preview"
              >
                <img :src="image" :alt="`Post image preview ${index + 1}`" />
                <span class="preview-badge">Preview</span>
              </button>
            </div>
            <div v-else class="edit-image-preview">
              <ImagePlus />
            </div>
            <div class="edit-image-copy">
              <strong>{{ editImageLabel }}</strong>
              <p>
                Use JPEG, PNG, or WebP images under 5 MB each. Choosing new images replaces the
                current gallery.
              </p>
              <button type="button" class="image-action" @click="editImageInput?.click()">
                <Camera />
                Choose images
              </button>
              <input
                ref="editImageInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="sr-only"
                @change="handleEditImageChange"
              />
            </div>
          </div>
        </section>

        <div class="edit-grid">
          <label>
            <span>Visibility radius</span>
            <select v-model.number="editRadius">
              <option :value="50">50m</option>
              <option :value="100">100m</option>
              <option :value="200">200m</option>
            </select>
          </label>

          <label>
            <span>Extend lifetime</span>
            <select v-model="editDuration">
              <option
                v-for="duration in durationOptions"
                :key="duration.value"
                :value="duration.value"
              >
                {{ duration.label }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="editError" class="edit-error">{{ editError }}</p>

        <div class="modal-actions">
          <button type="button" class="secondary-action" @click="closeEditPost">Cancel</button>
          <button type="submit" class="save-action" :disabled="savingEdit">
            {{ savingEdit ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-vue-next'
import CommentSection from './CommentSection.vue'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PostOptionsMenu from '@/components/PostOptionsMenu.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import PostImageViewer from '@/components/PostImageViewer.vue'
import { commentApi, postApi, type ApiComment, type ApiPost } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useGeolocation } from '@/composables/useGeolocation'

type ViewComment = {
  id: number
  name: string
  userId: number | null
  avatar: string | null
  initials: string
  time: string
  color: string
  body: string
  likes: number
  showReply: boolean
  replyText: string
  replies: ViewReply[]
}

type ViewReply = {
  name: string
  initials: string
  time: string
  color: string
  body: string
}

type DetailPost = ApiPost & {
  upvoted: boolean
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const geo = useGeolocation()

const post = ref<DetailPost | null>(null)
const comments = ref<ViewComment[]>([])
const sortBy = ref('top')
const loading = ref(false)
const error = ref('')
const commentSubmitting = ref(false)
const commentError = ref('')
const editError = ref('')
const savingEdit = ref(false)
const editingPost = ref(false)
const editTitle = ref('')
const editContent = ref('')
const editRadius = ref(100)
const editDuration = ref('none')
const editImageFiles = ref<File[]>([])
const editImagePreviews = ref<string[]>([])
const editImageInput = ref<HTMLInputElement | null>(null)
const durationOptions = [
  { value: 'none', label: 'No extension' },
  { value: '3h', label: '3h' },
  { value: '6h', label: '6h' },
  { value: '12h', label: '12h' },
  { value: '24h', label: '24h' },
] as const
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
let editImageObjectUrls: string[] = []
const commentSectionRef = ref<InstanceType<typeof CommentSection> | null>(null)
const highlightCommentId = computed(() => {
  const commentId = Number(route.query.commentId)
  return Number.isInteger(commentId) && commentId > 0 ? commentId : null
})

const hasPostId = computed(() => {
  const postId = Number(route.params.postId)
  return Number.isInteger(postId) && postId > 0
})
const commentCount = computed(() => comments.value.length)
const reactionsCount = computed(
  () => post.value?.reactions?.length ?? post.value?.reactions_count ?? 0,
)
const postImageUrls = computed(() =>
  post.value?.image_urls?.length
    ? post.value.image_urls
    : post.value?.image_url
      ? [post.value.image_url]
      : [],
)
const currentUserId = computed(() => auth.user?.userId ?? auth.user?.user_id ?? null)
const isPostOwner = computed(
  () =>
    post.value?.user?.user_id !== undefined &&
    currentUserId.value !== null &&
    post.value.user.user_id === currentUserId.value,
)
const editImageLabel = computed(() => {
  if (editImageFiles.value.length > 0) {
    return `${editImageFiles.value.length} new image${editImageFiles.value.length === 1 ? '' : 's'} selected`
  }

  if (editImagePreviews.value.length > 0) {
    return `${editImagePreviews.value.length} current image${editImagePreviews.value.length === 1 ? '' : 's'}`
  }

  return 'Add post pictures'
})
const postParagraphs = computed(() =>
  (post.value?.content || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
)

const tips = [
  'Be specific and respectful.',
  'Add information that helps move the conversation forward.',
  'Use report controls if a response feels unsafe.',
]

function toggleUpvote() {
  if (!post.value) return
  post.value.upvoted = !post.value.upvoted
}

function focusReply() {
  commentSectionRef.value?.focusMainReply()
}

async function addComment(text: string) {
  if (!text.trim() || !post.value) return

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
          profile_image: auth.user?.profile_image || null,
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
  router.back()
}

function goToProfile(userId?: number | null) {
  if (!userId) return
  router.push(`/users/${userId}`)
}

function durationToMs(duration: string) {
  const amount = Number(duration.replace('h', ''))
  return amount * 60 * 60 * 1000
}

function contentWithoutImageUrls(content: string, imageUrls: string[]) {
  if (imageUrls.length === 0) return content

  return imageUrls.reduce((cleanContent, imageUrl) => {
    const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return cleanContent.replace(new RegExp(`\\s*${escapedUrl}\\s*$`), '').trimEnd()
  }, content)
}

function openEditPost() {
  if (!post.value || !isPostOwner.value) return

  clearEditImageSelection()
  editTitle.value = post.value.title
  editContent.value = contentWithoutImageUrls(post.value.content, postImageUrls.value)
  editRadius.value = post.value.visibility_radius
  editDuration.value = 'none'
  editImagePreviews.value = postImageUrls.value
  editError.value = ''
  editingPost.value = true
}

function removeEditQuery() {
  if (route.query.edit === undefined) return

  const nextQuery = { ...route.query }
  delete nextQuery.edit
  void router.replace({ query: nextQuery })
}

function closeEditPost() {
  if (savingEdit.value) return
  editingPost.value = false
  editError.value = ''
  clearEditImageSelection()
  removeEditQuery()
}

function clearEditImageSelection() {
  editImageObjectUrls.forEach((url) => URL.revokeObjectURL(url))
  editImageObjectUrls = []

  editImageFiles.value = []
  editImagePreviews.value = []
  if (editImageInput.value) {
    editImageInput.value.value = ''
  }
}

function handleEditImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return

  if (files.some((file) => !allowedImageTypes.includes(file.type))) {
    editError.value = 'Post image must be a JPEG, PNG, or WebP file.'
    input.value = ''
    return
  }

  if (files.some((file) => file.size > 5 * 1024 * 1024)) {
    editError.value = 'Post image must be smaller than 5 MB.'
    input.value = ''
    return
  }

  editImageObjectUrls.forEach((url) => URL.revokeObjectURL(url))
  const selectedFiles = files.slice(0, 6)

  editImageObjectUrls = selectedFiles.map((file) => URL.createObjectURL(file))
  editImageFiles.value = selectedFiles
  editImagePreviews.value = editImageObjectUrls
  editError.value = ''
}

async function savePostEdit() {
  if (!post.value || savingEdit.value) return

  const title = editTitle.value.trim()
  const content = editContent.value.trim()
  if (!title || !content) {
    editError.value = 'Title and content are required.'
    return
  }

  savingEdit.value = true
  editError.value = ''

  try {
    const payload = {
      title,
      content,
      visibility_radius: editRadius.value,
      ...(editDuration.value === 'none'
        ? {}
        : { expires_at: new Date(Date.now() + durationToMs(editDuration.value)).toISOString() }),
    }
    const updated = await postApi.update(post.value.post_id, payload, editImageFiles.value)

    post.value = {
      ...post.value,
      ...updated,
      user: updated.user ?? post.value.user,
      upvoted: post.value.upvoted,
    }
    editingPost.value = false
    clearEditImageSelection()
    removeEditQuery()
  } catch (err: unknown) {
    editError.value = err instanceof Error ? err.message : 'Failed to update post.'
  } finally {
    savingEdit.value = false
  }
}

function handlePostDeleted() {
  void router.replace('/discussions')
}

async function loadPostDetail() {
  const postId = Number(route.params.postId)

  if (!Number.isInteger(postId) || postId <= 0) {
    error.value = 'Open any post from the feed or My Posts to view its discussion here.'
    post.value = null
    comments.value = []
    return
  }

  loading.value = true
  error.value = ''
  commentError.value = ''

  try {
    const position = await geo.request()
    const postData = await postApi.get(postId, position)
    const commentData = await commentApi.listByPost(postId)

    post.value = {
      ...postData,
      upvoted: false,
    }
    comments.value = commentData.filter(isActiveComment).map(toViewComment)
    if (route.query.edit === '1' && post.value.user?.user_id === currentUserId.value) {
      openEditPost()
    }
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
    avatar: comment.user?.profile_image ?? null,
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
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function timeLeft(value: string) {
  const diffMs = new Date(value).getTime() - Date.now()
  if (diffMs <= 0) return 'Expired'
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.ceil(minutes / 60)
  return `${hours}h`
}

onMounted(loadPostDetail)
onBeforeUnmount(clearEditImageSelection)
watch(() => route.params.postId, loadPostDetail)
watch(
  () => route.query.edit,
  (editMode) => {
    if (editMode === '1') openEditPost()
  },
)
</script>

<style scoped>
.discussion-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #20384c;
}

.page-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  --accent: #0f8179;
  --accent-dark: #0b6963;
  --accent-light: #e8f6f5;
  --border: #e0e9ef;
  --card: #fff;
  --text: #172b3e;
  --text-muted: #71869a;
  --radius: 18px;
  --shadow: 0 8px 24px rgba(20, 45, 70, 0.045);
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 22px clamp(16px, 3vw, 40px) 48px;
}

.page-heading {
  max-width: 880px;
  margin-bottom: 22px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  padding: 0;
  color: #687f92;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
}

.back-button:hover {
  color: var(--accent);
}

.back-button svg {
  width: 16px;
  height: 16px;
}

.heading-copy {
  margin-top: 19px;
}

.eyebrow,
.post-time,
.author-copy span,
.expiry-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.eyebrow {
  color: #0e7c86;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.eyebrow svg {
  width: 15px;
  height: 15px;
}

.heading-copy h1 {
  margin: 7px 0 0;
  color: var(--text);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.heading-copy p {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;
}

.discussion-column {
  min-width: 0;
}

.post-card,
.side-card,
.state-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: var(--shadow);
}

.post-card {
  padding: clamp(20px, 3vw, 30px);
}

.post-topline,
.post-labels,
.author-row,
.post-actions {
  display: flex;
  align-items: center;
}

.post-topline {
  justify-content: space-between;
  gap: 15px;
}

.post-labels {
  flex-wrap: wrap;
  gap: 10px;
}

.post-tag {
  border-radius: 999px;
  background: var(--accent-light);
  padding: 5px 10px;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-time {
  color: #8394a3;
  font-size: 0.72rem;
  font-weight: 700;
}

.post-time svg,
.author-copy span svg,
.expiry-note svg {
  width: 14px;
  height: 14px;
}

.author-row {
  gap: 11px;
  margin-top: 20px;
}

.author-link,
.author-name {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.author-link:disabled,
.author-name:disabled {
  cursor: default;
}

.author-avatar {
  width: 43px;
  height: 43px;
  border-radius: 14px;
  font-size: 1rem;
}

.author-copy {
  min-width: 0;
}

.author-name {
  display: block;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 850;
}

.author-name:not(:disabled):hover {
  color: var(--accent);
}

.author-copy span {
  margin-top: 4px;
  color: #8294a4;
  font-size: 0.7rem;
  font-weight: 650;
}

.post-title {
  max-width: 820px;
  margin: 22px 0 0;
  color: var(--text);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.post-body {
  max-width: 76ch;
  margin-top: 15px;
}

.post-body p {
  margin: 0 0 13px;
  color: #40576b;
  font-size: 0.93rem;
  line-height: 1.75;
}

.post-image {
  margin-top: 20px;
}

.post-actions {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
  border-top: 1px solid #edf2f5;
  padding-top: 16px;
}

.post-actions button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 10px;
  background: #f3f7f9;
  padding: 9px 11px;
  color: #667d90;
  cursor: pointer;
}

.post-actions button:hover,
.post-actions button.active {
  background: var(--accent-light);
  color: var(--accent);
}

.post-actions button svg {
  width: 16px;
  height: 16px;
}

.post-actions button span {
  font-size: 0.78rem;
  font-weight: 850;
}

.post-actions button small {
  font-size: 0.72rem;
  font-weight: 700;
}

.expiry-note {
  margin-left: auto;
  color: #8193a2;
  font-size: 0.72rem;
  font-weight: 750;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(8px);
}

.edit-modal {
  width: min(590px, 100%);
  border: 1px solid var(--border);
  border-radius: 24px;
  background: #fff;
  padding: clamp(20px, 4vw, 28px);
  box-shadow: 0 24px 70px rgba(15, 38, 60, 0.22);
}

.modal-heading,
.modal-actions,
.edit-grid {
  display: flex;
}

.modal-heading {
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-heading h2 {
  margin: 5px 0 0;
  color: var(--text);
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.025em;
}

.modal-heading p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.modal-close {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: #f3f7f9;
  color: #61788c;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.edit-modal label {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.edit-modal label span,
.edit-image-panel > span {
  color: #29495d;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.edit-modal input,
.edit-modal textarea,
.edit-modal select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #f8fbfd;
  padding: 12px 13px;
  color: var(--text);
  font: inherit;
  font-size: 0.9rem;
  outline: none;
}

.edit-modal textarea {
  resize: vertical;
}

.edit-image-panel {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.edit-image-content {
  display: grid;
  grid-template-columns: minmax(132px, 180px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #f8fbfd;
  padding: 12px;
}

.edit-image-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
}

.edit-image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 0;
  border-radius: 14px;
  background: #edf5f7;
  color: var(--accent);
  padding: 0;
}

.edit-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.preview-badge {
  position: absolute;
  right: 7px;
  bottom: 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  padding: 4px 7px;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.edit-image-preview svg {
  width: 28px;
  height: 28px;
}

.edit-image-copy strong {
  display: block;
  overflow: hidden;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-image-copy p {
  margin: 5px 0 11px;
  color: var(--text-muted);
  font-size: 0.76rem;
  line-height: 1.5;
}

.image-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 12px;
  background: var(--accent-light);
  padding: 9px 12px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 850;
  cursor: pointer;
}

.image-action svg {
  width: 15px;
  height: 15px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.edit-grid {
  gap: 12px;
}

.edit-grid > label {
  flex: 1;
}

.edit-error {
  margin: 12px 0 0;
  border-radius: 12px;
  background: #fff2f2;
  padding: 10px 12px;
  color: #b74444;
  font-size: 0.76rem;
  font-weight: 750;
}

.modal-actions {
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.secondary-action,
.save-action {
  border: 0;
  border-radius: 13px;
  padding: 11px 15px;
  font-size: 0.78rem;
  font-weight: 850;
  cursor: pointer;
}

.secondary-action {
  background: #eef4f7;
  color: #60778a;
}

.save-action {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 10px 24px rgba(15, 129, 121, 0.18);
}

.save-action:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.detail-sidebar {
  display: grid;
  gap: 14px;
  position: sticky;
  top: 84px;
}

.side-card {
  padding: 18px;
}

.side-eyebrow {
  color: #0e7c86;
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.side-card h2 {
  margin: 6px 0 0;
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 850;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-top: 15px;
}

.stat-grid div {
  min-width: 0;
  border-radius: 12px;
  background: #f5f8fa;
  padding: 11px 6px;
  text-align: center;
}

.stat-grid strong,
.stat-grid span {
  display: block;
}

.stat-grid strong {
  overflow: hidden;
  color: var(--text);
  font-size: 1rem;
  font-weight: 900;
  text-overflow: ellipsis;
}

.stat-grid span {
  margin-top: 3px;
  color: #8a9aa8;
  font-size: 0.58rem;
  font-weight: 750;
  text-transform: uppercase;
}

.privacy-card {
  display: flex;
  gap: 12px;
  background: #f7fcfc;
}

.side-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e2f3f2;
  color: var(--accent);
}

.side-icon svg {
  width: 18px;
  height: 18px;
}

.privacy-card p {
  margin: 7px 0 0;
  color: var(--text-muted);
  font-size: 0.75rem;
  line-height: 1.55;
}

.tips-list {
  display: grid;
  gap: 11px;
  margin: 15px 0 0;
  padding: 0;
  list-style: none;
}

.tips-list li {
  display: grid;
  grid-template-columns: 17px minmax(0, 1fr);
  gap: 8px;
  color: #647b8e;
  font-size: 0.75rem;
  line-height: 1.5;
}

.tips-list svg {
  width: 16px;
  height: 16px;
  margin-top: 1px;
  color: #2d9288;
}

.state-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 36px 22px;
  text-align: center;
}

.state-icon {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  background: #eaf6f6;
  color: #0e7c86;
}

.state-icon svg {
  width: 25px;
  height: 25px;
}

.state-card h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 850;
}

.state-card p {
  max-width: 480px;
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.6;
}

.state-card a,
.state-card button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 11px;
  background: var(--accent);
  padding: 10px 14px;
  color: #fff;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.state-card a:hover,
.state-card button:hover {
  background: var(--accent-dark);
}

.state-card a svg,
.state-card button svg {
  width: 16px;
  height: 16px;
}

.loading-mark {
  width: 36px;
  height: 36px;
  border: 3px solid #d9e8e9;
  border-top-color: var(--accent);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1080px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: static;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .workspace {
    padding: 18px 14px 96px;
  }

  .detail-sidebar {
    grid-template-columns: 1fr;
  }

  .post-card {
    padding: 18px 16px;
  }

  .post-actions {
    align-items: stretch;
  }

  .expiry-note {
    width: 100%;
    margin: 5px 0 0;
  }
}

@media (max-width: 480px) {
  .post-topline {
    align-items: flex-start;
  }

  .post-actions button {
    flex: 1;
    justify-content: center;
  }

  .post-actions button small {
    display: none;
  }
}
</style>
