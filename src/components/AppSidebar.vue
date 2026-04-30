<template>
  <aside class="app-sidebar">
    <RouterLink class="brand" to="/">
      <span class="brand-main">Nearme</span>
      <span class="brand-sub">Social</span>
    </RouterLink>

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

    <RouterLink class="create-link" to="/discussion/new">
      <Plus class="nav-icon" />
      <span>Create Discussion</span>
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
  { to: '/discussion', label: 'Discussions', icon: Users },
  { to: '/chat', label: 'Private Chat', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.app-sidebar {
  width: 224px;
  flex: 0 0 224px;
  flex-direction: column;
  gap: 18px;
  padding: 20px 14px;
  border-right: 1px solid #e3ebf2;
  background: #f8fbff;
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 0 8px;
  text-decoration: none;
}

.brand-main {
  color: #0f5f71;
  font-size: 1.1rem;
  font-weight: 900;
}

.brand-sub {
  color: #8a9baa;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  padding: 9px 10px;
  color: #4b6477;
  text-decoration: none;
  font-size: 0.86rem;
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
  padding: 12px;
}
</style>
