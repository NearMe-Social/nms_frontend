<template>
  <div class="page">
  
    <div class="page-header">
      <div>
        <div class="breadcrumb"><span>Admin</span> <ChevronIcon /> <span class="bc-active">Users</span></div>
        <h1 class="page-title">User Management</h1>
        <p class="page-sub">Manage accounts, roles, and user statuses across the platform.</p>
      </div>
      <div class="header-actions">
        <button class="hdr-btn outline"><FilterIcon /> Filters</button>
        <button class="hdr-btn primary"><PlusIcon /> Invite User</button>
      </div>
    </div>


    <div class="stats-row">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
          <component :is="stat.icon" />
        </div>
        <div>
          <div class="stat-val">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-delta" :class="stat.trend">{{ stat.delta }}</div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="drawerUser" class="drawer-overlay" @click.self="drawerUser = null">
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-avatar" :style="{ background: drawerUser.avatarColor }">{{ drawerUser.initials }}</div>
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

    <!-- Table -->
    <AdminUsersTable @open-user="openDrawer" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminUsersTable from './AdminUsersTable.vue'
import UserStatusBadge from './UserStatusBadge.vue'
import SuspendActivateControls from './SuspendActivateControls.vue'

const ChevronIcon  = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>` }
const FilterIcon   = { template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>` }
const PlusIcon     = { template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>` }
const XIcon        = { template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` }
const UsersIcon    = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` }
const ActiveIcon   = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` }
const SuspendIcon  = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>` }
const FlagIcon2    = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>` }

const stats = [
  { label: 'Total Users',     value: '12,481', delta: '+124 this week', trend: 'up',   icon: UsersIcon,   iconBg: '#eff6ff', iconColor: '#3b82f6' },
  { label: 'Active Users',    value: '10,902', delta: '+98 this week',  trend: 'up',   icon: ActiveIcon,  iconBg: '#f0fdf4', iconColor: '#16a34a' },
  { label: 'Suspended',       value: '318',    delta: '-12 this week',  trend: 'down', icon: SuspendIcon, iconBg: '#fff7ed', iconColor: '#c2410c' },
  { label: 'Flagged Accounts',value: '47',     delta: '+5 this week',   trend: 'up',   icon: FlagIcon2,   iconBg: '#fef2f2', iconColor: '#b91c1c' },
]

const drawerUser = ref(null)
const drawerDetails = computed(() => drawerUser.value ? [
  { label: 'User ID',   value: drawerUser.value.id },
  { label: 'Role',      value: drawerUser.value.role },
  { label: 'Joined',    value: drawerUser.value.joined },
  { label: 'Reports',   value: drawerUser.value.reports },
  { label: 'Status',    value: drawerUser.value.status },
] : [])

function openDrawer(user) { drawerUser.value = user }
function handleSuspend(id) { if (drawerUser.value?.id === id) drawerUser.value.status = 'suspended' }
function handleActivate(id) { if (drawerUser.value?.id === id) drawerUser.value.status = 'active' }
function handleBan(id) { if (drawerUser.value?.id === id) drawerUser.value.status = 'banned' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');
*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0;
    padding: 0; 
}

.page { 
    display: flex; 
    flex-direction: column; 
    gap: 24px; 
    padding: 28px; 
    background: #f4f5f7; 
    min-height: 100vh; 
    font-family: 'DM Sans', sans-serif; 
}

.page-header { 
    display: flex; 
    align-items: flex-start; 
    justify-content: space-between; 
    gap: 16px; 
    flex-wrap: wrap; 
}

.breadcrumb { 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    font-size: 12px; 
    color: #9aa0b0; 
    margin-bottom: 6px; 
}

.bc-active { 
    color: #4f6ef7; 
    font-weight: 500; 
}

.page-title { 
    font-family: 'Syne', sans-serif; 
    font-size: 24px; 
    font-weight: 700; 
    color: #16181d; 
}

.page-sub { 
    font-size: 13px; 
    color: #6b7080; 
    margin-top: 4px; 
}

.header-actions { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

.hdr-btn { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    padding: 8px 16px; 
    border-radius: 8px; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all .15s; 
}

.hdr-btn.outline { 
    background: #fff; 
    border: 1px solid #e8e9ec; 
    color: #374151; 
}

.hdr-btn.outline:hover { 
    background: #f4f5f7; 
}

.hdr-btn.primary { 
    background: #4f6ef7; 
    border: 1px solid #4f6ef7; 
    color: #fff; 
}

.hdr-btn.primary:hover { 
    background: #3b5bdb; 
}

.stats-row { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 14px; 
}

.stat-card { 
    background: #fff; 
    border: 1px solid #e8e9ec;
    border-radius: 12px; 
    padding: 16px 18px; 
    display: flex; 
    align-items: center; 
    gap: 14px; 
    box-shadow: 0 1px 3px rgba(0,0,0,.04); 
}

.stat-icon { 
    width: 42px; 
    height: 42px; 
    border-radius: 10px; 
    display: grid; 
    place-items: center; 
    flex-shrink: 0; 
}

.stat-val { 
    font-family: 'Syne', sans-serif; 
    font-size: 20px; 
    font-weight: 700; 
    color: #16181d; 
    line-height: 1.1; 
}

.stat-label { 
    font-size: 12px; 
    color: #6b7080; 
    margin-top: 2px; 
}

.stat-delta { 
    font-size: 11px; 
    font-weight: 600; 
    margin-left: auto; 
    white-space: nowrap; 
}

.stat-delta.up { 
    color: #16a34a; 
}

.stat-delta.down { 
    color: #dc2626; 
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
    width: 360px; 
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
    border-bottom: 1px solid #e8e9ec; 
}

.drawer-avatar { 
    width: 52px; 
    height: 52px; 
    border-radius: 50%; 
    color: #fff; 
    font-size: 18px; 
    font-weight: 700; 
    display: grid; 
    place-items: center; 
    flex-shrink: 0; 
}

.drawer-info { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    gap: 4px; 
}

.drawer-name {
    font-family: 'Syne', sans-serif; 
    font-size: 16px; 
    font-weight: 700; 
    color: #16181d; 
}

.drawer-email { 
    font-size: 12px; 
    color: #6b7080; 
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
    grid-template-columns: 1fr 1fr; gap: 
    12px; 
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
    color: #16181d; 
    text-transform: capitalize; 
}

.drawer-section-title { 
    font-size: 12px; 
    font-weight: 700; 
    color: #9aa0b0; 
    text-transform: uppercase; 
    letter-spacing: .05em; 
}

@media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } .page { padding: 16px; } }
</style>