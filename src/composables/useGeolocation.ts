import { ref, readonly } from 'vue'

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'

export interface GeoCoords {
  lat: number
  lng: number
}

const LAST_KNOWN_LOCATION_KEY = 'nms_last_known_location'

function saveLastKnownLocation(coords: GeoCoords) {
  localStorage.setItem(LAST_KNOWN_LOCATION_KEY, JSON.stringify(coords))
}

function getLastKnownLocation(): GeoCoords | null {
  const raw = localStorage.getItem(LAST_KNOWN_LOCATION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as GeoCoords
    if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export function useGeolocation() {
  const status = ref<GeoStatus>('idle')
  const coords = ref<GeoCoords | null>(null)
  const errorMessage = ref<string | null>(null)

  function request(): Promise<GeoCoords | null> {
    if (!navigator.geolocation) {
      status.value = 'unavailable'
      errorMessage.value = 'Geolocation is not supported by your browser.'
      return Promise.resolve(null)
    }

    status.value = 'requesting'
    errorMessage.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          saveLastKnownLocation(coords.value)
          status.value = 'granted'
          resolve(coords.value)
        },
        (err) => {
          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            status.value = 'denied'
            errorMessage.value = 'Location access was denied. Enable it in browser settings.'
          } else if (err.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
            status.value = 'unavailable'
            errorMessage.value = 'Your location could not be determined right now.'
          } else {
            status.value = 'error'
            errorMessage.value = 'Location request timed out. Please try again.'
          }
          resolve(null)
        },
        { timeout: 10_000, maximumAge: 60_000, enableHighAccuracy: false },
      )
    })
  }

  return {
    status: readonly(status),
    coords: readonly(coords),
    errorMessage: readonly(errorMessage),
    request,
    getLastKnownLocation,
  }
}
