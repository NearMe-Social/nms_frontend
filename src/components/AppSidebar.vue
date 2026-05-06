<template>
  <aside class="app-sidebar">
    <div class="community-card">
      <p>Your Commons</p>
      <span>Approximate radius only</span>
    </div>

    <nav class="nav-list" aria-label="Primary navigation">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <component :is="item.icon" class="nav-icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <RouterLink class="create-link" to="/create-post">
      <Plus class="nav-icon" />
      <span>Create Post</span>
    </RouterLink>

    <div class="safety-note">
      <ShieldCheck class="nav-icon" />
      <div>
        <p>Safety</p>
        <span>Report, block, and privacy controls stay available across the app.</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  Bell,
  ClipboardList,
  Home,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Home Feed', icon: Home },
  { to: '/nearby', label: 'Nearby Users', icon: MapPin },
  { to: '/discussions', label: 'My Posts', icon: ClipboardList },
  { to: '/discussion', label: 'Discussions', icon: Users },
  { to: '/chat', label: 'Private Chat', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style scoped>
.app-sidebar {
  width: 208px;
  flex: 0 0 208px;
  flex-direction: column;
  gap: 16px;
  padding: 18px 12px;
  border-right: 1px solid #e3ebf2;
  background: #f8fbff;
}

.community-card {
  border-radius: 14px;
  background: #eef8fb;
  padding: 12px;
}

.community-card p,
.safety-note p {
  margin: 0;
  color: #1f4054;
  font-size: 0.84rem;
  font-weight: 800;
}

.community-card span,
.safety-note span {
  color: #74899b;
  font-size: 0.74rem;
  line-height: 1.45;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item,
.create-link {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  padding: 8px 10px;
  color: #4b6477;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 750;
}

.nav-item:hover {
  background: #edf4f8;
}

.nav-item.active {
  background: #dff4f8;
  color: #0e6378;
}

.create-link {
  justify-content: center;
  background: #0f8a7c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(15, 138, 124, 0.18);
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.safety-note {
  margin-top: auto;
  display: flex;
  gap: 10px;
  border-radius: 14px;
  border: 1px solid #e4edf3;
  background: #fff;
  padding: 10px;
}
</style>
