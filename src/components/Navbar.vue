<!-- <template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/profile">Profile</RouterLink>
    <RouterLink to="/chat">Chat</RouterLink>
    <RouterLink to="/notifications">Notifications</RouterLink>
    <RouterLink to="/settings">Settings</RouterLink>
    <button @click="handleLogout">Logout</button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
nav {
  display: flex;
  gap: 16px;
  padding: 12px 24px;
 
}
nav a {

  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}
button {
  margin-left: auto;
  cursor: pointer;
}
</style> -->
<template>
  <nav class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
    <div class="w-full px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xl font-black text-teal-600 tracking-tight">Nearme</span>
        <span class="text-xs font-semibold text-gray-400 tracking-widest">Social</span>
      </div>

      <!-- Search -->
      <div class="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 gap-2">
        <Search class="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search the commons..."
          class="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
        />
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-1 shrink-0">
        <button class="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <Search class="w-5 h-5 text-gray-500" />
        </button>
        <RouterLink to="/notifications"
          class="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <Bell class="w-5 h-5 text-gray-500" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </RouterLink>
        <RouterLink to="/settings"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <Settings class="w-5 h-5 text-gray-500" />
        </RouterLink>
        <RouterLink to="/profile" class="ml-1">
          <img
            src="https://i.pravatar.cc/150?img=12"
            class="w-9 h-9 rounded-full object-cover ring-2 ring-teal-400"
          />
        </RouterLink>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { Search, Bell, Settings } from 'lucide-vue-next'
</script>