<template>
  <div class="users-table-wrap">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="search-box">
        <SearchIcon class="s-icon" size="18" />
        <input
          v-model="search"
          type="text"
          placeholder="Search users..."
          class="s-input"
        />
      </div>
      <div class="toolbar-right">

        <select v-model="filterStatus" class="filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>

        <button class="export-btn">
          <DownloadIcon size="16" />
          Export
        </button>

      </div>
    </div>

    <!-- Table -->
    <div class="table-scroll">

      <table class="users-table">

        <thead>
          <tr>
            <th class="col-check">
              <input
                type="checkbox"
                class="chk"
                @change="toggleAll"
                :checked="allSelected"
              />
            </th>

            <th @click="sortBy('name')" class="sortable">
              User
              <SortIcon class="sort-icon" size="14" />
            </th>

            <th @click="sortBy('email')" class="sortable">
              Email
              <SortIcon class="sort-icon" size="14" />
            </th>

            <th @click="sortBy('role')" class="sortable">
              Role
              <SortIcon class="sort-icon" size="14" />
            </th>

            <th @click="sortBy('status')" class="sortable">
              Status
              <SortIcon class="sort-icon" size="14" />
            </th>

            <th @click="sortBy('joined')" class="sortable">
              Joined
              <SortIcon class="sort-icon" size="14" />
            </th>

            <th class="col-num">
              Reports
            </th>

            <th class="col-actions">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-row"
          >

            <td class="col-check">
              <input
                type="checkbox"
                class="chk"
                :checked="selectedIds.includes(user.id)"
                @change="toggleSelect(user.id)"
              />
            </td>

            <td>
              <div class="user-cell">

                <div
                  class="avatar"
                  :style="{ background: user.avatarColor }"
                >
                  {{ user.initials }}
                </div>

                <div class="user-info">
                  <span class="user-name">
                    {{ user.name }}
                  </span>

                  <span class="user-id">
                    {{ user.id }}
                  </span>
                </div>

              </div>
            </td>

            <td class="col-email">
              {{ user.email }}
            </td>

            <td>
              <span class="role-pill" :class="user.role">
                {{ user.role }}
              </span>
            </td>

            <td>
              <span class="status-pill" :class="user.status">
                {{ user.status }}
              </span>
            </td>

            <td class="col-date">
              {{ user.joined }}
            </td>

            <td class="col-num">
              <span
                class="report-count"
                :class="{ warn: user.reports > 0 }"
              >
                {{ user.reports }}
              </span>
            </td>

            <td class="col-actions">

              <button class="action-btn suspend">
                Suspend
              </button>

              <button class="action-btn activate">
                Activate
              </button>

            </td>

          </tr>

        </tbody>

      </table>

      <div
        v-if="filteredUsers.length === 0"
        class="no-results"
      >
        No users found.
      </div>

    </div>

    <!-- Footer -->
    <div class="table-footer">

      <span class="footer-info">
        Showing {{ filteredUsers.length }}
        of {{ users.length }} users
      </span>

      <div class="pagination">

        <button
          class="page-btn"
          :disabled="page === 1"
          @click="page--"
        >
          Prev
        </button>

        <span class="page-num">
          Page {{ page }}
        </span>

        <button
          class="page-btn"
          @click="page++"
        >
          Next
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import {
  Search,
  ArrowUpDown,
  Download
} from 'lucide-vue-next'

const SearchIcon = Search
const SortIcon = ArrowUpDown
const DownloadIcon = Download

const search = ref('')
const filterStatus = ref('')
const sortKey = ref('name')
const sortDir = ref(1)
const page = ref(1)

const selectedIds = ref([])

