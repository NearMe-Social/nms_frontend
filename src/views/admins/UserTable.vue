<template>
  <div class="users-table-wrap">
    <div class="table-toolbar">
      <div class="search-box">
        <SearchIcon class="s-icon" />
        <input v-model="search" type="text" placeholder="Search users…" class="s-input" />
      </div>
      <div class="toolbar-right">
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>
        <button class="export-btn"><DownloadIcon class="b-icon" /> Export</button>
      </div>
    </div>

   
    <div class="table-scroll">
      <table class="users-table">
        <thead>
          <tr>
            <th class="col-check">
              <input type="checkbox" class="chk" @change="toggleAll" :checked="allSelected" />
            </th>
            <th @click="sortBy('name')" class="sortable">
              User <SortIcon class="sort-icon" :class="{ active: sortKey === 'name' }" />
            </th>
            <th @click="sortBy('email')" class="sortable">
              Email <SortIcon class="sort-icon" :class="{ active: sortKey === 'email' }" />
            </th>
            <th @click="sortBy('role')" class="sortable">
              Role <SortIcon class="sort-icon" :class="{ active: sortKey === 'role' }" />
            </th>
            <th @click="sortBy('status')" class="sortable">
              Status <SortIcon class="sort-icon" :class="{ active: sortKey === 'status' }" />
            </th>
            <th @click="sortBy('joined')" class="sortable">
              Joined <SortIcon class="sort-icon" :class="{ active: sortKey === 'joined' }" />
            </th>
            <th @click="sortBy('reports')" class="sortable col-num">
              Reports <SortIcon class="sort-icon" :class="{ active: sortKey === 'reports' }" />
            </th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-row"
            :class="{ selected: selectedIds.includes(user.id), suspended: user.status === 'suspended' || user.status === 'banned' }"
          >
            <td class="col-check">
              <input type="checkbox" class="chk" :checked="selectedIds.includes(user.id)" @change="toggleSelect(user.id)" />
            </td>
            <td class="col-user">
              <div class="user-cell">
                <div class="avatar" :style="{ background: user.avatarColor }">{{ user.initials }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-id">ID: {{ user.id }}</span>
                </div>
              </div>
            </td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-role">
              <span class="role-pill" :class="user.role">{{ user.role }}</span>
            </td>
            <td class="col-status">
              <UserStatusBadge :status="user.status" />
            </td>
            <td class="col-date">{{ user.joined }}</td>
            <td class="col-num">
              <span class="report-count" :class="{ warn: user.reports > 0 }">{{ user.reports }}</span>
            </td>
            <td class="col-actions">
              <SuspendActivateControls
                :status="user.status"
                :userId="user.id"
                @suspend="handleSuspend"
                @activate="handleActivate"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="no-results">
        <span>No users match your search.</span>
      </div>
    </div>

    
    <div class="table-footer">
      <span class="footer-info">Showing {{ filteredUsers.length }} of {{ users.length }} users</span>
      <div class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹ Prev</button>
        <span class="page-num">Page {{ page }}</span>
        <button class="page-btn" @click="page++">Next ›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserStatusBadge from './UserStatusBadge.vue'
import SuspendActivateControls from './SuspendActivateControls.vue'

const SearchIcon = { template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` }
const SortIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10l4-4 4 4M16 14l-4 4-4-4"/></svg>` }
const DownloadIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>` }

const search = ref('')
const filterStatus = ref('')
const sortKey = ref('name')
const sortDir = ref(1)
const page = ref(1)
const selectedIds = ref([])

const users = ref([
  { id: 'U-001', name: 'Alex Kim', initials: 'AK', email: 'alex.kim@email.com', role: 'user', status: 'active', joined: 'Jan 12, 2024', reports: 3, avatarColor: '#4f6ef7' },
  { id: 'U-002', name: 'Maria Santos', initials: 'MS', email: 'maria.s@email.com', role: 'moderator', status: 'active', joined: 'Mar 4, 2024', reports: 0, avatarColor: '#16a34a' },
  { id: 'U-003', name: 'crypto_bot_01', initials: 'CB', email: 'cb01@fastmail.com', role: 'user', status: 'suspended', joined: 'Nov 20, 2023', reports: 12, avatarColor: '#dc2626' },
  { id: 'U-004', name: 'Urban Explorer', initials: 'UE', email: 'urban@explore.io', role: 'creator', status: 'pending', joined: 'Apr 2, 2024', reports: 56, avatarColor: '#d97706' },
  { id: 'U-005', name: 'Jamie Lee', initials: 'JL', email: 'jamie.lee@mail.com', role: 'user', status: 'active', joined: 'Feb 18, 2024', reports: 0, avatarColor: '#7c3aed' },
  { id: 'U-006', name: 'BadActor99', initials: 'BA', email: 'bad99@temp.com', role: 'user', status: 'banned', joined: 'Dec 5, 2023', reports: 34, avatarColor: '#374151' },
])

const allSelected = computed(() => selectedIds.value.length === filteredUsers.value.length)

const filteredUsers = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
  }
  if (filterStatus.value) list = list.filter(u => u.status === filterStatus.value)
  return [...list].sort((a, b) => {
    const av = a[sortKey.value], bv = b[sortKey.value]
    return av > bv ? sortDir.value : av < bv ? -sortDir.value : 0
  })
})

function sortBy(key) {
  if (sortKey.value === key) sortDir.value *= -1
  else { sortKey.value = key; sortDir.value = 1 }
}

function toggleAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = filteredUsers.value.map(u => u.id)
}

function toggleSelect(id) {
  const i = selectedIds.value.indexOf(id)
  if (i > -1) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(id)
}

function handleSuspend(id) {
  const u = users.value.find(x => x.id === id)
  if (u) u.status = 'suspended'
}

function handleActivate(id) {
  const u = users.value.find(x => x.id === id)
  if (u) u.status = 'active'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');

*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

:root {
  --bg: #f4f5f7; --surface: #fff; --border: #e8e9ec;
  --text: #16181d; --muted: #6b7080; --faint: #9aa0b0;
  --accent: #4f6ef7; --accent-light: #eef0fd;
  --danger: #e5423b; --warn: #f5821f; --success: #16a34a;
  --radius: 10px; --font: 'DM Sans', sans-serif;
}

.users-table-wrap { 
    background: var(--surface); 
    border-radius: var(--radius); 
    border: 1px solid var(--border); 
    overflow: hidden; 
    font-family: var(--font); 
}

.table-toolbar { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 12px; padding: 14px 18px; 
    border-bottom: 1px solid var(--border); 
}

.search-box { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    background: var(--bg); 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    padding: 0 12px; 
    flex: 1; 
    max-width: 280px; 
}

.s-icon { 
    color: var(--faint); 
    flex-shrink: 0; 
}

.s-input { 
    border: none; 
    background: transparent; 
    outline: none; 
    font-family: var(--font); 
    font-size: 13px; 
    padding: 8px 0; 
    width: 100%; 
    color: var(--text); 
}

.s-input::placeholder { 
    color: var(--faint); 
}

.toolbar-right { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

.filter-select { 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    padding: 7px 10px; 
    font-family: var(--font); 
    font-size: 13px; 
    background: var(--surface); 
    color: var(--text); 
    outline: none; 
    cursor: pointer; 
}

.export-btn { 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    padding: 7px 13px; 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    background: var(--surface); 
    font-family: var(--font); 
    font-size: 13px; 
    font-weight: 500; 
    cursor: pointer; 
    color: var(--muted); 
    transition: background .15s; 
}

.export-btn:hover { 
    background: var(--bg); 
    color: var(--text); 
}

.b-icon { 
    flex-shrink: 0; 
}

.table-scroll { 
    overflow-x: auto; 
}

.users-table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 13px; 
}

thead tr { 
    background: var(--bg); 
}

th {
    padding: 10px 14px; 
    text-align: left; 
    font-size: 11.5px; 
    font-weight: 600; 
    color: var(--faint); 
    letter-spacing: .04em; 
    text-transform: uppercase;
    white-space: nowrap; 
}

th.sortable { 
    cursor: pointer; 
    user-select: none; 
}

th.sortable:hover { 
    color: var(--text); 
}

.sort-icon { 
    vertical-align: middle; 
    margin-left: 3px; 
    opacity: .4; 
}

.sort-icon.active { 
    opacity: 1; 
    color: var(--accent); 
}

.user-row td { 
    padding: 12px 14px; 
    border-bottom: 1px solid var(--border); 
    vertical-align: middle; 
}

.user-row:last-child td { 
    border-bottom: none; 
}

.user-row:hover { 
    background: #fafbfc; 
}

.user-row.selected { 
    background: var(--accent-light); 
}

.user-row.suspended { 
    opacity: .7; 
}

.col-check { 
    width: 40px; 
}

.col-num { 
    text-align: right; 
}

.col-actions { 
    width: 160px; 
}

.col-date { 
    color: var(--muted); 
    white-space: nowrap; 
    font-size: 12px; 
}

.col-email { 
    color: var(--muted); 
    font-size: 12px; 
}

.col-role { }

.chk { 
    width: 15px; 
    height: 15px; 
    cursor: pointer; 
    accent-color: var(--accent); 
}

.user-cell { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
}

.avatar { 
    width: 32px; 
    height: 32px; 
    border-radius: 50%; 
    color: #fff; 
    font-size: 12px; 
    font-weight: 600; 
    display: grid; 
    place-items: center; 
    flex-shrink: 0; 
}

.user-name { 
    display: block; 
    font-weight: 600; 
    font-size: 13px; 
}

.user-id { 
    display: block; 
    font-size: 11px; 
    color: var(--faint); 
}

.role-pill { 
    font-size: 11px; 
    font-weight: 600;
    border-radius: 5px; 
    padding: 2px 8px; 
    background: var(--bg); 
    color: var(--muted); 
    text-transform: capitalize; 
}

.role-pill.moderator { 
    background: #eff6ff; 
    color: #1d4ed8; 
}

.role-pill.creator { 
    background: #fef3c7; 
    color: #92400e; 
}

.role-pill.admin { 
    background: #fdf4ff; 
    color: #7e22ce; 
}

.report-count { 
    font-weight: 600; 
    color: var(--faint); 
}

.report-count.warn { 
    color: var(--danger); 
}

.no-results { 
    text-align: center; 
    padding: 32px; color: var(--muted); 
    font-size: 13px; 
}

.table-footer { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 12px 18px; 
    border-top: 1px solid var(--border); 
    background: var(--bg); 
}

.footer-info { 
    font-size: 12px; 
    color: var(--muted); 
}

.pagination { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

.page-btn { 
    border: 1px solid var(--border); 
    border-radius: 6px; 
    padding: 5px 10px; 
    background: var(--surface); 
    font-family: var(--font); 
    font-size: 12px; 
    cursor: pointer; 
    color: var(--text); 
    transition: background .15s; 
}

.page-btn:disabled { 
    opacity: .4; 
    cursor: not-allowed; 
}

.page-btn:not(:disabled):hover { 
    background: var(--accent-light); 
    color: var(--accent); 
    border-color: var(--accent); 
}

.page-num { 
    font-size: 12px; 
    color: var(--muted); 
}

</style>