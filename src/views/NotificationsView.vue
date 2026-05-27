<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import NotificationItem from '@/components/NotificationItem.vue'
import NotificationSkeleton from '@/components/NotificationSkeleton.vue'

const store = useNotificationStore()

const unreadCount = computed(() => store.notifications.filter((n) => !n.is_read).length)

onMounted(() => store.fetchNotifications())
</script>

<template>
  <div class="notif-page">
    <!-- Header -->
    <header class="notif-header">
      <div class="header-left">
        <h1 class="page-title">Notifications</h1>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
      <button v-if="unreadCount > 0" class="mark-all-btn" @click="store.markAllRead()">
        Mark all as read
      </button>
    </header>

    <!-- Loading state -->
    <div v-if="store.loading" class="notif-list">
      <NotificationSkeleton v-for="i in 5" :key="i" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="error-state">
      <p class="error-icon">⚠️</p>
      <p class="error-text">{{ store.error }}</p>
      <button class="retry-btn" @click="store.fetchNotifications()">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.notifications.length === 0" class="empty-state">
      <div class="empty-icon">🔔</div>
      <p class="empty-title">No notifications yet</p>
      <p class="empty-sub">When something happens nearby, you'll see it here.</p>
    </div>

    <!-- Notification list -->
    <div v-else class="notif-list">
      <NotificationItem
        v-for="notification in store.notifications"
        :key="notification.id"
        :notification="notification"
        class="notif-enter"
      />
    </div>
  </div>
</template>

<style scoped>
.notif-page {
  min-height: 100dvh;
  background: #f5f5f5;
  font-family: inherit;
  padding: 0 0 48px;
}

/* Header */
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}
.unread-badge {
  background: #8b6914;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.mark-all-btn {
  background: none;
  border: none;
  color: #2a9d8f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}
.mark-all-btn:hover {
  text-decoration: underline;
}

/* List */
.notif-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  gap: 12px;
  text-align: center;
}
.error-icon {
  font-size: 36px;
}
.error-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}
.retry-btn {
  background: #8b6914;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.retry-btn:hover {
  background: #7a5c10;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  gap: 12px;
  text-align: center;
}
.empty-icon {
  font-size: 52px;
  margin-bottom: 8px;
}
.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}
.empty-sub {
  font-size: 13px;
  color: #999;
  margin: 0;
  max-width: 240px;
  line-height: 1.6;
}

/* Animation */
.notif-enter {
  animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