const users = ref([
  {
    id: 'U-001',
    name: 'Alex Kim',
    initials: 'AK',
    email: 'alex@email.com',
    role: 'user',
    status: 'active',
    joined: 'Jan 12, 2024',
    reports: 3,
    avatarColor: '#6366f1'
  },

  {
    id: 'U-002',
    name: 'Maria Santos',
    initials: 'MS',
    email: 'maria@email.com',
    role: 'moderator',
    status: 'active',
    joined: 'Feb 18, 2024',
    reports: 0,
    avatarColor: '#16a34a'
  },

  {
    id: 'U-003',
    name: 'Bad Actor',
    initials: 'BA',
    email: 'badactor@email.com',
    role: 'user',
    status: 'suspended',
    joined: 'Mar 4, 2024',
    reports: 14,
    avatarColor: '#dc2626'
  }
])

const filteredUsers = computed(() => {

  let list = users.value

  if (search.value) {

    const q = search.value.toLowerCase()

    list = list.filter(user =>
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    )
  }

  if (filterStatus.value) {
    list = list.filter(
      u => u.status === filterStatus.value
    )
  }

  return [...list].sort((a, b) => {

    const av = a[sortKey.value]
    const bv = b[sortKey.value]

    return av > bv
      ? sortDir.value
      : av < bv
      ? -sortDir.value
      : 0
  })
})

const allSelected = computed(() => {
  return selectedIds.value.length === filteredUsers.value.length
})

function sortBy(key) {

  if (sortKey.value === key) {
    sortDir.value *= -1
  }

  else {
    sortKey.value = key
    sortDir.value = 1
  }
}

function toggleAll() {

  if (allSelected.value) {
    selectedIds.value = []
  }

  else {
    selectedIds.value =
      filteredUsers.value.map(u => u.id)
  }
}

