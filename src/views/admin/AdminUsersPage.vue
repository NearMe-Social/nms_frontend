<template>
  <div class="p-4 sm:p-6 flex flex-col gap-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-down">
      <div>
        <h1 class="text-xl font-bold text-gray-800">User Management</h1>
        <p class="text-gray-400 text-sm mt-0.5">Manage accounts, roles, and user statuses across the platform.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="fetchUsers"
          :disabled="isLoading"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-60"
        >
          <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
          Refresh users
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 animate-fade-up">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-3"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          :style="{ background: stat.iconBg, color: stat.iconColor }"
        >
          <component :is="stat.icon" class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xl font-bold text-gray-800 leading-tight">{{ stat.value }}</p>
          <p class="text-sm text-gray-400 mt-0.5">{{ stat.label }}</p>
        </div>
        <p :class="stat.trend === 'down' ? 'text-red-600' : 'text-green-600'" class="ml-auto text-xs font-semibold whitespace-nowrap">
          {{ stat.delta }}
        </p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="drawerUser" class="drawer-overlay" @click.self="drawerUser = null">
        <div class="drawer">
          <div class="drawer-header">
            <UserAvatar
              :src="drawerUser.profileImage"
              :username="drawerUser.username || drawerUser.name"
              :alt="`${drawerUser.name} profile`"
              class="drawer-avatar"
            />
            <div class="drawer-info">
              <h3 class="drawer-name">{{ drawerUser.name }}</h3>
              <p class="drawer-email">{{ drawerUser.email }}</p>
              <UserStatusBadge :status="drawerUser.status" />
            </div>
            <button class="close-btn" @click="drawerUser = null"><XIcon /></button>
          </div>
          <div class="drawer-body">
            <div class="detail-grid">
              <div class="detail-item" v-for="d in drawerDetails" :key="d.label">
                <span class="detail-label">{{ d.label }}</span>
                <span class="detail-val">{{ d.value }}</span>
              </div>
            </div>
            <div class="drawer-section-title">Account Actions</div>
            <SuspendActivateControls
              :status="drawerUser.status"
              :userId="drawerUser.id"
              variant="block"
              @suspend="handleSuspend"
              @activate="handleActivate"
              @ban="handleBan"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <div class="animate-fade-up">
      <AdminUsersTable
        :users="users"
        :is-loading="isLoading"
        :error="errorMessage"
        @retry="fetchUsers"
        @open-user="openDrawer"
        @suspend-user="handleSuspend"
        @activate-user="handleActivate"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Users,
  UserCheck,
  Ban,
  Flag,
  RefreshCw,
} from 'lucide-vue-next'
import AdminUsersTable from './UserTable.vue'
import UserStatusBadge from './UserStatusBadge.vue'
import SuspendActivateControls from './SuspendActivateControls.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { adminReportsApi, adminUsersApi } from '@/services/api'

