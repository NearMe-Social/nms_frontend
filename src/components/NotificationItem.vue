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
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(16,24,40,0.06);
  border-radius: 14px;
  padding: 16px 18px;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
  position: relative;
  cursor: pointer;
}
.notification-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16,24,40,0.08);
}
.notification-item.unread {
  background: linear-gradient(90deg, #fffef9 0%, #ffffff 100%);
  border-left: 4px solid #14b8a6;
}

.notif-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(20,184,166,0.12), rgba(96,165,250,0.06));
  border-radius: 12px;
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
  color: #6b7280;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b6914;
  flex-shrink: 0;
  margin-top: 4px;
}

/* subtle pulsing for unread indicator */
.notification-item.unread .unread-dot {
  background: #14b8a6;
  box-shadow: 0 0 0 0 rgba(20,184,166,0.2);
  animation: pulse 1800ms infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(20,184,166,0.18);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(20,184,166,0.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(20,184,166,0);
  }
}
</style>
