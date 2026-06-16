import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getProfile = vi.fn()

vi.mock('@/services/api', () => ({
  userApi: {
    getProfile,
  },
}))

const position = {
  coords: {
    latitude: 11.5564,
    longitude: 104.9282,
  },
  timestamp: Date.now(),
} as GeolocationPosition

function geoError(code: number): GeolocationPositionError {
  return {
    code,
    message: 'Location request failed',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  }
}

describe('useNearbyLocation', () => {
  beforeEach(() => {
    vi.resetModules()
    getProfile.mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the recent account location while Chrome continues requesting live location', async () => {
    const getCurrentPosition = vi.fn()
    getProfile.mockResolvedValue({
      current_latitude: '11.55',
      current_longitude: '104.92',
      location_updated_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    })
    vi.stubGlobal('navigator', {
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
      geolocation: {
        getCurrentPosition,
        watchPosition: vi.fn(() => 42),
      },
    })

    const { useNearbyLocation } = await import('../useNearbyLocation')
    const geo = useNearbyLocation()

    await expect(geo.request()).resolves.toEqual({
      lat: 11.55,
      lng: 104.92,
    })
    expect(geo.locationSource.value).toBe('account')
    expect(geo.isFresh()).toBe(false)
    expect(geo.isShareable()).toBe(false)
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it('replaces the account fallback when Chrome later supplies a live position', async () => {
    let positionSuccess: PositionCallback | null = null
    getProfile.mockResolvedValue({
      current_latitude: 11.55,
      current_longitude: 104.92,
      location_updated_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    })
    vi.stubGlobal('navigator', {
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          positionSuccess = success
        },
        watchPosition: vi.fn(() => 42),
      },
    })

    const { useNearbyLocation } = await import('../useNearbyLocation')
    const geo = useNearbyLocation()

    await geo.request()
    const receivePosition = positionSuccess as PositionCallback | null
    if (receivePosition) receivePosition(position)
    await Promise.resolve()

    expect(geo.coords.value).toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    expect(geo.locationSource.value).toBe('live')
    expect(geo.isFresh()).toBe(true)
    expect(geo.isShareable()).toBe(true)
  })

  it('rejects an account location older than 24 hours', async () => {
    const getCurrentPosition = vi.fn(
      (_success: PositionCallback, error: PositionErrorCallback) => error(geoError(2)),
    )
    getProfile.mockResolvedValue({
      current_latitude: 11.55,
      current_longitude: 104.92,
      location_updated_at: new Date(Date.now() - 25 * 60 * 60_000).toISOString(),
    })
    vi.stubGlobal('navigator', {
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
      geolocation: {
        getCurrentPosition,
      },
    })

    const { useNearbyLocation } = await import('../useNearbyLocation')
    const geo = useNearbyLocation()

    await expect(geo.request()).resolves.toBeNull()
    expect(geo.coords.value).toBeNull()
    expect(geo.status.value).toBe('unavailable')
  })

  it('does not use the account fallback when location permission is denied', async () => {
    getProfile.mockResolvedValue({
      current_latitude: 11.55,
      current_longitude: 104.92,
      location_updated_at: new Date().toISOString(),
    })
    vi.stubGlobal('navigator', {
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'denied' }),
      },
      geolocation: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error(geoError(1)),
      },
    })

    const { useNearbyLocation } = await import('../useNearbyLocation')
    const geo = useNearbyLocation()

    await expect(geo.request()).resolves.toBeNull()
    expect(geo.coords.value).toBeNull()
    expect(geo.status.value).toBe('denied')
  })
})
