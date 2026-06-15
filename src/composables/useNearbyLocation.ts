import { userApi } from '@/services/api'
import { useGeolocation, type GeoCoords, type GeoRequestOptions } from './useGeolocation'

export function useNearbyLocation() {
  const geo = useGeolocation()

  async function request(options: GeoRequestOptions = {}): Promise<GeoCoords | null> {
    const browserRequest = geo.request(options)

    if (geo.coords.value) {
      if (geo.locationSource.value === 'cached') void browserRequest
      return geo.coords.value
    }

    try {
      const profile = await userApi.getProfile()
      const lat = Number(profile.current_latitude)
      const lng = Number(profile.current_longitude)
      const capturedAt = profile.location_updated_at
        ? new Date(profile.location_updated_at).getTime()
        : Number.NaN

      if (await geo.restoreAccountLocation({ lat, lng }, capturedAt)) {
        void browserRequest
        return geo.coords.value
      }
    } catch {
      // The browser request remains the source of truth when no account fallback is available.
    }

    return browserRequest
  }

  return {
    ...geo,
    request,
  }
}
