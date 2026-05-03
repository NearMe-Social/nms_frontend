<template>
  <nav class="navbar">
    <div class="nav-brand">
      <div class="nav-brand-name">NearMe Social</div>
      <div class="nav-brand-sub">Editorial Community</div>
    </div>

    <div class="nav-links">
      <div
        v-for="item in navItems"
        :key="item.label"
        class="nav-item"
        :class="{ active: activeItem === item.label }"
        @click="emit('navigate', item.label)"
      >
        <component :is="item.icon" class="nav-icon" />
        <span>{{ item.label }}</span>
      </div>
    </div>

    <button class="nav-create" @click="emit('create-post')">
      <PlusIcon :size="15" />
      <span>Create Post</span>
    </button>

    <div class="nav-footer">
      <div
        v-for="item in footerItems"
        :key="item.label"
        class="nav-item"
        @click="emit('navigate', item.label)"
      >
        <component :is="item.icon" class="nav-icon" />
        <span>{{ item.label }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  Home, Users, MessageSquare, Compass,
  User, HelpCircle, LogOut, Plus as PlusIcon,
} from 'lucide-vue-next'

defineProps({
  activeItem: { type: String, default: 'Profile' },
})

const emit = defineEmits(['navigate', 'create-post'])

const navItems = [
  { label: 'Home',         icon: Home },
  { label: 'Community',    icon: Users },
  { label: 'Private Chat', icon: MessageSquare },
  { label: 'Discovery',    icon: Compass },
  { label: 'Profile',      icon: User },
]

const footerItems = [
  { label: 'Help',   icon: HelpCircle },
  { label: 'Logout', icon: LogOut },
]
</script>

<style scoped>
.navbar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  padding: 28px 16px;
  font-family: 'DM Sans', sans-serif;
}

.nav-brand { margin-bottom: 36px; }

.nav-brand-name {
  font-family: 'DM Serif Display', serif;
  font-size: 17px;
  color: #1a56db;
  letter-spacing: -0.3px;
}

.nav-brand-sub {
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  user-select: none;
}

.nav-item:hover { background: #f0f2f8; color: #1a1f36; }

.nav-item.active {
  background: #eff4ff;
  color: #1a56db;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  background: #1a56db;
  border-radius: 0 2px 2px 0;
}

.nav-icon { width: 18px; height: 18px; flex-shrink: 0; }

.nav-create {
  margin-top: 20px;
  background: #1a56db;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nav-create:hover { background: #1348c0; }

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>