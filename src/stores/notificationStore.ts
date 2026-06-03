import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface NotificationData {
  notification_id: number
  type: 'SYSTEM' | 'MESSAGE' | 'COMMENT' | 'REPORT'
  message: string
  is_read: boolean
  created_at: string
  related_id: number
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<Date | null>(null)

  const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

  async function fetchNotifications() {
    const token = localStorage.getItem('token')
    loading.value = true
    error.value = null

    try {
      const res = await fetch('http://localhost:3000/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `HTTP ${res.status}`)
      }

      notifications.value = await res.json()
      lastFetchedAt.value = new Date()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function markAllRead() {
    notifications.value = notifications.value.map((n) => ({ ...n, is_read: true }))
  }

  return {
    notifications,
    loading,
    error,
    lastFetchedAt,
    unreadCount,
    fetchNotifications,
    markAllRead,
  }
})
