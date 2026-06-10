<template>
  <section class="comments-panel">
    <div class="section-header">
      <div>
        <span class="section-kicker">Responses</span>
        <span class="section-title">Discussion</span>
      </div>
      <select class="sort-select" :value="sortBy" @change="updateSortBy">
        <option value="top">Top</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>

    <p v-if="errorMessage" class="comment-error">{{ errorMessage }}</p>

    <div v-if="sortedComments.length === 0" class="comments-empty">
      <MessageCircle />
      <div>
        <strong>No responses yet</strong>
        <span>Start the conversation with something helpful.</span>
      </div>
    </div>

    <div
      v-for="(c, ci) in sortedComments"
      :key="c.id"
      class="comment-card"
      :style="{ animationDelay: ci * 0.06 + 's' }"
    >
      <div class="comment-header">
        <button
          class="comment-author-link"
          type="button"
          @click="goToProfile(c.userId)"
        >
          <UserAvatar
            :src="c.avatar"
            :username="c.name"
            :alt="`${c.name} profile`"
            class="comment-avatar"
          />
        </button>
        <div class="comment-copy">
          <button class="comment-name comment-name-button" type="button" @click="goToProfile(c.userId)">
            {{ c.name }}
          </button>
          <span class="comment-time">· {{ c.time }}</span>
        </div>
        <CommentOptionsMenu class="comment-menu" :comment-id="c.id" />
      </div>
      <div class="comment-body">{{ c.body }}</div>
      <div class="comment-footer">
        <button class="reply-btn" @click="toggleReply(c)">Reply</button>
        <button class="like-btn" @click="likeComment(c)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
          </svg>
          {{ c.likes }}
        </button>
      </div>

      <!-- NESTED REPLIES -->
      <div v-for="(r, ri) in c.replies" :key="ri" class="nested-reply">
        <div class="comment-header">
          <div class="comment-avatar" :style="{ background: r.color }">{{ r.initials }}</div>
          <div>
            <span class="comment-name">{{ r.name }}</span>
            <span class="comment-time">· {{ r.time }}</span>
          </div>
        </div>
        <div class="comment-body">{{ r.body }}</div>
      </div>

      <!-- INLINE REPLY INPUT -->
      <div v-if="c.showReply" class="inline-reply">
        <div class="reply-input-row">
          <input
            class="reply-input"
            :placeholder="'Reply to ' + c.name + '...'"
            v-model="c.replyText"
            @keyup.enter="submitReply(c)"
          />
          <button class="send-btn" @click="submitReply(c)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN REPLY INPUT -->
    <div class="reply-input-row main-reply">
      <UserAvatar
        :src="currentUserAvatar"
        :username="auth.user?.username || 'Neighbor'"
        :alt="`${auth.user?.username || 'Neighbor'} profile`"
        class="current-user-avatar"
      />
      <input
        ref="mainReplyInput"
        class="reply-input"
        placeholder="Add to the conversation..."
        v-model="mainReplyText"
        @keyup.enter="addComment"
      />
      <button class="send-btn" :disabled="submitting" @click="addComment">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CommentOptionsMenu from '@/components/CommentOptionsMenu.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { MessageCircle } from 'lucide-vue-next'

type ReplyItem = {
  name: string
  initials: string
  time: string
  color: string
  body: string
}

type CommentItem = {
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
  replies: ReplyItem[]
}

const props = withDefaults(
  defineProps<{
    comments: CommentItem[]
    sortBy?: string
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    sortBy: 'top',
    submitting: false,
    errorMessage: '',
  },
)

const emit = defineEmits<{
  'update:sort-by': [value: string]
  'add-comment': [text: string]
  'submit-reply': [comment: CommentItem, text: string]
}>()

const auth = useAuthStore()
const router = useRouter()
const mainReplyText = ref('')
const mainReplyInput = ref<HTMLInputElement | null>(null)
const currentUserAvatar = computed(() => {
  const profile = auth.user?.profile as { profile_image?: string | null } | undefined
  return auth.user?.profile_image || profile?.profile_image || null
})

// Computed sorted comments
const sortedComments = computed(() => {
  const list = [...props.comments]
  if (props.sortBy === 'top') {
    return list.sort((a, b) => b.likes - a.likes)
  }
  if (props.sortBy === 'newest') {
    return list.sort((a, b) => b.id - a.id)
  }
  return list.sort((a, b) => a.id - b.id)
})

