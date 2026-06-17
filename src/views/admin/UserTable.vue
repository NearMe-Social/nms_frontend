<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2 w-72 shadow-sm">
        <Search class="w-4 h-4 text-gray-400 shrink-0" />
        <input
          v-model="search"
          type="text"
          placeholder="Search users..."
          class="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
        />
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="filterStatus"
          class="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 outline-none cursor-pointer hover:bg-gray-50 transition"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <span class="text-xs text-gray-400">
          {{ filteredUsers.length }} visible
        </span>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-3.5 w-10">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300"
                  :checked="allSelected"
                  @change="toggleAll"
                />
              </th>
              <th
                v-for="column in sortableColumns"
                :key="column.key"
                class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy(column.key)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ column.label }}
                  <ArrowUpDown class="w-3.5 h-3.5 text-gray-300" />
                </span>
              </th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody v-if="isLoading">
            <tr>
              <td colspan="8" class="px-5 py-12 text-center text-sm text-gray-400">
                Loading users...
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="error">
            <tr>
              <td colspan="8" class="px-5 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <p class="text-sm font-medium text-red-500">{{ error }}</p>
                  <button
                    @click="$emit('retry')"
                    class="px-3 py-2 rounded-lg bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all duration-200"
                  >
                    Try again
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="filteredUsers.length === 0">
            <tr>
              <td colspan="8" class="px-5 py-12 text-center text-sm text-gray-400">
                No users found
              </td>
            </tr>
          </tbody>

          <TransitionGroup v-else name="row" tag="tbody" class="divide-y divide-gray-50">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-blue-50/30 transition-colors duration-200 ease-out cursor-pointer group"
              @click="emit('open-user', user)"
            >
              <td class="px-5 py-4">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300"
                  :checked="selectedIds.includes(user.id)"
                  @click.stop
                  @change="toggleSelect(user.id)"
                />
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2.5">
                  <UserAvatar
                    :src="user.profileImage"
                    :username="user.username || user.name"
                    :alt="`${user.name} profile`"
                    class="admin-user-avatar ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300 ease-out"
                  />
                  <div class="min-w-0">
                    <p class="font-medium text-gray-700 truncate">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">{{ user.displayId }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-600">{{ user.email }}</td>
              <td class="px-5 py-4">
                <span :class="roleClass(user.role)" class="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span :class="statusClass(user.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-400 text-xs">{{ user.joined }}</td>
              <td class="px-5 py-4">
                <span :class="user.reports > 0 ? 'text-red-600' : 'text-gray-400'" class="text-xs font-semibold">
                  {{ user.reports }}
                </span>
              </td>
              <td class="px-5 py-4">
                <button
                  v-if="user.status === 'active'"
                  @click.stop="emit('suspend-user', user)"
                  class="text-xs font-semibold text-red-600 hover:text-red-700 transition-all duration-200"
                >
                  Suspend
                </button>
                <button
                  v-else
                  @click.stop="emit('activate-user', user)"
                  class="text-xs font-semibold text-green-600 hover:text-green-700 transition-all duration-200"
                >
                  Activate
                </button>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>

      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <p class="text-xs text-gray-400">
          Showing <span class="font-semibold text-gray-600">{{ filteredUsers.length }}</span> of
          <span class="font-semibold text-gray-600">{{ users.length }}</span> users
        </p>
        <div class="flex items-center gap-1">
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-semibold">
            1
          </button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all duration-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['open-user', 'suspend-user', 'activate-user', 'retry'])

const search = ref('')
const filterStatus = ref('')
const sortKey = ref('name')
const sortDir = ref(1)
const selectedIds = ref([])

const sortableColumns = [
  { key: 'name', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'joined', label: 'Joined' },
]

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()
  let list = props.users

  if (query) {
    list = list.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.displayId.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    list = list.filter((user) => user.status === filterStatus.value)
  }

  return [...list].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]

    if (av > bv) return sortDir.value
    if (av < bv) return -sortDir.value
    return 0
  })
})

const allSelected = computed(() => (
  filteredUsers.value.length > 0 &&
  filteredUsers.value.every((user) => selectedIds.value.includes(user.id))
))

function sortBy(key) {
  if (sortKey.value === key) {
    sortDir.value *= -1
    return
  }

  sortKey.value = key
  sortDir.value = 1
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(
      (id) => !filteredUsers.value.some((user) => user.id === id),
    )
    return
  }

  const visibleIds = filteredUsers.value.map((user) => user.id)
  selectedIds.value = [...new Set([...selectedIds.value, ...visibleIds])]
}

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
    return
  }

  selectedIds.value = [...selectedIds.value, id]
}

function roleClass(role) {
  const map = {
    admin: 'bg-blue-50 text-blue-700',
    moderator: 'bg-green-50 text-green-700',
    user: 'bg-gray-100 text-gray-600',
  }

  return map[role] || 'bg-gray-100 text-gray-600'
}

function statusClass(status) {
  const map = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    suspended: 'bg-red-50 text-red-700 border border-red-200',
  }

  return map[status] || 'bg-gray-50 text-gray-600 border border-gray-200'
}
</script>

<style scoped>
.row-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.row-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
  position: absolute;
  width: 100%;
}

.row-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.row-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.row-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.admin-user-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
}
</style>
