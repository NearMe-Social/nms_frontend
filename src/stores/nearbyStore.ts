import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { API_URL } from '@/services/api'

export interface NearbyUser {
  id: string
  username: string
  distance_m: number
  distance_label?: string
  profile_image?: string | null
  location_updated_at?: string | null
}

export const useNearbyStore = defineStore('nearby', () => {
  const users = ref<NearbyUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<Date | null>(null)

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  async function updateMyLocation(lat: number, lng: number) {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('You need to be logged in before sharing nearby location.')
    }

    const res = await fetch(`${API_URL}/users/me/location`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(`Location update failed: ${body?.message ?? `HTTP ${res.status}`}`)
    }
  }

  async function fetchNearby(lat: number, lng: number, radius = 200, shareLocation = true) {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      if (shareLocation) {
        await updateMyLocation(lat, lng)
      }

      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radius),
      })

      const res = await fetch(`${API_URL}/users/nearby?${params.toString()}`, {
        headers: {
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(`Nearby users failed: ${body?.message ?? `HTTP ${res.status}`}`)
      }

      users.value = await res.json()
      lastFetchedAt.value = new Date()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function startPolling(refresh: () => Promise<void>) {
    stopPolling()
    refreshTimer = setInterval(() => {
      void refresh()
    }, 30_000)
  }

  function stopPolling() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    users,
    loading,
    error,
    lastFetchedAt,
    fetchNearby,
    startPolling,
    stopPolling,
  }
})
