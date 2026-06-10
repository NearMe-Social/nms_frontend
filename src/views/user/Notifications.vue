<template>
  <div class="min-h-screen bg-[#f4f7fb]">
    <Navbar />

    <div class="flex w-full gap-4 xl:gap-6">
      <AppSidebar class="hidden md:flex" />

      <main class="flex-1 flex flex-col gap-4 min-w-0 px-4 py-5 md:px-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
            <p class="mt-2 text-sm font-medium text-slate-400">
              Stay updated with what's happening nearby.
            </p>
          </div>
          <button
            v-if="unreadCount > 0"
            class="text-sm font-semibold text-teal-600 hover:underline"
            @click="markAllRead"
          >
            Mark all as read
          </button>
        </div>

        <div v-if="loading" class="flex flex-col gap-3">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-white rounded-[18px] p-5 ring-1 ring-slate-200/70 flex items-start gap-4 animate-pulse"
          >
            <div class="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
            <div class="flex-1 flex flex-col gap-2 pt-1">
              <div class="h-3 bg-slate-100 rounded-full w-3/4" />
              <div class="h-3 bg-slate-100 rounded-full w-1/3" />
            </div>
          </div>
        </div>

        <div
          v-else-if="error"
          class="bg-white rounded-[18px] p-8 text-center ring-1 ring-rose-100 flex flex-col items-center gap-3"
        >
          <AlertCircle class="w-8 h-8 text-rose-400" />
          <p class="text-sm font-semibold text-rose-600">{{ error }}</p>
          <button
            class="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition"
            @click="fetchNotifications"
          >
            Retry
          </button>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="bg-white rounded-[18px] p-10 text-center ring-1 ring-slate-200/70 flex flex-col items-center gap-3"
        >
          <Bell class="w-10 h-10 text-slate-300" />
          <p class="text-base font-bold text-slate-700">No notifications yet</p>
          <p class="text-sm text-slate-400 max-w-xs">
            When something happens nearby, you'll see it here.
          </p>
        </div>

        <!-- ONLY THE NOTIFICATION CARD CONTAINER STYLING HAS BEEN POLISHED BELOW -->
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="bg-white rounded-2xl p-5 border border-slate-100 ring-1 ring-slate-200/50 flex items-start gap-4 transition-all duration-200 hover:ring-slate-300/80 hover:shadow-sm cursor-pointer relative overflow-hidden group"
          >
            <!-- Sleek Unread Left Edge Indicator instead of heavy background tints -->
            <div 
              v-if="!notification.is_read" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"
            />

            <!-- Icon Frame with Micro-scale effect -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              :class="iconBg(notification.type)"
            >
              <component
                :is="iconComponent(notification.type)"
                class="w-5 h-5"
                :class="iconColor(notification.type)"
              />
            </div>

            <!-- Text Content Alignment -->
            <div class="flex-1 min-w-0 pt-0.5">
              <p
                class="text-sm text-slate-700 leading-relaxed"
                :class="!notification.is_read ? 'font-semibold text-slate-900' : 'font-normal'"
              >
                {{ notification.message }}
              </p>
              <p class="text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-1.5">
                <!-- Mobile unread bullet -->
                <span v-if="!notification.is_read" class="w-1.5 h-1.5 rounded-full bg-teal-500 md:hidden" />
                {{ timeAgo(notification.created_at) }}
              </p>
            </div>

            <!-- Desktop Clean Indicator Dot with subtle aura ring -->
            <div
              v-if="!notification.is_read"
              class="hidden md:block w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2.5 ring-4 ring-teal-50"
            />
          </div>
        </div>
      </main>

      <aside class="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col gap-4 py-5 pr-4 md:pr-6">
        <div class="flex items-center gap-2">
          <Bell class="w-4 h-4 text-teal-500" />
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Summary</p>
        </div>
        <div
          class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-2"
        >
          <p class="text-xs font-semibold text-teal-600 uppercase tracking-wide">Unread</p>
          <p class="text-3xl font-black text-gray-800">{{ unreadCount }}</p>
          <p class="text-xs text-gray-400">notifications</p>
        </div>
        <div
          class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-2"
        >
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
          <p class="text-3xl font-black text-gray-800">{{ totalCount }}</p>
          <p class="text-xs text-gray-400">all notifications</p>
        </div>
      </aside>
    </div>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { Bell, AlertCircle, ShieldAlert, MessageCircle } from 'lucide-vue-next'

const store = useNotificationStore()

// Kept reactive with computed property functions to resolve reactivity issues from the original code setup
const notifications = computed(() => store.notifications)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)
const totalCount = computed(() => notifications.value.length)

function fetchNotifications() {
  store.fetchNotifications()
}

function markAllRead() {
  store.markAllRead()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function iconComponent(type: string) {
  const map: Record<string, unknown> = {
    SYSTEM: Bell,
    MESSAGE: MessageCircle,
    COMMENT: MessageCircle,
    REPORT: ShieldAlert,
  }
  return map[type] ?? Bell
}

function iconBg(type: string): string {
  const map: Record<string, string> = {
    SYSTEM: 'bg-teal-50',
    MESSAGE: 'bg-blue-50',
    COMMENT: 'bg-purple-50',
    REPORT: 'bg-rose-50',
  }
  return map[type] ?? 'bg-slate-50'
}

// Bumped text colors to 600 variant for enhanced accessibility against the soft background frames
function iconColor(type: string): string {
  const map: Record<string, string> = {
    SYSTEM: 'text-teal-600',
    MESSAGE: 'text-blue-600',
    COMMENT: 'text-purple-600',
    REPORT: 'text-rose-600',
  }
  return map[type] ?? 'text-slate-500'
}

onMounted(fetchNotifications)
</script>