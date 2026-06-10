import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationStore } from '../notificationStore'

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.setItem('token', 'test-token')
    vi.restoreAllMocks()
  })

  it('uses the backend data array and finishes with an empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ total: 0, data: [] }),
      }),
    )

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.notifications).toEqual([])
    expect(store.unreadCount).toBe(0)
  })

  it('stores notifications returned by the paginated backend response', async () => {
    const notification = {
      notification_id: 7,
      type: 'COMMENT' as const,
      related_id: 12,
      message: 'Someone commented on your post',
      is_read: false,
      created_at: '2026-06-11T00:00:00.000Z',
      target_path: '/posts/3?commentId=12',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ total: 1, data: [notification] }),
      }),
    )

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.notifications).toEqual([notification])
    expect(store.unreadCount).toBe(1)
  })

  it('marks an individual notification as read through the backend', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            total: 1,
            data: [
              {
                notification_id: 7,
                type: 'COMMENT',
                related_id: 12,
                message: 'Someone commented on your post',
                is_read: false,
                created_at: '2026-06-11T00:00:00.000Z',
                target_path: '/posts/3?commentId=12',
              },
            ],
          }),
      })
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const store = useNotificationStore()
    await store.fetchNotifications()
    await store.markAsRead(7)

    expect(store.notifications[0]?.is_read).toBe(true)
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/notifications/7/read'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})