const XIcon        = { template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` }

const drawerUser = ref(null)
const users = ref([])
const reportCounts = ref({})
const isLoading = ref(false)
const errorMessage = ref('')

const stats = computed(() => {
  const total = users.value.length
  const active = users.value.filter((user) => user.status === 'active').length
  const suspended = users.value.filter((user) => user.status === 'suspended').length
  const flagged = users.value.filter((user) => user.reports > 0).length

  return [
    {
      label: 'Total Users',
      value: total.toLocaleString(),
      delta: 'Live backend data',
      trend: 'up',
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
    },
    {
      label: 'Active Users',
      value: active.toLocaleString(),
      delta: `${total ? Math.round((active / total) * 100) : 0}% of users`,
      trend: 'up',
      icon: UserCheck,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      label: 'Suspended',
      value: suspended.toLocaleString(),
      delta: `${total ? Math.round((suspended / total) * 100) : 0}% of users`,
      trend: suspended > 0 ? 'down' : 'up',
      icon: Ban,
      iconBg: '#fff7ed',
      iconColor: '#c2410c',
    },
    {
      label: 'Flagged Accounts',
      value: flagged.toLocaleString(),
      delta: 'Targeted by reports',
      trend: flagged > 0 ? 'up' : 'down',
      icon: Flag,
      iconBg: '#fef2f2',
      iconColor: '#b91c1c',
    },
  ]
})

const drawerDetails = computed(() => drawerUser.value ? [
  { label: 'User ID', value: drawerUser.value.displayId },
  { label: 'Role', value: drawerUser.value.role },
  { label: 'Joined', value: drawerUser.value.joined },
  { label: 'Reports', value: drawerUser.value.reports },
  { label: 'Status', value: drawerUser.value.status },
  { label: 'Updated', value: drawerUser.value.updated },
] : [])

function openDrawer(user) { drawerUser.value = user }

async function fetchUsers() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const [userData, reportData] = await Promise.all([
      adminUsersApi.list(),
      adminReportsApi.list().catch(() => []),
    ])

    reportCounts.value = countUserReports(reportData)
    users.value = userData.map(mapAdminUser)

    if (drawerUser.value) {
      drawerUser.value = users.value.find((user) => user.id === drawerUser.value.id) || null
    }
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load users'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

function mapAdminUser(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  const name = fullName || user.username || user.email
  const status = user.isActive ? 'active' : 'suspended'

  return {
    raw: user,
    id: user.userId,
    displayId: `U-${user.userId}`,
    name,
    username: user.username,
    initials: initials(name),
    email: user.email,
    role: user.role?.toLowerCase() || 'user',
    status,
    joined: formatDate(user.createdAt),
    updated: formatDate(user.updatedAt),
    reports: reportCounts.value[user.userId] || 0,
    avatarColor: avatarColor(user.userId),
    profileImage: user.profileImage,
  }
}

function countUserReports(reports) {
  return reports.reduce((counts, report) => {
    if (report.targetType === 'USER') {
      counts[report.targetId] = (counts[report.targetId] || 0) + 1
    }

    return counts
  }, {})
}

async function handleSuspend(userOrId) {
  const userId = typeof userOrId === 'object' ? userOrId.id : userOrId
  await updateUserStatus(userId, false)
}

async function handleActivate(userOrId) {
  const userId = typeof userOrId === 'object' ? userOrId.id : userOrId
  await updateUserStatus(userId, true)
}

async function handleBan(userId) {
  await updateUserStatus(userId, false)
}

async function updateUserStatus(userId, isActive) {
  try {
    const updated = await adminUsersApi.updateStatus(Number(userId), isActive)
    const mapped = mapAdminUser(updated)
    users.value = users.value.map((user) => user.id === mapped.id ? mapped : user)

    if (drawerUser.value?.id === mapped.id) {
      drawerUser.value = mapped
    }
  } catch (error) {
    console.error('Failed to update user status:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update user status'
  }
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function avatarColor(id) {
  const colors = ['#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#d97706']
  return colors[Math.abs(Number(id)) % colors.length]
}

function formatDate(date) {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(fetchUsers)
</script>

<style scoped>
.animate-fade-down {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(16,18,28,.35); 
    backdrop-filter: blur(3px); 
    z-index: 200; 
    display: flex; 
    justify-content: flex-end; 
}

.drawer { 
    width: min(360px, 100vw); 
    background: #fff; 
    height: 100%; 
    overflow-y: auto; 
    box-shadow: -8px 0 32px rgba(0,0,0,.12); 
    display: flex; 
    flex-direction: column; 
}

.drawer-header { 
    display: flex; 
    align-items: flex-start; 
    gap: 14px; 
    padding: 24px; 
    border-bottom: 1px solid #e5e7eb; 
}

.drawer-avatar { 
    width: 52px; 
    height: 52px; 
    border-radius: 50%; 
    font-size: 18px; 
    flex-shrink: 0; 
}

.drawer-info { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    gap: 4px; 
}

.drawer-name {
    font-size: 16px; 
    font-weight: 700; 
    color: #1f2937; 
}

.drawer-email { 
    font-size: 12px; 
    color: #6b7280; 
}

.close-btn { 
    border: none; 
    background: #f3f4f6; 
    border-radius: 7px; 
    width: 32px; 
    height: 32px; 
    display: grid; 
    place-items: center; 
    cursor: pointer; 
    color: #6b7080; 
    transition: background .15s; 
    flex-shrink: 0; 
}

.close-btn:hover { 
    background: #e5e7eb; 
}

.drawer-body { 
    padding: 20px 24px; 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
}

.detail-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
}

.detail-item { 
    background: #f9fafb; 
    border-radius: 8px; 
    padding: 10px 12px; 
}

.detail-label { 
    display: block; 
    font-size: 11px; 
    color: #9aa0b0; 
    font-weight: 600; 
    text-transform: uppercase; 
    letter-spacing: .04em; 
    margin-bottom: 4px; 
}

.detail-val { 
    display: block; 
    font-size: 13px; 
    font-weight: 600; 
    color: #1f2937; 
    text-transform: capitalize; 
}

.drawer-section-title { 
    font-size: 12px; 
    font-weight: 700; 
    color: #9aa0b0; 
    text-transform: uppercase; 
    letter-spacing: .05em; 
}

@media (max-width: 640px) {
    .drawer-overlay {
        justify-content: center;
    }

    .drawer {
        width: 100vw;
    }

    .drawer-header {
        padding: 20px;
    }

    .drawer-body {
        padding: 18px 20px;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }
}

</style>
