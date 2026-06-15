import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
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
        capturedAt: Date.now() - 121_000,
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

  it('starts one shared passive watcher after the first successful reading', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => success(position))
    const watchPosition = vi.fn(() => {
      return 42
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition, watchPosition },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const nearbyGeo = useGeolocation()
    const homeGeo = useGeolocation()

    await expect(nearbyGeo.request()).resolves.toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    await homeGeo.request()
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(watchPosition).toHaveBeenCalledTimes(1)
  })

  it('updates shared coordinates when the passive watcher receives a new position', async () => {
    const secondPosition = {
      coords: {
        latitude: 11.56,
        longitude: 104.93,
      },
    } as GeolocationPosition
    let watchSuccess: PositionCallback | null = null
    const getCurrentPosition = vi.fn((success: PositionCallback) => success(position))
    const watchPosition = vi.fn((success: PositionCallback) => {
      watchSuccess = success
      return 42
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition, watchPosition },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()

    await geo.request()
    const receiveWatchedPosition = watchSuccess as PositionCallback | null
    if (receiveWatchedPosition) receiveWatchedPosition(secondPosition)

    expect(geo.coords.value).toEqual({
      lat: secondPosition.coords.latitude,
      lng: secondPosition.coords.longitude,
    })
  })

  it('stops the shared watcher and clears session location data on logout', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => success(position))
    const watchPosition = vi.fn(() => 42)
    const clearWatch = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition, watchPosition, clearWatch },
    })

    const { stopGeolocationTracking, useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()

    await geo.request()
    stopGeolocationTracking(true)

    expect(clearWatch).toHaveBeenCalledWith(42)
    expect(geo.coords.value).toBeNull()
    expect(geo.status.value).toBe('idle')
    expect(localStorage.getItem('nms_last_known_location')).toBeNull()
  })

  it('retries once with a fresh browser reading after a timeout', async () => {
    vi.useFakeTimers()
    const getCurrentPosition = vi
      .fn()
      .mockImplementationOnce((_success: PositionCallback, error: PositionErrorCallback) =>
        error(geoError(3)),
      )
      .mockImplementationOnce((success: PositionCallback) => success(position))

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition,
        watchPosition: vi.fn(() => 42),
      },
    })

    const { useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()
    const request = geo.request()

    await vi.advanceTimersByTimeAsync(400)

    await expect(request).resolves.toEqual({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    expect(getCurrentPosition).toHaveBeenCalledTimes(2)
    expect(geo.status.value).toBe('granted')
  })

  it('ignores a location response that arrives after tracking is stopped', async () => {
    let positionSuccess: PositionCallback | null = null
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      positionSuccess = success
    })
    const watchPosition = vi.fn(() => 42)
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition, watchPosition, clearWatch: vi.fn() },
    })

    const { stopGeolocationTracking, useGeolocation } = await import('../useGeolocation')
    const geo = useGeolocation()
    const request = geo.request()

    stopGeolocationTracking(true)
    const receiveDelayedPosition = positionSuccess as PositionCallback | null
    if (receiveDelayedPosition) receiveDelayedPosition(position)

    await expect(request).resolves.toBeNull()
    expect(geo.coords.value).toBeNull()
    expect(watchPosition).not.toHaveBeenCalled()
  })
})
