<template>
  <Navbar />
  <div class="discussion-layout">
    <AppSidebar class="hidden md:flex" />
    <div class="page">
    <!-- LEFT COLUMN -->
    <div>
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <!-- MAIN POST -->
      <div class="post-card">
        <div class="post-meta">
          <span class="post-tag">
            <i class="bi bi-tools"></i> Maintenance
          </span>
          <span class="post-time"><i class="bi bi-clock"></i> {{ post.time }}</span>
        </div>

        <h1 class="post-title">{{ post.title }}</h1>

        <div class="author-row">
          <div class="author-avatar">{{ post.author.initials }}</div>
          <div>
            <div class="author-name">{{ post.author.name }}</div>
            <div class="author-sub">
              {{ post.author.distance }} &bull;
              <span class="verified-badge">✓ Verified Resident</span>
            </div>
          </div>
        </div>

        <div class="post-body">
          <p v-for="(para, i) in post.body" :key="i">{{ para }}</p>
        </div>

        <div class="post-actions">
          <button class="action-btn" :class="{ upvoted: post.upvoted }" @click="toggleUpvote">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            {{ post.upvotes }} Upvotes
          </button>
          <button class="action-btn" @click="focusReply">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {{ commentCount }} Comments
          </button>
          <div class="share-btns">
            <button class="share-btn">Share</button>
            <button class="share-btn">Thread</button>
          </div>
        </div>
      </div>

      <!-- CONVERSATIONS SECTION -->
      <CommentSection
        ref="commentSectionRef"
        :comments="comments"
        :sort-by="sortBy"
        @update:sort-by="sortBy = $event"
        @add-comment="addComment"
        @submit-reply="submitReply"
      />
    </div>

    <!-- SIDEBAR -->
    <div class="sidebar">
      <!-- LIVE PULSE -->
      <div class="sidebar-card">
        <div class="sidebar-title">Live Community Pulse</div>
        <div class="pulse-label">
          Support Strength <span class="pulse-pct">High ({{ pulse.pct }}%)</span>
        </div>
        <div class="pulse-bar-track">
          <div class="pulse-bar-fill" :style="{ width: pulse.pct + '%' }"></div>
        </div>
        <div class="pulse-stats">
          <div class="stat-box">
            <div class="stat-num">{{ pulse.voters }}</div>
            <div class="stat-label">Active Voters</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ pulse.trend }}d</div>
            <div class="stat-label">Trend Age</div>
          </div>
        </div>
      </div>

      <!-- LOCATION IMPACT -->
      <div class="location-card">
        <div class="location-grid"></div>
        <div class="location-overlay">
          <div class="location-sub">Location Impact</div>
          <div class="location-name">West Gate Entrance</div>
        </div>
      </div>

      <!-- DISCUSSION TIPS -->
      <div class="sidebar-card">
        <div class="sidebar-title"><i class="bi bi-lightbulb"></i> Discussion Tips</div>
        <div class="tips-list">
          <div class="tip-item" v-for="t in tips" :key="t.icon">
            <div class="tip-icon">
              <i class="bi" :class="t.icon"></i>
            </div>
            <span>{{ t.text }}</span>
          </div>
        </div>
      </div>

      <!-- RELATED TOPICS -->
      <div class="sidebar-card">
        <div class="sidebar-title"><i class="bi bi-link-45deg"></i> Related Topics</div>
        <div class="related-list">
          <div class="related-item" v-for="r in related" :key="r.title">
            <span class="related-title">{{ r.title }}</span>
            <span class="related-meta">{{ r.meta }}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommentSection from './CommentSection.vue'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'


// Post data
const post = ref({
  title: 'Improving the West Gate lighting',
  time: '2 hours ago',
  upvotes: 24,
  upvoted: false,
  author: { name: 'Marcus Chen', initials: 'MC', distance: '3 blocks away' },
  body: [
    "I've noticed that the lighting around the West Gate entrance has been flickering significantly over the past week. It feels quite dark near the pedestrian walkway after 8 PM, which might be a safety concern for those walking dogs or returning from late shifts.",
    "I suggest we look into transitioning those fixtures to high-efficiency LED units with motion sensors. Not only would it improve visibility, but it would also lower our communal energy costs in the long run. Does anyone else feel the same, or have experience with the current vendor?"
  ]
})

// Comments data
const comments = ref([
  {
    id: 1,
    name: 'Sarah Miller',
    initials: 'SM',
    time: '1 hour ago',
    color: 'linear-gradient(135deg,#c77c3e,#e6a254)',
    body: "Completely agree, Marcus. I walk my retriever there every night and the shadows make the uneven pavement hard to see. LEDs would be a great upgrade!",
    likes: 8,
    showReply: false,
    replyText: '',
    replies: [
      {
        name: 'David Vance',
        initials: 'DV',
        time: '45 mins ago',
        color: 'linear-gradient(135deg,#2d6a4f,#52b788)',
        body: "I actually work in smart lighting — I could help the board vet a few cost-effective options if we decide to move forward."
      }
    ]
  },
  {
    id: 2,
    name: 'Jason K.',
    initials: 'JK',
    time: '30 mins ago',
    color: 'linear-gradient(135deg,#3a5f8a,#5b8fc4)',
    body: "Has anyone checked if it's just a bulb or a wiring issue? If it's wiring, we might need a full inspection before just swapping the units.",
    likes: 2,
    showReply: false,
    replyText: '',
    replies: []
  }
])

