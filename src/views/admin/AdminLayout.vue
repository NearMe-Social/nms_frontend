<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <nav
      class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 min-h-14 flex flex-wrap items-center px-4 py-3 sm:px-6 sm:py-0 gap-3 sm:gap-4"
    >
      <div class="flex items-center gap-2 sm:w-44 shrink-0">
        <div class="admin-brand-symbol" aria-hidden="true">
          <img :src="nearmeLogo" alt="" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-800 leading-none">NearMe Admin</p>
          <p class="text-xs text-gray-400 leading-none mt-0.5">Trust Console</p>
        </div>
      </div>

      <div class="hidden md:block flex-1 max-w-md">
        <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
          <Search class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search users, IDs..."
            class="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <Bell class="w-4 h-4 text-gray-500" />
        </button>
        <button
          class="hidden sm:flex w-8 h-8 items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <HelpCircle class="w-4 h-4 text-gray-500" />
        </button>
        <button
          class="hidden sm:flex w-8 h-8 items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <Grid class="w-4 h-4 text-gray-500" />
        </button>
        <UserAvatar
          :src="profileImage"
          :username="adminUsername"
          :alt="`${adminDisplayName} profile`"
          class="admin-top-avatar"
        />
      </div>

      <div class="w-full md:hidden">
        <div class="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
          <Search class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search users, IDs..."
            class="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      <div class="w-full md:hidden overflow-x-auto pb-0.5">
        <div class="flex gap-2 min-w-max">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              isActive(item.to)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 bg-white border border-slate-200',
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="flex flex-1">
      <aside class="hidden md:flex w-44 shrink-0 bg-white border-r border-slate-200 flex-col py-4 px-3 gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive(item.to)
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
          ]"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
        </RouterLink>

        <!-- Bottom user info -->
        <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2 px-2">
          <UserAvatar
            :src="profileImage"
            :username="adminUsername"
            :alt="`${adminDisplayName} profile`"
            class="admin-sidebar-avatar"
          />
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-700 truncate">{{ adminDisplayName }}</p>
            <p class="text-xs text-gray-400 truncate">{{ adminRoleLabel }}</p>
          </div>
        </div>
      </aside>

      <main class="flex-1 min-w-0 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Search,
  Bell,
  HelpCircle,
  Grid,
  LayoutDashboard,
  Flag,
  Users,
} from 'lucide-vue-next'
import nearmeLogo from '@/assets/icons/main_logo.svg'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/UserAvatar.vue'

const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/users', label: 'Users', icon: Users },
]

const adminUsername = computed(() => auth.user?.username || 'admin')
const adminDisplayName = computed(() => {
  const firstName = (auth.user?.first_name || auth.user?.firstName || '').trim()
  const lastName = (auth.user?.last_name || auth.user?.lastName || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  return fullName || adminUsername.value
})
const adminRoleLabel = computed(() =>
  auth.user?.role === 'ADMIN' ? 'System Administrator' : auth.user?.role || 'Administrator',
)
const profileImage = computed(() => {
  const profile = auth.user?.profile
  const nestedProfileImage =
    profile && typeof profile === 'object' && 'profile_image' in profile
      ? profile.profile_image
      : null

  return auth.user?.profile_image || auth.user?.profileImage || nestedProfileImage || null
})

function isActive(path) {
  if (path === '/admin/dashboard') {
    return route.path === '/admin' || route.path === '/admin/dashboard'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.admin-brand-symbol {
  width: 34px;
  height: 34px;
  position: relative;
  flex: 0 0 34px;
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.18),
    0 8px 18px rgba(14, 165, 233, 0.12);
}

.admin-brand-symbol img {
  width: 166%;
  height: 166%;
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  object-fit: cover;
  transform: translate(-50%, -50%);
}

.admin-top-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  font-size: 0.8rem;
  box-shadow: 0 0 0 2px #60a5fa;
}

.admin-sidebar-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  font-size: 0.72rem;
}
</style>