function toggleSelect(id) {

  const index = selectedIds.value.indexOf(id)

  if (index > -1) {
    selectedIds.value.splice(index, 1)
  }

  else {
    selectedIds.value.push(id)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

:root{
  --font:'Inter',sans-serif;

  --bg:#f5f7fb;
  --surface:#ffffff;

  --border:#edf1f5;

  --text:#111827;
  --muted:#6b7280;
  --faint:#9ca3af;

  --accent:#6366f1;
}

.users-table-wrap{
  background:rgba(255,255,255,.92);

  border-radius:24px;

  overflow:hidden;

  border:1px solid rgba(255,255,255,.5);

  box-shadow:
    0 4px 20px rgba(15,23,42,.04),
    0 1px 3px rgba(15,23,42,.06);

  font-family:var(--font);

  backdrop-filter:blur(14px);
}

/* TOOLBAR */

.table-toolbar{
  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:20px;

  padding:22px 24px;

  border-bottom:1px solid var(--border);
}

.search-box{
  display:flex;
  align-items:center;
  gap:12px;

  width:100%;
  max-width:420px;

  padding:0 16px;

  border-radius:16px;

  background:white;

  border:1px solid #e5e7eb;

  transition:.2s ease;
}

.search-box:focus-within{
  border-color:var(--accent);

  box-shadow:
    0 0 0 4px rgba(99,102,241,.1);
}

.s-icon{
  color:var(--faint);
}

.s-input{
  width:100%;

  padding:14px 0;

  border:none;
  outline:none;

  background:transparent;

  font-size:14px;

  font-family:var(--font);

  color:var(--text);
}

.s-input::placeholder{
  color:var(--faint);
}

.toolbar-right{
  display:flex;
  align-items:center;
  gap:10px;
}

.filter-select{
  height:44px;

  padding:0 14px;

  border-radius:14px;

  border:1px solid #e5e7eb;

  background:white;

  font-size:13px;

  font-family:var(--font);

  outline:none;

  cursor:pointer;
}

.export-btn{
  display:flex;
  align-items:center;
  gap:8px;

  height:44px;

  padding:0 18px;

  border:none;

  border-radius:14px;

  background:var(--accent);

  color:white;

  font-weight:600;

  cursor:pointer;

  transition:.2s ease;
}

.export-btn:hover{
  transform:translateY(-1px);

  box-shadow:
    0 6px 16px rgba(99,102,241,.25);
}

/* TABLE */

.table-scroll{
  overflow-x:auto;
}

.users-table{
  width:100%;
  border-collapse:collapse;
}

thead{
  background:#fafbfc;
}

th{
  padding:18px;

  text-align:left;

  font-size:11px;

  text-transform:uppercase;

  letter-spacing:.08em;

  color:#94a3b8;

  font-weight:700;

  white-space:nowrap;
}

.sortable{
  cursor:pointer;
}

.sort-icon{
  margin-left:4px;

  opacity:.5;
}

.user-row{
  transition:.2s ease;
}

.user-row:hover{
  background:#f8faff;
}

.user-row td{
  padding:18px;

  border-bottom:1px solid #f1f5f9;
}

/* USER */

.user-cell{
  display:flex;
  align-items:center;
  gap:14px;
}

.avatar{
  width:42px;
  height:42px;

  border-radius:14px;

  display:grid;
  place-items:center;

  color:white;

  font-size:13px;
  font-weight:700;

  flex-shrink:0;

  box-shadow:
    0 4px 12px rgba(0,0,0,.12);
}

.user-info{
  display:flex;
  flex-direction:column;
}

.user-name{
  font-size:14px;
  font-weight:600;

  color:var(--text);
}

.user-id{
  font-size:12px;

  color:var(--faint);

  margin-top:2px;
}

.col-email{
  color:var(--muted);

  font-size:13px;
}

.col-date{
  color:var(--muted);

  font-size:13px;
}

/* ROLE */

.role-pill{
  display:inline-flex;
  align-items:center;

  padding:6px 12px;

  border-radius:999px;

  font-size:11px;
  font-weight:700;

  text-transform:capitalize;
}

.role-pill.user{
  background:#eef2ff;
  color:#4338ca;
}

.role-pill.moderator{
  background:#ecfdf5;
  color:#15803d;
}

/* STATUS */

.status-pill{
  display:inline-flex;
  align-items:center;

  padding:6px 12px;

  border-radius:999px;

  font-size:11px;
  font-weight:700;

  text-transform:capitalize;
}

.status-pill.active{
  background:#ecfdf5;
  color:#15803d;
}

.status-pill.suspended{
  background:#fef2f2;
  color:#dc2626;
}

/* REPORT */

.report-count{
  font-weight:700;
}

.report-count.warn{
  color:#dc2626;
}

/* ACTIONS */

.col-actions{
  display:flex;
  gap:8px;
}

.action-btn{
  border:none;

  padding:8px 12px;

  border-radius:10px;

  font-size:12px;
  font-weight:600;

  cursor:pointer;

  transition:.2s ease;
}

.action-btn.suspend{
  background:#fef2f2;
  color:#dc2626;
}

.action-btn.activate{
  background:#ecfdf5;
  color:#15803d;
}

.action-btn:hover{
  transform:translateY(-1px);
}

/* FOOTER */

.table-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:18px 24px;

  border-top:1px solid var(--border);

  background:#fcfcfd;
}

.footer-info{
  font-size:13px;
  color:var(--muted);
}

.pagination{
  display:flex;
  align-items:center;
  gap:10px;
}

.page-btn{
  height:38px;

  padding:0 16px;

  border:none;

  border-radius:12px;

  background:white;

  border:1px solid #e5e7eb;

  cursor:pointer;

  font-weight:600;

  transition:.2s ease;
}

.page-btn:hover{
  background:#f3f4f6;
}

.page-btn:disabled{
  opacity:.4;
  cursor:not-allowed;
}

.page-num{
  font-size:13px;
  color:var(--muted);
}

/* EMPTY */

.no-results{
  padding:50px;

  text-align:center;

  color:var(--muted);

  font-size:14px;
}

/* RESPONSIVE */

@media(max-width:900px){

  .table-toolbar{
    flex-direction:column;
    align-items:stretch;
  }

  .search-box{
    max-width:100%;
  }

  .toolbar-right{
    width:100%;
  }

  .filter-select,
  .export-btn{
    flex:1;
  }
}

@media(max-width:700px){

  .table-footer{
    flex-direction:column;
    gap:14px;
  }
}
</style>