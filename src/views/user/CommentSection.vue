<template>
  <div>
    <div class="section-header">
      <span class="section-title">Neighbor Conversations</span>
      <select class="sort-select" :value="sortBy" @change="updateSortBy">
        <option value="top">Top</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>

    <p v-if="errorMessage" class="comment-error">{{ errorMessage }}</p>

    <div
      v-for="(c, ci) in sortedComments"
      :key="c.id"
      class="comment-card"
      :style="{ animationDelay: ci * 0.06 + 's' }"
    >
      <div class="comment-header">
        <button
          class="comment-avatar comment-author-link"
          :style="{ background: c.color }"
          type="button"
          @click="goToProfile(c.userId)"
        >
          {{ c.initials }}
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
      <div v-if="c.showReply" style="margin-top:12px; margin-left:24px;">
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
    <div class="reply-input-row" style="margin-top:20px;">
      <div class="author-avatar" style="width:34px;height:34px;font-size:0.78rem;flex-shrink:0;">{{ currentUserInitials }}</div>
      <input
        ref="mainReplyInput"
        class="reply-input"
        placeholder="Add to the conversation..."
        v-model="mainReplyText"
        @keyup.enter="addComment"
      />
      <button class="send-btn" @click="addComment">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CommentOptionsMenu from '@/components/CommentOptionsMenu.vue'

const props = defineProps({
  comments: {
    type: Array,
    required: true
  },
  sortBy: {
    type: String,
    default: 'top'
  },
  submitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:sort-by', 'add-comment', 'submit-reply'])

const auth = useAuthStore()
const router = useRouter()
const mainReplyText = ref('')
const mainReplyInput = ref<HTMLInputElement | null>(null)
const currentUserInitials = computed(() => initials(auth.user?.username || 'Neighbor'))

// Computed sorted comments
const sortedComments = computed(() => {
  const list = [...props.comments] as Array<any>
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

function likeComment(comment: any) {
  comment.likes++
}

function toggleReply(comment: any) {
  comment.showReply = !comment.showReply
}

function submitReply(comment: any) {
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

function initials(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'N'
}

// Expose focus method to parent
defineExpose({
  focusMainReply
})
</script>

<style scoped>

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 14px;
}
.section-title {
  color: var(--text, #172033);
  font-size: 1rem;
  font-weight: 950;
}
.sort-select {
  font-size: 0.78rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  border-radius: 999px;
  padding: 7px 11px;
  cursor: pointer;
  outline: none;
}

.comment-card {
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px 18px;
  box-shadow: var(--shadow);
  margin-bottom: 12px;
  animation: fadeUp .35s ease both;
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
  border: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  flex-shrink: 0;
}
.comment-author-link {
  cursor: pointer;
}
.comment-author-link:hover {
  filter: brightness(0.95);
}
.comment-copy {
  min-width: 0;
  flex: 1;
}
.comment-name {
  color: var(--text, #172033);
  font-weight: 900;
  font-size: 0.88rem;
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
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 4px;
}
.comment-body {
  font-size: 0.88rem;
  line-height: 1.68;
  color: #334155;
  margin-bottom: 10px;
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
  font-family: 'DM Sans', sans-serif;
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
  font-weight: 600;
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
  border-radius: 50px;
  padding: 8px 8px 8px 16px;
  box-shadow: var(--shadow);
  margin-top: 16px;
}
.reply-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
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
  transition: background .2s, transform .15s;
  flex-shrink: 0;
}
.send-btn:hover {
  background: var(--accent-dark, #164e63);
  transform: scale(1.07);
}
.send-btn svg {
  width: 16px;
  height: 16px;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #0f766e), #22c1b6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
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
    border-radius: 18px;
    padding-left: 12px;
  }
}
</style>
