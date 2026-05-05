<template>
  <nav class="navbar">
    <div class="mobile-top">
      <button class="mobile-menu" type="button" @click="toggleMenu">
        <Menu class="icon" />
      </button>
      <div class="mobile-title">NearMe Social</div>
      <button class="mobile-search" type="button">
        <Search class="icon" />
      </button>
    </div>

    <div v-if="!isMobile || isMenuOpen" :class="['desktop-nav', { 'mobile-open': isMenuOpen }]">
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
          @click="navigateTo(item)"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.label }}</span>
        </div>
        <button class="nav-create" type="button" @click="createPost()">
          <PlusIcon :size="15" />
          <span>Create Post</span>
        </button>
      </div>

      <div class="nav-footer">
        <div
          v-for="item in footerItems"
          :key="item.label"
          class="nav-item nav-footer-item"
          @click="navigateTo(item)"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="footer-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="mobile-bottom">
      <button
        v-for="item in bottomItems"
        :key="item.label"
        :class="[{ active: activeItem === item.label }, item.label === 'Create' ? 'mobile-create' : '']"
        type="button"
        @click="navigateTo(item)"
      >
        <component :is="item.icon" class="icon" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Home, Users, MessageSquare, Compass,
  User, Bell, HelpCircle, LogOut, Plus as PlusIcon,
  Menu, Search,
} from 'lucide-vue-next'

defineProps({
  activeItem: { type: String, default: 'Profile' },
})

const emit = defineEmits(['navigate', 'create-post'])
const router = useRouter()

const width = ref(window.innerWidth)
const isMenuOpen = ref(false)

const isMobile = computed(() => width.value <= 900)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const updateWidth = () => {
  width.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

const navItems = [
  { label: 'Home',         icon: Home,           route: '/' },
  { label: 'Community',    icon: Users,          route: '/nearby' },
  { label: 'Private Chat', icon: MessageSquare,  route: '/chat' },
  { label: 'Discovery',    icon: Compass,        route: '/nearby' },
  { label: 'Profile',      icon: User,           route: '/profile' },
]

const footerItems = [
  { label: 'Help',   icon: HelpCircle, route: '/help' },
  { label: 'Logout', icon: LogOut,    route: '/logout' },
]

const bottomItems = [
  { label: 'Home',     icon: Home,     route: '/' },
  { label: 'Discover', icon: Compass,  route: '/nearby' },
  { label: 'Create',   icon: PlusIcon, action: 'create-post', route: '/discussion/new' },
  { label: 'Alerts',   icon: Bell,     route: '/notifications' },
  { label: 'Profile',  icon: User,     route: '/profile' },
]

const navigateTo = (item) => {
  if (item.action === 'create-post') {
    emit('create-post')
  }
  if (item.route) {
    router.push(item.route)
  }
  if (item.label) {
    emit('navigate', item.label)
  }
}

const createPost = () => {
  emit('create-post')
  router.push('/discussion/new')
}
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

.mobile-top {
  display: none;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.mobile-bottom {
  display: none;
  width: 100%;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -10px 30px rgba(15, 45, 70, 0.08);
}

.mobile-bottom button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  padding: 8px 0;
  border-radius: 14px;
  cursor: pointer;
}

.mobile-bottom button.active { color: #0f5f71; }
.mobile-bottom button.mobile-create { color: #0f5f71; }

.mobile-bottom button .icon {
  width: 20px;
  height: 20px;
}

.mobile-menu,
.mobile-search {
  width: 38px;
  height: 38px;
  border: none;
  background: #f0f2f8;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1f36;
  cursor: pointer;
}

.mobile-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f5f71;
}

.desktop-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav-brand { margin-bottom: 36px; }

.nav-brand-name {
  font-family: 'DM Serif Display', serif;
  font-size: 23px; /* Increased from 17px */
  color: #1a56db;
  letter-spacing: -0.5px;
  font-weight: 700;
}

.nav-brand-sub {
  font-size: 12px; /* Increased from 10px */
  color: #6b7280;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 4px;
}

.nav-links {
  flex: 1 1 auto;
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
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  padding-bottom: 50px;
}

.nav-footer-item {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
}

.footer-label {
  display: inline !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  font-size: 13.5px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .navbar {
    position: relative;
    width: 100%;
    border-right: none;
    border-bottom: none;
    padding: 0;
    display: block;
    background: transparent;
    box-shadow: none;
  }
  .desktop-nav.mobile-open .nav-brand {
    display: none;
  }

  .desktop-nav {
    display: none;
  }

  .mobile-top {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 130;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(14px);
    padding: 12px 16px;
    gap: 12px;
  }

  .mobile-bottom {
    display: grid;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 120;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -10px 25px rgba(15, 45, 70, 0.08);
  }

  .desktop-nav.mobile-open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 62px;
    left: 0;
    bottom: 70px;
    width: min(260px, 80vw);
    max-width: 260px;
    z-index: 140;
    padding: 20px 14px 24px;
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    box-shadow: 4px 0 24px rgba(15, 45, 70, 0.12);
    overflow-y: auto;
    box-sizing: border-box;
  }

  .desktop-nav.mobile-open .nav-links {
    flex: 1;
    overflow-y: auto;
  }

  .desktop-nav.mobile-open .nav-footer {
    margin-top: auto;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    gap: 2px;
  }
}
</style>