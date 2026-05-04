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
            <article class="post-card">
              <div class="post-meta">
                <span class="post-tag">Maintenance</span>
                <span class="post-time">{{ post.time }}</span>
              </div>

              <h1 class="post-title">{{ post.title }}</h1>

              <div class="author-row">
                <div class="author-avatar">{{ post.author.initials }}</div>
                <div>
                  <div class="author-name">{{ post.author.name }}</div>
                  <div class="author-sub">
                    {{ post.author.distance }} · <span class="verified-badge">Verified Resident</span>
                  </div>
                </div>
              </div>

              <div class="post-body">
                <p v-for="(para, i) in post.body" :key="i">{{ para }}</p>
              </div>

              <div class="post-actions">
                <button class="action-btn" :class="{ upvoted: post.upvoted }" type="button" @click="toggleUpvote">
                  {{ post.upvotes }} Upvotes
                </button>
                <button class="action-btn" type="button" @click="focusReply">
                  {{ commentCount }} Comments
                </button>
                <span class="action-note">5 min read</span>
              </div>
            </article>

            <CommentSection
              ref="commentSectionRef"
              :comments="comments"
              :sort-by="sortBy"
              @update:sort-by="sortBy = $event"
              @add-comment="addComment"
              @submit-reply="submitReply"
            />
          </main>

          <aside class="detail-sidebar">
            <section class="side-card">
              <div class="side-title">Live Community Pulse</div>
              <div class="pulse-label">
                Support Strength <span>{{ pulse.pct }}%</span>
              </div>
              <div class="pulse-track">
                <div class="pulse-fill" :style="{ width: pulse.pct + '%' }"></div>
              </div>
              <div class="pulse-stats">
                <div>
                  <strong>{{ pulse.voters }}</strong>
                  <span>Active voters</span>
                </div>
                <div>
                  <strong>{{ pulse.trend }}d</strong>
                  <span>Trend age</span>
                </div>
              </div>
            </section>

            <section class="map-card">
              <div class="map-grid"></div>
              <div class="map-pin"></div>
              <div class="map-caption">
                <span>Location Impact</span>
                <strong>West Gate Entrance</strong>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommentSection from './CommentSection.vue'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const post = ref({
  title: 'Improving the West Gate lighting',
  time: '2 hours ago',
  upvotes: 24,
  upvoted: false,
  author: { name: 'Marcus Chen', initials: 'MC', distance: '3 blocks away' },
  body: [
    "I've noticed that the lighting around the West Gate entrance has been flickering significantly over the past week. It feels quite dark near the pedestrian walkway after 8 PM, which might be a safety concern for those walking dogs or returning from late shifts.",
    'I suggest we look into transitioning those fixtures to high-efficiency LED units with motion sensors. Not only would it improve visibility, but it would also lower our communal energy costs in the long run. Does anyone else feel the same?',
  ],
})

const comments = ref([
  {
    id: 1,
    name: 'Sarah Miller',
    initials: 'SM',
    time: '1 hour ago',
    color: 'linear-gradient(135deg,#0f766e,#22c1b6)',
    body: 'Completely agree, Marcus. I walk my retriever there every night and the shadows make the uneven pavement hard to see. LEDs would be a great upgrade!',
    likes: 8,
    showReply: false,
    replyText: '',
    replies: [
      {
        name: 'David Vance',
        initials: 'DV',
        time: '45 mins ago',
        color: 'linear-gradient(135deg,#164e63,#0e7490)',
        body: 'I could help the board compare a few cost-effective options if we decide to move forward.',
      },
    ],
  },
  {
    id: 2,
    name: 'Jason K.',
    initials: 'JK',
    time: '30 mins ago',
    color: 'linear-gradient(135deg,#475569,#64748b)',
    body: "Has anyone checked if it's just a bulb or a wiring issue? If it's wiring, we might need a full inspection before swapping the units.",
    likes: 2,
    showReply: false,
    replyText: '',
    replies: [],
  },
])

const sortBy = ref('top')
const commentSectionRef = ref(null)
const commentCount = computed(() => comments.value.length)
const pulse = ref({ pct: 88, voters: 14, trend: 2 })

const tips = [
  { text: "Stay polite and constructive; we're all neighbors here." },
  { text: 'Suggest solutions alongside identifying problems.' },
  { text: 'Mention neighbors who might have relevant expertise.' },
]

const related = [
  { title: 'Shared Garden Irrigation', meta: '8 active voices · Utilities' },
  { title: 'Visitor Parking Rules', meta: '15 active voices · Community' },
]

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
    color: 'linear-gradient(135deg,#0f766e,#22c1b6)',
    body: text,
    likes: 0,
    showReply: false,
    replyText: '',
    replies: [],
  })
}

function submitReply(comment, text) {
  if (!text.trim()) return
  comment.replies.push({
    name: 'You',
    initials: 'JD',
    time: 'just now',
    color: 'linear-gradient(135deg,#0f766e,#22c1b6)',
    body: text,
  })
  comment.replyText = ''
  comment.showReply = false
}

function goBack() {
  window.history.back()
}
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

.author-name {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 900;
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
  box-shadow: 0 0 0 18px rgba(186, 230, 253, 0.35), 0 0 0 44px rgba(186, 230, 253, 0.22);
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
