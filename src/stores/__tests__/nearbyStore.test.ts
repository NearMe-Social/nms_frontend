import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNearbyStore } from '../nearbyStore'

describe('nearbyStore polling', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs the supplied fresh-location refresh every 30 seconds', async () => {
    const store = useNearbyStore()
    const refresh = vi.fn().mockResolvedValue(undefined)

    store.startPolling(refresh)
    await vi.advanceTimersByTimeAsync(30_000)

    expect(refresh).toHaveBeenCalledTimes(1)
    store.stopPolling()
  })
})
