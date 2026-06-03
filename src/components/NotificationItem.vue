<script setup lang="ts">
export interface NotificationData {
  notification_id: number
  type: 'SYSTEM' | 'MESSAGE' | 'COMMENT' | 'REPORT'
  message: string
  is_read: boolean
  created_at: string
  related_id: number
}

defineProps<{ notification: NotificationData }>()

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const icons: Record<string, string> = {
  SYSTEM: '🔔',
  MESSAGE: '💬',
  COMMENT: '↩️',
  REPORT: '⚠️',
}
</script>

<template>
  <div class="notification-item" :class="{ unread: !notification.is_read }">
    <div class="notif-icon">
      {{ icons[notification.type] ?? '🔔' }}
    </div>

    <div class="notif-body">
      <p class="notif-message">{{ notification.message }}</p>
      <span class="notif-time">{{ timeAgo(notification.created_at) }}</span>
    </div>

    <div v-if="!notification.is_read" class="unread-dot" />
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  transition:
    background 0.2s,
    box-shadow 0.2s;
  position: relative;
  cursor: pointer;
}
.notification-item:hover {
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.notification-item.unread {
  background: #fffdf5;
  border-left: 3px solid #8b6914;
}

.notif-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #f5f0e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-message {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 4px;
  line-height: 1.5;
}
.notif-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b6914;
  flex-shrink: 0;
  margin-top: 4px;
}
</style>
