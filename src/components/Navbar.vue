<template>
  <nav class="top-nav">
    <RouterLink to="/" class="logo">
      <span class="logo-main">Nearme</span>
      <span class="logo-sub">Social</span>
    </RouterLink>

    <div class="search-box">
      <Search class="icon" />
      <input type="text" placeholder="Search the commons..." />
    </div>

    <div class="nav-links">
      <RouterLink to="/" :class="{ active: route.path === '/' }">Feed</RouterLink>
      <RouterLink to="/nearby" :class="{ active: route.path.startsWith('/nearby') }">
        Nearby
      </RouterLink>
      <RouterLink to="/discussions" :class="{ active: route.path.startsWith('/discussion') }">
        Discussions
      </RouterLink>
      <RouterLink to="/chat" :class="{ active: route.path.startsWith('/chat') }">Chat</RouterLink>
    </div>

    <div class="actions">
      <button class="mobile-search" type="button" title="Search">
        <Search class="icon" />
      </button>
      <RouterLink to="/create-post" class="create-action">Create</RouterLink>
      <RouterLink to="/notifications" class="icon-link" title="Notifications">
        <Bell class="icon" />
        <span class="notification-dot"></span>
      </RouterLink>
      <RouterLink to="/settings" class="icon-link" title="Settings">
        <Settings class="icon" />
      </RouterLink>
      <RouterLink to="/profile" class="profile-link" title="Profile">
        <img src="https://i.pravatar.cc/150?img=12" alt="Profile" />
      </RouterLink>
      <button class="icon-link logout-button" type="button" title="Log out" @click="handleLogout">
        <LogOut class="icon" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Bell, LogOut, Search, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid #e7edf3;
  background: rgba(255, 255, 255, 0.96);
  padding: 0 clamp(16px, 3vw, 28px);
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
  backdrop-filter: blur(12px);
}

.logo {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  flex: 0 0 auto;
  text-decoration: none;
}

.logo-main {
  color: #0f5f71;
  font-size: 1.2rem;
  font-weight: 900;
}

.logo-sub {
  color: #8b9aaa;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.search-box {
  width: min(320px, 28vw);
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  background: #f0f5f8;
  padding: 0 14px;
  color: #8495a3;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #29475b;
  font-size: 0.86rem;
}

.nav-links {
  display: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav-links a,
.create-action {
  border-radius: 999px;
  padding: 8px 12px;
  color: #607486;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 800;
}

.nav-links a.active {
  background: #e0f4f8;
  color: #0f6378;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex: 0 0 auto;
}

.create-action {
  background: #0f8a7c;
  color: #fff;
}

.icon-link,
.mobile-search,
.profile-link {
  position: relative;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #516a7d;
  cursor: pointer;
}

.logout-button:hover {
  background: #fff1f2;
  color: #e11d48;
}

.icon {
  width: 18px;
  height: 18px;
}

<<<<<<< HEAD
      <!-- Right actions -->
      <div class="flex items-center gap-1 shrink-0">
        <button class="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <Search class="w-5 h-5 text-gray-500" />
        </button>
        <RouterLink
          to="/create-post"
          class="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
        >
          <Plus class="w-4 h-4" />
          Create Post
        </RouterLink>
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
=======
.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #ef4444;
}
>>>>>>> Development

.profile-link img {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 0 0 2px #2dd4bf;
}

<<<<<<< HEAD
<script setup>
import { Search, Bell, Settings, Plus } from 'lucide-vue-next'
</script>
=======
.mobile-search {
  display: none;
}

@media (max-width: 980px) {
  .search-box {
    margin-left: auto;
    width: min(280px, 38vw);
  }
}

@media (min-width: 641px) and (max-width: 767px) {
  .nav-links {
    display: flex;
  }
}

@media (max-width: 640px) {
  .top-nav {
    gap: 10px;
  }

  .search-box,
  .create-action,
  .nav-links,
  .actions .icon-link[title='Settings'] {
    display: none;
  }

  .mobile-search {
    display: inline-flex;
  }
}
</style>
>>>>>>> Development
