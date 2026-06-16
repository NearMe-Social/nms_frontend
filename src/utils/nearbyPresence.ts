import { API_URL } from '@/services/api'

export function clearNearbyPresence(options: { keepalive?: boolean } = {}) {
  const token = localStorage.getItem('token')
  if (!token) return

  void fetch(`${API_URL}/users/me/location`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    keepalive: options.keepalive,
  }).catch(() => undefined)
}
