<template>
  <div class="dashboard-page">
    <!-- Header with Title and Action Buttons -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of platform activity and content moderation metrics</p>
      </div>

      <div class="header-actions">
        <RouterLink to="/admin/reports" class="btn-action primary">
          <Flag class="btn-icon" />
          Review Reports
        </RouterLink>
        <RouterLink to="/admin/users" class="btn-action secondary">
          <Users class="btn-icon" />
          Manage Users
        </RouterLink>
      </div>
    </div>

    <p v-if="loading" class="dashboard-message">Loading dashboard data...</p>
    <div v-else-if="error" class="dashboard-message error-message">
      <span>{{ error }}</span>
      <button type="button" @click="loadDashboard">Retry</button>
    </div>

    <!-- Summary Cards Section -->
    <div v-else class="summary-section">
      <div class="summary-grid">
        <!-- Total Users Card -->
        <div class="summary-card users-card">
          <div class="card-header">
            <h3 class="card-title">Total Users</h3>
            <Users class="card-icon users-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.totalUsers }}</div>
            <div class="card-change">{{ stats.activeUsers }} active accounts</div>
          </div>
        </div>

        <!-- Active Posts Card -->
        <div class="summary-card posts-card">
          <div class="card-header">
            <h3 class="card-title">Active Posts</h3>
            <FileText class="card-icon posts-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.activePosts }}</div>
            <div class="card-change">Currently visible in the feed</div>
          </div>
        </div>

        <!-- Reported Content Card -->
        <div class="summary-card reports-card">
          <div class="card-header">
            <h3 class="card-title">Pending Reports</h3>
            <Flag class="card-icon reports-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.pendingReports }}</div>
            <div class="card-change negative">{{ stats.totalReports }} total reports</div>
          </div>
        </div>

        <!-- Blocked Users Card -->
        <div class="summary-card blocked-card">
          <div class="card-header">
            <h3 class="card-title">Suspended Users</h3>
            <Ban class="card-icon blocked-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.suspendedUsers }}</div>
            <div class="card-change negative">Inactive accounts</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info Section -->
    <div v-if="!loading && !error" class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="info-title">Quick Actions</h3>
          <ul class="info-list">
            <li><RouterLink to="/admin/reports" class="info-link">View All Reports</RouterLink></li>
            <li><RouterLink to="/admin/users" class="info-link">Manage Users</RouterLink></li>
            <li>
              <RouterLink to="/admin/moderation" class="info-link">
                Review Moderation Queue
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="info-card">
          <h3 class="info-title">Recent Reports</h3>
          <p v-if="recentReports.length === 0" class="empty-activity">
            No reports have been submitted.
          </p>
          <RouterLink
            v-for="report in recentReports"
            :key="report.reportId"
            :to="`/admin/reports/${report.reportId}`"
            class="activity-item"
          >
            <span>
              <strong>{{ report.targetType }} #{{ report.targetId }}</strong>
              <small>{{ report.reason }}</small>
            </span>
            <span class="activity-meta">
              {{ report.status }}
              <small>{{ formatDate(report.createdAt) }}</small>
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Ban, FileText, Flag, Users } from 'lucide-vue-next'
import {
  adminReportsApi,
  adminUsersApi,
  postApi,
  type ApiAdminReport,
  type ApiAdminUser,
  type ApiPost,
} from '@/services/api'

const users = ref<ApiAdminUser[]>([])
const reports = ref<ApiAdminReport[]>([])
const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')

const stats = computed(() => ({
  totalUsers: users.value.length,
  activeUsers: users.value.filter((user) => user.isActive).length,
  activePosts: posts.value.filter(
    (post) => post.status === 'ACTIVE' && new Date(post.expires_at).getTime() > Date.now(),
  ).length,
  pendingReports: reports.value.filter((report) => report.status === 'PENDING').length,
  totalReports: reports.value.length,
  suspendedUsers: users.value.filter((user) => !user.isActive).length,
}))

const recentReports = computed(() =>
  [...reports.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5),
)

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const [userData, reportData, postData] = await Promise.all([
      adminUsersApi.list(),
      adminReportsApi.list(),
      postApi.list('latest'),
    ])

    users.value = userData
    reports.value = reportData
    posts.value = postData
  } catch (loadError: unknown) {
    error.value = loadError instanceof Error ? loadError.message : 'Failed to load dashboard data.'
  } finally {
    loading.value = false
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

/* Header Styles */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.page-subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-action.primary {
  background-color: #2563eb;
  color: white;
}

.btn-action.primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-action.secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-action.secondary:hover {
  background-color: #e5e7eb;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Summary Section */
.summary-section {
  padding: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.card-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #d1d5db;
}

.users-icon {
  color: #3b82f6;
}

.posts-icon {
  color: #8b5cf6;
}

.reports-icon {
  color: #ef4444;
}

.blocked-icon {
  color: #f59e0b;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.card-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #059669;
}

.card-change.negative {
  color: #dc2626;
}

.trend-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.dashboard-message {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #b91c1c;
}

.error-message button {
  border: 0;
  border-radius: 0.5rem;
  background: #fee2e2;
  padding: 0.45rem 0.8rem;
  color: #b91c1c;
  font-weight: 700;
  cursor: pointer;
}

/* Info Section */
.info-section {
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.info-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0.65rem;
  padding: 0.7rem 0.75rem;
  color: #374151;
  text-decoration: none;
}

.activity-item:hover {
  background: #f3f4f6;
}

.activity-item > span {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.activity-item strong,
.activity-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-item strong {
  font-size: 0.82rem;
}

.activity-item small,
.empty-activity {
  color: #6b7280;
  font-size: 0.75rem;
}

.activity-meta {
  flex: 0 0 auto;
  align-items: flex-end;
  color: #2563eb;
  font-size: 0.7rem;
  font-weight: 800;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.online {
  background-color: #d1fae5;
  color: #047857;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
    gap: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-action {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
