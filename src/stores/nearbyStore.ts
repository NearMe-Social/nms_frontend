import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface NearbyUser {
  id: string
  username: string
  distance_m: number
}

export const useNearbyStore = defineStore('nearby', () => {
  const users = ref<NearbyUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<Date | null>(null)

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  async function fetchNearby(lat: number, lng: number) {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      const res = await fetch(`http://localhost:3000/users/nearby?lat=${lat}&lng=${lng}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `HTTP ${res.status}`)
      }

      users.value = await res.json()
      lastFetchedAt.value = new Date()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function startPolling(lat: number, lng: number) {
    stopPolling()
    refreshTimer = setInterval(() => fetchNearby(lat, lng), 30_000)
  }

  function stopPolling() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return { users, loading, error, lastFetchedAt, fetchNearby, startPolling, stopPolling }
})
