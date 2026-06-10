import { ref, readonly } from 'vue'

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'

export interface GeoCoords {
  lat: number
  lng: number
}

interface StoredGeoCoords extends GeoCoords {
  capturedAt?: number
}

const LAST_KNOWN_LOCATION_KEY = 'nms_last_known_location'
const MAX_LOCATION_AGE_MS = 2 * 60_000
const POSITION_OPTIONS: PositionOptions = {
  timeout: 30_000,
  maximumAge: MAX_LOCATION_AGE_MS,
  enableHighAccuracy: false,
}
const WATCH_REQUEST_OPTIONS: PositionOptions = {
  maximumAge: 30_000,
  enableHighAccuracy: false,
}

function saveLastKnownLocation(coords: GeoCoords, positionCapturedAt: number) {
  localStorage.setItem(
    LAST_KNOWN_LOCATION_KEY,
    JSON.stringify({ ...coords, capturedAt: positionCapturedAt }),
  )
}

function getLastKnownLocation(): GeoCoords | null {
  const raw = localStorage.getItem(LAST_KNOWN_LOCATION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredGeoCoords
    if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
      return { lat: parsed.lat, lng: parsed.lng }
    }
  } catch {
    return null
  }

  return null
}

function getFreshStoredLocation(): Required<StoredGeoCoords> | null {
  const raw = localStorage.getItem(LAST_KNOWN_LOCATION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredGeoCoords
    const isValid =
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng) &&
      Number.isFinite(parsed.capturedAt)
    const isFresh = Date.now() - (parsed.capturedAt ?? 0) <= MAX_LOCATION_AGE_MS

    return isValid && isFresh
      ? { lat: parsed.lat, lng: parsed.lng, capturedAt: parsed.capturedAt as number }
      : null
  } catch {
    return null
  }
}

const status = ref<GeoStatus>('idle')
const coords = ref<GeoCoords | null>(null)
const errorMessage = ref<string | null>(null)
let capturedAt = 0
let pendingRequest: Promise<GeoCoords | null> | null = null
let watchId: number | null = null

function setPosition(pos: GeolocationPosition): GeoCoords {
  coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
  capturedAt = Number.isFinite(pos.timestamp) ? pos.timestamp : Date.now()
  saveLastKnownLocation(coords.value, capturedAt)
  status.value = 'granted'
  errorMessage.value = null
  return coords.value
}

function startSharedWatch() {
  if (
    watchId !== null ||
    !navigator.geolocation ||
    typeof navigator.geolocation.watchPosition !== 'function'
  ) {
    return
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      setPosition(position)
    },
    (err) => {
      if (!coords.value && err.code === err.PERMISSION_DENIED) {
        status.value = 'denied'
        errorMessage.value = 'Location access was denied. Enable it in browser settings.'
      }
    },
    WATCH_REQUEST_OPTIONS,
  )
}

export function useGeolocation() {
  function request(): Promise<GeoCoords | null> {
    if (
      coords.value &&
      (watchId !== null || Date.now() - capturedAt <= MAX_LOCATION_AGE_MS)
    ) {
      status.value = 'granted'
      errorMessage.value = null
      startSharedWatch()
      return Promise.resolve(coords.value)
    }

    if (pendingRequest) return pendingRequest

    if (!navigator.geolocation) {
      status.value = 'unavailable'
      errorMessage.value = 'Geolocation is not supported by your browser.'
      return Promise.resolve(null)
    }

    if (window.isSecureContext === false) {
      status.value = 'unavailable'
      errorMessage.value = 'Location requires HTTPS or localhost.'
      return Promise.resolve(null)
    }

    status.value = 'requesting'
    errorMessage.value = null

    pendingRequest = new Promise((resolve) => {
      const finishWithPosition = (pos: GeolocationPosition) => {
        const position = setPosition(pos)
        startSharedWatch()
        resolve(position)
      }

      const finishWithError = (err: GeolocationPositionError) => {
        const recentLocation = getFreshStoredLocation()
        if (recentLocation) {
          coords.value = { lat: recentLocation.lat, lng: recentLocation.lng }
          capturedAt = recentLocation.capturedAt
          status.value = 'granted'
          errorMessage.value = null
          resolve(coords.value)
          return
        }

        if (err.code === err.PERMISSION_DENIED) {
          status.value = 'denied'
          errorMessage.value = 'Location access was denied. Enable it in browser settings.'
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          status.value = 'unavailable'
          errorMessage.value = 'Your location could not be determined right now.'
        } else {
          status.value = 'error'
          errorMessage.value =
            'Location is taking longer than expected. Check that device location is enabled and try again.'
        }
        resolve(null)
      }

      navigator.geolocation.getCurrentPosition(
        finishWithPosition,
        finishWithError,
        POSITION_OPTIONS,
      )
    }).finally(() => {
      pendingRequest = null
    })

    return pendingRequest
  }

  return {
    status: readonly(status),
    coords: readonly(coords),
    errorMessage: readonly(errorMessage),
    request,
    getLastKnownLocation,
  }
}
