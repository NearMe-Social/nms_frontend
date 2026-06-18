<template>
  <div class="dashboard-page">
    <!-- Header with Title and Action Buttons -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of platform activity, reports, and account health.</p>
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
        <DashboardStatCard
          title="Total Users"
          :value="stats.totalUsers"
          :icon="Users"
          icon-class="users-icon"
          :note="`${stats.activeUsers} active accounts`"
        />
        <DashboardStatCard
          title="Active Posts"
          :value="stats.activePosts"
          :icon="FileText"
          icon-class="posts-icon"
          note="All active posts on the platform"
        />
        <DashboardStatCard
          title="Pending Reports"
          :value="stats.pendingReports"
          :icon="Flag"
          icon-class="reports-icon"
          :note="`${stats.totalReports} total reports`"
          negative
        />
        <DashboardStatCard
          title="Suspended Users"
          :value="stats.suspendedUsers"
          :icon="Ban"
          icon-class="blocked-icon"
          note="Inactive accounts"
          negative
        />
      </div>
    </div>

    <!-- Additional Info Section -->
    <div v-if="!loading && !error" class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="info-title">Highest Risk Reports</h3>
          <p v-if="!primaryPriorityReport" class="empty-activity">
            No reports currently pass the high-risk threshold.
          </p>
          <div v-else class="priority-report-stack">
            <RouterLink
              :to="`/admin/reports/${primaryPriorityReport.actionReportId}`"
              class="priority-report priority-report-main"
            >
              <span class="priority-count" :class="{ danger: primaryPriorityReport.isHighRisk }">
                <strong>{{ primaryPriorityReport.count }}</strong>
                <small>reports</small>
              </span>
              <span class="priority-copy">
                <strong>{{ primaryPriorityReport.targetType }} #{{ primaryPriorityReport.targetId }}</strong>
                <small>{{ primaryPriorityReport.reasonSummary }}</small>
                <small>
                  {{ primaryPriorityReport.pendingCount > 0 ? 'Next pending' : 'Latest report' }}
                  · {{ formatDate(primaryPriorityReport.actionCreatedAt) }}
                </small>
                <small>
                  First reported {{ formatDate(primaryPriorityReport.firstCreatedAt) }}
                </small>
                <span class="priority-detail-grid">
                  <span>
                    <b>{{ primaryPriorityReport.riskScore }}</b>
                    Risk score
                  </span>
                  <span>
                    <b>{{ primaryPriorityReport.uniqueReporterCount }}</b>
                    Reporters
                  </span>
                  <span>
                    <b>{{ primaryPriorityReport.seriousReasonCount }}</b>
                    Serious reasons
                  </span>
                  <span>
                    <b>{{ primaryPriorityReport.ageLabel }}</b>
                    Waiting
                  </span>
                </span>
              </span>
              <span class="priority-type">
                {{ primaryPriorityReport.riskLevel }}
              </span>
            </RouterLink>

            <div v-if="secondaryPriorityReports.length" class="priority-mini-grid">
              <RouterLink
                v-for="group in secondaryPriorityReports"
                :key="group.key"
                :to="`/admin/reports/${group.actionReportId}`"
                class="priority-mini"
              >
                <span>
                  <strong>{{ group.targetType }} #{{ group.targetId }}</strong>
                  <small>{{ group.count }} reports · {{ group.pendingCount }} pending</small>
                  <small>By {{ group.latestReporter }}</small>
                  <small>
                    {{ group.pendingCount > 0 ? 'Next' : 'Latest' }}
                    {{ formatDate(group.actionCreatedAt) }}
                  </small>
                </span>
                <span class="priority-mini-type">{{ group.targetType }}</span>
              </RouterLink>
            </div>
          </div>
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
import DashboardStatCard from '@/views/admin/DashboardStatCard.vue'
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
const HIGH_RISK_THRESHOLD = 20

const stats = computed(() => ({
  totalUsers: users.value.length,
  activeUsers: users.value.filter((user) => user.isActive).length,
  activePosts: posts.value.filter((post) => post.status === 'ACTIVE').length,
  pendingReports: reports.value.filter((report) => report.status === 'PENDING').length,
  totalReports: reports.value.length,
  flaggedAccounts: new Set(
    reports.value.filter((report) => report.targetType === 'USER').map((report) => report.targetId),
  ).size,
  suspendedUsers: users.value.filter((user) => !user.isActive).length,
}))

const recentReports = computed(() =>
  [...reports.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5),
)

interface PriorityReportGroup {
  key: string
  targetType: ApiAdminReport['targetType']
  targetId: number
  count: number
  pendingCount: number
  seriousReasonCount: number
  uniqueReporterCount: number
  riskScore: number
  riskLevel: string
  isHighRisk: boolean
  actionReportId: number
  actionCreatedAt: string
  latestReportId: number
  latestCreatedAt: string
  firstCreatedAt: string
  ageLabel: string
  latestReporter: string
  reasonSummary: string
}

const priorityReports = computed<PriorityReportGroup[]>(() => {
  const grouped = new Map<string, ApiAdminReport[]>()

  reports.value.forEach((report) => {
    const key = `${report.targetType}:${report.targetId}`
    grouped.set(key, [...(grouped.get(key) ?? []), report])
  })

  return [...grouped.entries()]
    .map(([key, groupReports]) => toPriorityGroup(key, groupReports))
    .filter((group) => group.pendingCount > 0 && group.riskScore >= HIGH_RISK_THRESHOLD)
    .sort(
      (a, b) =>
        b.riskScore - a.riskScore ||
        new Date(a.firstCreatedAt).getTime() - new Date(b.firstCreatedAt).getTime(),
    )
    .slice(0, 3)
})

