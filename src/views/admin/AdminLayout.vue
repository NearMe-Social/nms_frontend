<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav
      class="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-6 gap-4"
    >
      <div class="flex items-center gap-2 w-44 shrink-0">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-black text-sm">N</span>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-800 leading-none">NearMe Admin</p>
          <p class="text-xs text-gray-400 leading-none mt-0.5">Management Suite</p>
        </div>
      </div>

      <div class="flex-1 max-w-md">
        <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
          <Search class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search users, IDs..."
            class="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <Bell class="w-4 h-4 text-gray-500" />
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <HelpCircle class="w-4 h-4 text-gray-500" />
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <Grid class="w-4 h-4 text-gray-500" />
        </button>
        <img
          src="https://i.pravatar.cc/150?img=12"
          class="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400"
        />
      </div>
    </nav>

    <div class="flex flex-1">
      <aside class="w-44 shrink-0 bg-white border-r border-gray-200 flex flex-col py-4 px-3 gap-1">
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
          <img
            src="https://i.pravatar.cc/150?img=12"
            class="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-700 truncate">Da Vid</p>
            <p class="text-xs text-gray-400 truncate">System Administrator</p>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Search,
  Bell,
  HelpCircle,
  Grid,
  LayoutDashboard,
  Flag,
  Users,
  Shield,
} from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/moderation', label: 'Moderation', icon: Shield },
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>