const sortBy = ref('top')
const commentSectionRef = ref(null)

// Computed comment count
const commentCount = computed(() => comments.value.length)

// Pulse data
const pulse = ref({ pct: 88, voters: 14, trend: 2 })

// Static sidebar data
const tips = [
  { icon: 'bi-geo', text: "Stay polite and constructive; we're all neighbors here." },
  { icon: 'bi-geo-alt', text: "Suggest solutions alongside identifying problems." },
  { icon: 'bi-people', text: "Mention neighbors who might have relevant expertise." }
]

const related = [
  { title: 'Shared Garden Irrigation', meta: '8 active voices · Utilities' },
  { title: 'Visitor Parking Rules', meta: '15 active voices · Community' }
]

// Methods
function toggleUpvote() {
  post.value.upvoted = !post.value.upvoted
  post.value.upvotes += post.value.upvoted ? 1 : -1
}

function focusReply() {
  commentSectionRef.value?.focusMainReply()
}

function addComment(text) {
  if (!text.trim()) return
  comments.value.push({
    id: Date.now(),
    name: 'You',
    initials: 'JD',
    time: 'just now',
    color: 'linear-gradient(135deg,#6b4f9e,#9b78d4)',
    body: text,
    likes: 0,
    showReply: false,
    replyText: '',
    replies: []
  })
}

function submitReply(comment, text) {
  if (!text.trim()) return
  comment.replies.push({
    name: 'You',
    initials: 'JD',
    time: 'just now',
    color: 'linear-gradient(135deg,#6b4f9e,#9b78d4)',
    body: text
  })
  comment.replyText = ''
  comment.showReply = false
}

function goBack() {
  window.history.back()
}
</script>

<style scoped>
.discussion-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f6f1ea;
}

.page {
  --accent: #2d6a4f;
  --accent-light: #e7f3ec;
  --border: #e4ded5;
  --card: #fffaf4;
  --radius: 18px;
  --shadow: 0 18px 45px rgba(63, 47, 28, 0.09);
  --tag-bg: #eef7f2;
  --tag-text: #2d6a4f;
  --text: #28231f;
  --text-muted: #82786f;
  min-height: calc(100vh - 64px);
  position: relative;
  isolation: isolate;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  color: var(--text);
}

.page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: #f6f1ea;
}

/* BACK BTN */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 18px;
  padding: 0;
  transition: color .2s;
}
.back-btn:hover {
  color: var(--accent);
}
.back-btn svg {
  width: 16px;
  height: 16px;
}

/* MAIN POST CARD */
.post-card {
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 28px 30px 20px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}
.post-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent);
  border-radius: 4px 0 0 4px;
}

.post-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
}
.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.post-time {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.38rem;
  font-weight: 700;
  margin: 14px 0 8px;
  line-height: 1.3;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2d6a4f 30%, #c77c3e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.author-name {
  font-weight: 600;
  font-size: 0.92rem;
}
.author-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 1px;
}
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 600;
}

.post-body p {
  font-size: 0.92rem;
  line-height: 1.75;
  color: #3a3630;
  margin-bottom: 12px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.84rem;
  color: var(--text-muted);
  padding: 6px 10px;
  border-radius: 8px;
  transition: background .2s, color .2s;
  font-weight: 500;
}
.action-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}
.action-btn.upvoted {
  color: var(--accent);
  font-weight: 600;
}
.action-btn svg {
  width: 16px;
  height: 16px;
}
.share-btns {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.share-btn {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 6px;
  transition: background .2s;
}
.share-btn:hover {
  background: var(--border);
}

/* SIDEBAR */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 20px;
  box-shadow: var(--shadow);
}
.sidebar-title {
  font-family: 'Playfair Display', serif;
  font-size: 0.98rem;
  font-weight: 700;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
}

/* PULSE */
.pulse-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 5px;
}
.pulse-bar-track {
  background: var(--border);
  border-radius: 99px;
  height: 7px;
  overflow: hidden;
}
.pulse-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #2d6a4f, #52b788);
  transition: width .6s ease;
}
.pulse-pct {
  float: right;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  margin-top: -1px;
}
.pulse-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}
.stat-box {
  background: #f9f7f4;
  border-radius: 10px;
  text-align: center;
  padding: 12px 8px;
}
.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}
.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
  font-weight: 600;
}

/* LOCATION CARD */
.location-card {
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  height: 140px;
  background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #c77c3e 100%);
}
.location-grid {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(255,255,255,.15) 14px, rgba(255,255,255,.15) 15px), repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,.15) 14px, rgba(255,255,255,.15) 15px);
}
.location-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
}
.location-sub {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}
.location-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 700;
  margin-top: 2px;
}

/* TIPS */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 0.82rem;
  color: #4a4540;
  line-height: 1.5;
}
.tip-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  margin-top: 1px;
}

/* RELATED */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.related-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f9f7f4;
  cursor: pointer;
  transition: background .2s;
}
.related-item:hover {
  background: var(--accent-light);
}
.related-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.related-meta {
  font-size: 0.73rem;
  color: var(--text-muted);
}

/* RESPONSIVE */
@media (max-width: 750px) {
  .page {
    grid-template-columns: 1fr;
  }
  .sidebar {
    order: -1;
  }
}
</style>
