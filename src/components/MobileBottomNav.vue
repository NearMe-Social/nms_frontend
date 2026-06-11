<template>
  <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="mobile-nav-item"
      :class="{ active: isActive(item.to), primary: item.primary }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <span v-if="item.primary" class="primary-icon">
        <component :is="item.icon" />
      </span>
      <component :is="item.icon" v-else />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Bell, Home, MapPin, MessageCircle, Plus, User } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/nearby', label: 'Nearby', icon: MapPin },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/create-post', label: 'Post', icon: Plus, primary: true },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1200;
  display: none;
  align-items: flex-end;
  justify-content: space-around;
  border-top: 1px solid #e5edf2;
  background: #fff;
  padding: 9px 6px max(9px, env(safe-area-inset-bottom));
  box-shadow: 0 -8px 24px rgba(15, 45, 70, 0.09);
  backdrop-filter: blur(12px);
}

.mobile-nav-item {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
  color: #8293a2;
  text-decoration: none;
  font-size: 0.64rem;
  font-weight: 700;
}

.mobile-nav-item > svg {
  width: 19px;
  height: 19px;
}

.mobile-nav-item.active {
  color: #0f766e;
}

.mobile-nav-item.primary {
  margin-top: -20px;
}

.primary-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0f8a7c;
  color: #fff;
  box-shadow: 0 8px 18px rgba(15, 138, 124, 0.3);
}

.primary-icon svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 767px) {
  .mobile-bottom-nav {
    display: flex;
  }
}
</style>
