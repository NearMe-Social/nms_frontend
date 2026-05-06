<template>
  <profileNavbar/>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <LoaderIcon :size="48" class="spinner-icon" />
      </div>
      <div class="loading-text">Loading profile...</div>
    </div>

    <!-- Main Profile Content -->
    <div v-else-if="userLoaded" class="profile-content">
      <!-- Hero Banner -->
      <div class="profile-hero">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">
            <div class="avatar-initials">JT</div>
          </div>
          <div class="avatar-badge">
            <CheckIcon :size="11" color="white" />
          </div>
        </div>
      </div>

    <!-- Name / Actions Bar -->
    <div class="profile-info-bar">
      <div class="profile-head">
        <div class="profile-name">{{ user.name }}</div>
        <div class="profile-handle">{{ user.handle }}</div>
        <div class="profile-meta">
          <MapPinIcon :size="13" />
          {{ user.location }} • {{ user.role }}
        </div>
        <p class="profile-blurb">{{ user.bio }}</p>
        <div class="profile-stats">
          <div class="profile-stat" v-for="stat in user.stats" :key="stat.label">
            <div class="stat-num">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <button v-if="isOwnProfile" class="btn-edit" @click="handleEditProfile">
          <EditIcon :size="14" />
          Edit Profile
        </button>
        <button v-else class="btn-follow">Follow</button>
        <button class="btn-msg">
          <MailIcon :size="14" />
          Message
        </button>
      </div>
    </div>

    <!-- Body Grid -->
    <div class="profile-body">

      <!-- SIDEBAR -->
      <aside class="sidebar">

        <!-- Biography -->
        <div class="card">
          <div class="card-label">Biography</div>
          <p class="bio-text">{{ user.bio }}</p>
          <div class="tag-row">
            <span class="tag" v-for="tag in user.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-cell">
            <div class="stat-num">{{ user.followers }}</div>
            <div class="stat-lbl">Followers</div>
          </div>
          <div class="stat-cell">
            <div class="stat-num">{{ user.following }}</div>
            <div class="stat-lbl">Following</div>
          </div>
        </div>

        <!-- Published Essays -->
        <div class="essays-card">
          <div>
            <div class="essays-num">{{ user.essays }}</div>
            <div class="essays-lbl">Published Essays</div>
          </div>
          <BookOpenIcon :size="32" color="rgba(255,255,255,0.65)" />
        </div>

        <!-- Active badge -->
        <div class="active-badge">
          <span class="dot"></span>
          Currently active in {{ user.activeIn }}
        </div>

      </aside>

      <!-- POSTS -->
      <section class="posts-section">

        <div class="posts-header">
          <div class="posts-title">Recent Editorial Posts</div>
          <div class="tab-bar">
            <button
              v-for="tab in tabs"
              :key="tab"
              class="tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>
        </div>

        <!-- Featured post -->
        <div class="post-featured">
          <div class="post-img post-img-arch"></div>
          <div class="post-body">
            <div class="post-badge">
              <StarIcon :size="12" />
              Featured Insight
            </div>
            <div class="post-h">The Future of Third Spaces: Why Libraries are the New Social Clubs</div>
            <div class="post-excerpt">
              In an era of digital isolation, physical repositories of knowledge are transforming into the most vital community hubs of the decade…
            </div>
            <div class="post-footer">
              <div class="post-meta">
                <span class="meta-item"><HeartIcon :size="14" /> 1.2k</span>
                <span class="meta-item"><MessageSquareIcon :size="14" /> 84</span>
              </div>
              <span class="post-date">Oct 12, 2023</span>
            </div>
          </div>
        </div>

        <!-- Posts Grid or Empty State -->
        <div v-if="showEmptyState" class="empty-state">
          <div class="empty-icon">
            <FileTextIcon :size="64" />
          </div>
          <div class="empty-title">No posts yet</div>
          <div class="empty-description">
            {{ user.name }} hasn't published any posts or discussions yet.
          </div>
        </div>

        <!-- Two-column grid -->
        <div v-else class="posts-grid">
          <div class="post-card" v-for="post in smallPosts" :key="post.id">
            <div class="post-card-img" :class="post.imgClass"></div>
            <div class="post-card-body">
              <div class="post-card-h">{{ post.title }}</div>
              <div class="post-card-meta">
                <span class="meta-item"><HeartIcon :size="13" /> {{ post.likes }}</span>
                <span class="meta-item"><MessageSquareIcon :size="13" /> {{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="explore-link">Explore Full Archive →</div>

      </section>
    </div>
  </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import profileNavbar from '@/components/profileNavbar.vue'
import {
  MapPin  as MapPinIcon,
  Mail    as MailIcon,
  Star    as StarIcon,
  Heart   as HeartIcon,
  MessageSquare as MessageSquareIcon,
  BookOpen as BookOpenIcon,
  Check   as CheckIcon,
  Loader2  as LoaderIcon,
  FileText as FileTextIcon,
  Edit2   as EditIcon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('Latest')
const tabs = ['Latest', 'Popular', 'Media']

// Loading and data states
const isLoading = ref(false)
const userLoaded = ref(true) // Set to true for demo, would be false initially

// Check if this is the current user's profile
const isOwnProfile = computed(() => {
  // In a real app, you'd compare the profile being viewed with the current user
  return true // For now, assume it's your own profile
})

const handleEditProfile = () => {
  router.push('/profile/edit')
}

const user = {
  name: 'Julian Thorne',
  handle: '@juliant',
  location: 'Brooklyn, New York',
  role: 'Design Lead',
  bio: 'Curating the intersection of urban architecture and community dynamics. I build spaces that foster intentional conversation and sustainable growth.',
  tags: ['Architecture', 'Urbanism', 'Design Strategy'],
  stats: [
    { label: 'Posts', value: '128' },
    { label: 'Followers', value: '12.4k' },
    { label: 'Following', value: '842' },
  ],
  essays: 42,
  activeIn: 'Brooklyn Commons',
}

// Mock posts data - set to empty array to test empty state
const smallPosts = [
  {
    id: 2,
    imgClass: 'post-img-calm',
    title: 'Designing for Calm: Workplace Ethics',
    likes: 450,
    comments: 12,
  },
  {
    id: 3,
    imgClass: 'post-img-city',
    title: 'Hyper-local: The 15 Minute City',
    likes: 890,
    comments: 31,
  },
]

// Computed properties for state management
const hasPosts = computed(() => smallPosts.length > 0)
const showEmptyState = computed(() => !isLoading.value && !hasPosts.value)

</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  margin-left: 200px;
  width: calc(100% - 200px);
  background: #f0f2f8;
}

/* ── Hero ── */
.profile-hero {
  height: 220px;
  background: linear-gradient(135deg, #0d1b3e 0%, #162d6b 40%, #1a4a6e 100%);
  position: relative;
}

.profile-avatar-wrap {
  position: absolute;
  bottom: -48px;
  left: 40px;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 18px;
  border: 4px solid #fff;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  font-family: 'DM Serif Display', serif;
  font-size: 36px;
  color: #1a56db;
  background: #eff4ff;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  background: #00c9b1;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Info bar ── */
.profile-info-bar {
  background: #fff;
  padding: 60px 40px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
}

.profile-name {
  font-family: 'DM Serif Display', serif;
  font-size: 32px;
  letter-spacing: -0.5px;
  color: #1a1f36;
  line-height: 1.1;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
}

.profile-handle {
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
}

.profile-blurb {
  max-width: 720px;
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.75;
  color: #475569;
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
  background: #eff4ff;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  padding: 14px;
  justify-content: space-between;
}

.profile-stat {
  min-width: 100px;
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 14px;
  padding: 0;
  text-align: center;
}

.profile-stat .stat-num {
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  color: #1a56db;
}

.profile-stat .stat-label {
  margin-top: 6px;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
}

.profile-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: #2dd4bf;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0f2134;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-msg:hover {
  background: #2bb8a9;
}

.btn-follow {
  padding: 12px 22px;
  background: #1a56db;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-follow:hover {
  background: #1348c0;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 22px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* ── Body grid ── */
.profile-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  padding: 28px 40px 48px;
  align-items: start;
  background: #f0f2f8;
  flex: 1;
}

/* ── Sidebar ── */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
}

.card-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #1a56db;
  margin-bottom: 10px;
}

.bio-text {
  font-size: 13.5px;
  line-height: 1.65;
  color: #374151;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.tag {
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid #00c9b1;
  color: #00c9b1;
  background: #f0fdfb;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.stat-cell {
  padding: 16px 18px;
  border-right: 1px solid #e2e8f0;
}

.stat-cell:last-child {
  border-right: none;
}

.stat-num {
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  color: #1a1f36;
  line-height: 1;
}

.stat-lbl {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6b7280;
  margin-top: 3px;
}

.essays-card {
  background: #1a56db;
  color: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.essays-num {
  font-family: 'DM Serif Display', serif;
  font-size: 30px;
  line-height: 1;
}

.essays-lbl {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.75;
  margin-top: 3px;
}

.active-badge {
  background: #f0fdfb;
  border: 1.5px solid #b2f5ea;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #0d9488;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00c9b1;
  flex-shrink: 0;
}

/* ── Posts ── */
.posts-section {
  min-width: 0;
}

.posts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.posts-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: #1a1f36;
}

.tab-bar {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.tab.active {
  color: #1a56db;
  border-bottom: 2px solid #1a56db;
  border-radius: 0;
}

.tab:hover:not(.active) {
  color: #1a1f36;
}

/* Featured post */
.post-featured {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}

.post-featured:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
}

.post-img {
  width: 100%;
  height: 200px;
}

.post-img-arch {
  background: linear-gradient(160deg, #c4a96a 0%, #6e5c3b 60%, #3d3328 100%);
}

.post-img-calm {
  background: linear-gradient(160deg, #d4c5a9 0%, #8a9a7e 50%, #5a7a6e 100%);
}

.post-img-city {
  background: linear-gradient(160deg, #2d3561 0%, #c24b4b 40%, #e8a24e 100%);
}

.post-body {
  padding: 20px 24px 24px;
}

.post-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #00c9b1;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.post-h {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  line-height: 1.25;
  color: #1a1f36;
  margin-bottom: 10px;
}

.post-excerpt {
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-meta {
  display: flex;
  gap: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: #6b7280;
  font-weight: 500;
}

.post-date {
  font-size: 12px;
  color: #6b7280;
}

/* Small post grid */
.posts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.post-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: box-shadow 0.2s;
  cursor: pointer;
}

.post-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
}

.post-card-img {
  height: 140px;
  width: 100%;
}

.post-card-body {
  padding: 14px 16px 18px;
}

.post-card-h {
  font-family: 'DM Serif Display', serif;
  font-size: 16px;
  line-height: 1.3;
  color: #1a1f36;
  margin-bottom: 10px;
}

.post-card-meta {
  display: flex;
  gap: 12px;
}

.explore-link {
  text-align: center;
  font-size: 13.5px;
  font-weight: 600;
  color: #1a56db;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  transition: all 0.15s;
}

.explore-link:hover {
  border-color: #1a56db;
  background: #eff4ff;
}

@media (max-width: 1024px) {
  .profile-page {
    margin-left: 0;
    width: 100%;
  }

  .profile-hero {
    height: 180px;
  }

  .profile-avatar-wrap {
    left: 50%;
    transform: translateX(-50%);
    bottom: -52px;
  }

  .profile-info-bar {
    padding: 70px 20px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .profile-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .btn-msg,
  .btn-follow {
    width: 48%;
    min-width: 0;
    justify-content: center;
  }

  .btn-msg {
    order: 2;
  }

  .btn-follow {
    order: 1;
  }

  .profile-body {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 22px;
  }

  .sidebar {
    display: none;
  }

  .posts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tab-bar {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .post-featured {
    display: block;
  }

  .post-img {
    height: 180px;
  }
}

@media (max-width: 900px) {
  .profile-page {
    margin-left: 0;
    width: 100%;
    padding-top: 68px;
    padding-bottom: 100px;
  }

  .navbar + .profile-page {
    margin-top: 0;
  }

  .profile-hero {
    height: 180px;
  }

  .profile-avatar-wrap {
    left: 50%;
    transform: translateX(-50%);
    bottom: -52px;
  }

  .profile-info-bar {
    padding: 70px 18px 20px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 18px;
  }

  .profile-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .btn-msg,
  .btn-follow {
    width: 48%;
    min-width: 0;
    justify-content: center;
  }

  .profile-body {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 22px;
  }

  .posts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tab-bar {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .post-card-img {
    height: 140px;
  }
}

@media (max-width: 640px) {
  .profile-info-bar {
    padding: 62px 18px 18px;
    align-items: center;
    text-align: center;
  }

  .profile-name {
    font-size: 28px;
  }

  .profile-handle {
    font-size: 14px;
  }

  .profile-meta {
    justify-content: center;
    font-size: 12px;
  }

  .profile-blurb {
    font-size: 13px;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .profile-stats {
    gap: 12px;
  }

  .btn-msg,
  .btn-follow {
    width: 48%;
    padding: 14px 0;
  }

  .profile-body {
    padding: 16px;
  }

  .post-card-img {
    height: 120px;
  }
}

/* ── Loading State ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  background: #f0f2f8;
}

.loading-spinner {
  margin-bottom: 20px;
}

.spinner-icon {
  color: #1a56db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-title {
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  color: #1a1f36;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  max-width: 300px;
  line-height: 1.5;
}
</style>