function updateSortBy(event: Event) {
  emit('update:sort-by', (event.target as HTMLSelectElement).value)
}

function goToProfile(userId?: number | null) {
  if (!userId) return
  router.push(`/users/${userId}`)
}

function likeComment(comment: CommentItem) {
  comment.likes++
}

function toggleReply(comment: CommentItem) {
  comment.showReply = !comment.showReply
}

function submitReply(comment: CommentItem) {
  if (!comment.replyText.trim()) return
  emit('submit-reply', comment, comment.replyText)
}

function addComment() {
  if (props.submitting) return
  if (!mainReplyText.value.trim()) return
  emit('add-comment', mainReplyText.value)
  mainReplyText.value = ''
}

function focusMainReply() {
  mainReplyInput.value?.focus()
}

// Expose focus method to parent
defineExpose({
  focusMainReply
})
</script>

<style scoped>
.comments-panel {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
}

.section-header > div {
  display: grid;
  gap: 2px;
}

.section-kicker {
  color: var(--accent, #0f766e);
  font-size: 0.64rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-title {
  color: var(--text, #172033);
  font-size: 1.08rem;
  font-weight: 850;
}

.sort-select {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  padding: 8px 10px;
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.comment-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  padding: 16px 18px;
  margin-bottom: 12px;
  box-shadow: 0 6px 18px rgba(20, 45, 70, 0.035);
  animation: fadeUp 0.3s ease both;
}

.comments-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  border: 1px dashed #d5e2e8;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.62);
  padding: 18px;
  color: #7a8f9f;
}

.comments-empty > svg {
  width: 22px;
  height: 22px;
  color: var(--accent, #0f766e);
}

.comments-empty strong,
.comments-empty span {
  display: block;
}

.comments-empty strong {
  color: var(--text, #172033);
  font-size: 0.82rem;
  font-weight: 850;
}

.comments-empty span {
  margin-top: 3px;
  font-size: 0.73rem;
}

.comment-error {
  margin: 0 0 12px;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  background: #fff1f2;
  color: #be123c;
  padding: 10px 12px;
  font-size: 0.82rem;
  font-weight: 800;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.comment-author-link {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.comment-author-link:hover {
  opacity: 0.86;
}

.comment-copy {
  min-width: 0;
  flex: 1;
}
.comment-name {
  color: var(--text, #172033);
  font-size: 0.85rem;
  font-weight: 850;
}
.comment-name-button {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.comment-name-button:hover {
  color: #0f766e;
}
.comment-menu {
  margin-left: auto;
}
.comment-time {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 0.72rem;
}

.comment-body {
  margin-bottom: 10px;
  color: #40576b;
  font-size: 0.86rem;
  line-height: 1.68;
}
.comment-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 3px 7px;
  transition: background .2s, color .2s;
}
.like-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}
.reply-btn {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 750;
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
  transition: background .2s;
}
.reply-btn:hover {
  background: var(--accent-light);
}

.nested-reply {
  margin-top: 12px;
  margin-left: 24px;
  background: #f8fafc;
  border-left: 3px solid var(--accent-light);
  border-radius: 0 10px 10px 0;
  padding: 14px 16px;
}

.inline-reply {
  margin-top: 12px;
  margin-left: 24px;
}
.nested-reply .comment-avatar {
  width: 30px;
  height: 30px;
  font-size: 0.72rem;
}
.nested-reply .comment-name {
  font-size: 0.82rem;
}
.nested-reply .comment-body {
  font-size: 0.83rem;
}

.reply-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 7px 7px 7px 13px;
  box-shadow: 0 6px 18px rgba(20, 45, 70, 0.035);
  margin-top: 16px;
}

.main-reply {
  margin-top: 18px;
}

.current-user-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.reply-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.88rem;
  background: transparent;
  color: var(--text);
}
.reply-input::placeholder {
  color: var(--text-muted);
}
.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.send-btn:hover {
  background: var(--accent-dark, #164e63);
  transform: scale(1.07);
}

.send-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}
.send-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .comment-card {
    padding: 14px;
  }

  .nested-reply {
    margin-left: 10px;
    padding: 12px;
  }

  .reply-input-row {
    padding-left: 12px;
  }

  .inline-reply {
    margin-left: 8px;
  }
}
</style>
