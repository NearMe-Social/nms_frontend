import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URL } from '@/services/api'

export interface NotificationData {
  notification_id: number
  type: 'SYSTEM' | 'MESSAGE' | 'COMMENT' | 'REPORT'
  message: string
  is_read: boolean
  created_at: string
  related_id: number
  target_path?: string | null
}

interface NotificationsResponse {
  total: number
  data: NotificationData[]
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
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `HTTP ${res.status}`)
      }

      const body = (await res.json()) as NotificationsResponse | NotificationData[]
      notifications.value = Array.isArray(body) ? body : body.data
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

  async function markAsRead(notificationId: number) {
    const notification = notifications.value.find(
      (item) => item.notification_id === notificationId,
    )
    if (!notification || notification.is_read) return

    notification.is_read = true
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      notification.is_read = false
    }
  }

  return {
    notifications,
    loading,
    error,
    lastFetchedAt,
    unreadCount,
    fetchNotifications,
    markAllRead,
    markAsRead,
  }
})
