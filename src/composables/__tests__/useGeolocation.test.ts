import { beforeEach, describe, expect, it, vi } from 'vitest'

const position = {
  coords: {
    latitude: 11.5564,
    longitude: 104.9282,
  },
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

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('shares a fresh location between page composable instances', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => success(position))
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const nearbyPageGeo = useGeolocation()
    const homePageGeo = useGeolocation()

    await expect(nearbyPageGeo.request()).resolves.toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    await expect(homePageGeo.request()).resolves.toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it('uses a recently captured location when a repeated browser request fails', async () => {
    localStorage.setItem(
      'nms_last_known_location',
      JSON.stringify({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        capturedAt: Date.now(),
      }),
    )
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error(geoError(1)),
      },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()

    await expect(geo.request()).resolves.toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    expect(geo.status.value).toBe('granted')
  })

  it('rejects stale stored coordinates when permission is denied', async () => {
    localStorage.setItem(
      'nms_last_known_location',
      JSON.stringify({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        capturedAt: Date.now() - 61_000,
      }),
    )
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error(geoError(1)),
      },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()

    await expect(geo.request()).resolves.toBeNull()
    expect(geo.status.value).toBe('denied')
  })
})