const primaryPriorityReport = computed(() => priorityReports.value[0] ?? null)

const secondaryPriorityReports = computed(() => priorityReports.value.slice(1, 3))

function toPriorityGroup(key: string, groupReports: ApiAdminReport[]): PriorityReportGroup {
  const sortedReports = [...groupReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const pendingReports = groupReports
    .filter((report) => report.status === 'PENDING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const latestReport = sortedReports[0]
  const firstReport = sortedReports[sortedReports.length - 1]
  const actionReport = pendingReports[0] ?? latestReport
  const pendingCount = pendingReports.length
  const seriousReasonCount = groupReports.filter((report) => isSeriousReason(report.reason)).length
  const uniqueReporterCount = new Set(
    groupReports.map((report) => report.reporter?.userId ?? report.reporter?.email ?? 'unknown'),
  ).size
  const reasonSummary = summarizeReasons(groupReports)
  const reporterName =
    latestReport.reporter?.username || latestReport.reporter?.email || 'Unknown reporter'
  const riskScore = groupReports.length * 10 + pendingCount * 5 + seriousReasonCount * 6

  return {
    key,
    targetType: latestReport.targetType,
    targetId: latestReport.targetId,
    count: groupReports.length,
    pendingCount,
    seriousReasonCount,
    uniqueReporterCount,
    riskScore,
    riskLevel: riskScore >= 45 ? 'Critical' : riskScore >= 30 ? 'High' : 'Watch',
    isHighRisk: groupReports.length >= 3 || seriousReasonCount > 0,
    actionReportId: actionReport.reportId,
    actionCreatedAt: actionReport.createdAt,
    latestReportId: latestReport.reportId,
    latestCreatedAt: latestReport.createdAt,
    firstCreatedAt: firstReport.createdAt,
    ageLabel: ageLabel(firstReport.createdAt),
    latestReporter: reporterName,
    reasonSummary,
  }
}

function isSeriousReason(reason: string) {
  const normalizedReason = reason.toLowerCase()
  const seriousKeywords = [
    'self-harm',
    'illegal',
    'hate',
    'harassment',
    'explicit',
    'adult',
    'threat',
    'violence',
    'scam',
  ]

  return seriousKeywords.some((keyword) => normalizedReason.includes(keyword))
}

function summarizeReasons(groupReports: ApiAdminReport[]) {
  const reasons = [...new Set(groupReports.map((report) => report.reason).filter(Boolean))]

  if (reasons.length === 0) return 'No reason provided'
  if (reasons.length <= 2) return reasons.join('; ')

  return `${reasons.slice(0, 2).join('; ')} +${reasons.length - 2} more`
}

function ageLabel(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

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
  align-items: stretch;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 22rem;
}

.info-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.priority-report-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.priority-report {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.9rem;
  background: #f8fafc;
  padding: 0.72rem 0.8rem;
  color: #1f2937;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.priority-report:hover {
  border-color: #fecaca;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.priority-count {
  width: 2.65rem;
  height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 0.85rem;
  background: #fff7ed;
  color: #ea580c;
  line-height: 1;
}

.priority-count.danger {
  background: #fef2f2;
  color: #dc2626;
}

.priority-count strong {
  font-size: 0.95rem;
  font-weight: 900;
}

.priority-count small {
  margin-top: 0.15rem;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
}

.priority-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.priority-copy strong {
  overflow: hidden;
  color: #111827;
  font-size: 0.84rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-copy small {
  overflow: hidden;
  color: #6b7280;
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-type {
  border-radius: 999px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.3rem 0.55rem;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;
}

.priority-report-main {
  flex: 1;
  min-height: 14rem;
  align-items: start;
  padding: 1rem;
  background:
    linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(255, 255, 255, 0.96)),
    #ffffff;
}

.priority-report-main .priority-count {
  width: 3.35rem;
  height: 3.35rem;
}

.priority-report-main .priority-count strong {
  font-size: 1.15rem;
}

.priority-report-main .priority-copy {
  gap: 0.28rem;
}

.priority-report-main .priority-copy strong {
  font-size: 0.98rem;
}

.priority-report-main .priority-copy small {
  font-size: 0.78rem;
}

.priority-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.45rem;
}

.priority-detail-grid span {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  border: 1px solid rgba(254, 202, 202, 0.75);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.55rem;
  color: #8a4b2a;
  font-size: 0.66rem;
  font-weight: 800;
}

.priority-detail-grid b {
  overflow: hidden;
  color: #111827;
  font-size: 0.88rem;
  font-weight: 950;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.priority-mini {
  display: flex;
  min-height: 5.45rem;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.85rem;
  background: #f8fafc;
  padding: 0.75rem;
  color: #1f2937;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.priority-mini:hover {
  border-color: #fed7aa;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}

.priority-mini span:first-child {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.priority-mini strong,
.priority-mini small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-mini strong {
  color: #111827;
  font-size: 0.8rem;
}

.priority-mini small {
  color: #6b7280;
  font-size: 0.7rem;
}

.priority-mini-type {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #fff7ed;
  padding: 0.25rem 0.45rem;
  color: #ea580c;
  font-size: 0.62rem;
  font-weight: 900;
}

.priority-report-main .priority-type,
.priority-mini-type {
  align-self: flex-start;
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

  .info-card {
    min-height: 0;
  }

  .priority-report {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .priority-report-main {
    min-height: 12rem;
  }

  .priority-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .priority-type {
    grid-column: 2;
    justify-self: start;
  }

  .priority-mini-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
