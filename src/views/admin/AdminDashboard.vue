<template>
  <div class="dashboard-page">
    <!-- Header with Title and Action Buttons -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="breadcrumb">
          <span>Admin</span>
          <ChevronRight class="breadcrumb-icon" />
          <span class="bc-active">Dashboard</span>
        </div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of platform activity and content moderation metrics</p>
      </div>

      <div class="header-actions">
        <button class="btn-action primary" @click="handleGenerateReport">
          <Download class="btn-icon" />
          Generate Report
        </button>
        <button class="btn-action secondary" @click="handleNewAlert">
          <AlertCircle class="btn-icon" />
          New Alert
        </button>
      </div>
    </div>

    <!-- Summary Cards Section -->
    <div class="summary-section">
      <div class="summary-grid">
        <!-- Total Users Card -->
        <div class="summary-card users-card">
          <div class="card-header">
            <h3 class="card-title">Total Users</h3>
            <Users class="card-icon users-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.totalUsers }}</div>
            <div class="card-change" :class="stats.usersTrend > 0 ? 'positive' : 'negative'">
              <TrendingUp v-if="stats.usersTrend > 0" class="trend-icon" />
              <TrendingDown v-else class="trend-icon" />
              {{ Math.abs(stats.usersTrend) }}% from last month
            </div>
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
            <div class="card-change" :class="stats.postsTrend > 0 ? 'positive' : 'negative'">
              <TrendingUp v-if="stats.postsTrend > 0" class="trend-icon" />
              <TrendingDown v-else class="trend-icon" />
              {{ Math.abs(stats.postsTrend) }}% from last month
            </div>
          </div>
        </div>

        <!-- Reported Content Card -->
        <div class="summary-card reports-card">
          <div class="card-header">
            <h3 class="card-title">Reported Content</h3>
            <Flag class="card-icon reports-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.reportedContent }}</div>
            <div class="card-change" :class="stats.reportsTrend > 0 ? 'negative' : 'positive'">
              <TrendingUp v-if="stats.reportsTrend > 0" class="trend-icon" />
              <TrendingDown v-else class="trend-icon" />
              {{ Math.abs(stats.reportsTrend) }}% from last month
            </div>
          </div>
        </div>

        <!-- Blocked Users Card -->
        <div class="summary-card blocked-card">
          <div class="card-header">
            <h3 class="card-title">Blocked Users</h3>
            <Ban class="card-icon blocked-icon" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.blockedUsers }}</div>
            <div class="card-change" :class="stats.blockedTrend > 0 ? 'negative' : 'positive'">
              <TrendingUp v-if="stats.blockedTrend > 0" class="trend-icon" />
              <TrendingDown v-else class="trend-icon" />
              {{ Math.abs(stats.blockedTrend) }}% from last month
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info Section -->
    <div class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="info-title">Quick Actions</h3>
          <ul class="info-list">
            <li><a href="#" class="info-link">View All Reports</a></li>
            <li><a href="#" class="info-link">Manage Users</a></li>
            <li><a href="#" class="info-link">Review Moderation Queue</a></li>
            <li><a href="#" class="info-link">System Settings</a></li>
          </ul>
        </div>

        <div class="info-card">
          <h3 class="info-title">Platform Status</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">API Health</span>
              <span class="status-badge online">Operational</span>
            </div>
            <div class="status-item">
              <span class="status-label">Database</span>
              <span class="status-badge online">Connected</span>
            </div>
            <div class="status-item">
              <span class="status-label">WebSocket</span>
              <span class="status-badge online">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Users,
  FileText,
  Flag,
  Ban,
  ChevronRight,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next'

// Dashboard statistics
const stats = ref({
  totalUsers: '12,458',
  usersTrend: 8.2,
  activePosts: '3,847',
  postsTrend: 5.4,
  reportedContent: '234',
  reportsTrend: -12.5,
  blockedUsers: '87',
  blockedTrend: 2.1,
})

// Action handlers
function handleGenerateReport() {
  console.log('Generate Report clicked')
  // TODO: Implement report generation
  alert('Report generation will be available soon')
}

function handleNewAlert() {
  console.log('New Alert clicked')
  // TODO: Implement new alert creation
  alert('New alert functionality will be available soon')
}
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Header Styles */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1rem;
}

.header-content {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
  color: #d1d5db;
}

.bc-active {
  color: #2563eb;
  font-weight: 600;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #6b7280;
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
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
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
  margin-bottom: 1rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  width: 1.5rem;
  height: 1.5rem;
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
  font-size: 1.875rem;
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

/* Info Section */
.info-section {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
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
  font-size: 1rem;
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

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
