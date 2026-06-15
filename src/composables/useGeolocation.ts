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
  timeout: 12_000,
  maximumAge: MAX_LOCATION_AGE_MS,
  enableHighAccuracy: false,
}
const RETRY_POSITION_OPTIONS: PositionOptions = {
  timeout: 18_000,
  maximumAge: 0,
  enableHighAccuracy: false,
}
const LOCATION_RETRY_DELAY_MS = 400
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
let requestGeneration = 0

export interface GeoRequestOptions {
  forceRefresh?: boolean
}

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

export function stopGeolocationTracking(clearStoredLocation = false) {
  requestGeneration++

  if (watchId !== null && navigator.geolocation?.clearWatch) {
    navigator.geolocation.clearWatch(watchId)
  }

  watchId = null
  coords.value = null
  capturedAt = 0
  status.value = 'idle'
  errorMessage.value = null

  if (clearStoredLocation) {
    localStorage.removeItem(LAST_KNOWN_LOCATION_KEY)
  }
}

export function useGeolocation() {
  function getBrowserPosition(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  function waitBeforeRetry(): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, LOCATION_RETRY_DELAY_MS))
  }

  function applyLocationError(err: GeolocationPositionError): GeoCoords | null {
    const recentLocation = getFreshStoredLocation()
    if (recentLocation) {
      coords.value = { lat: recentLocation.lat, lng: recentLocation.lng }
      capturedAt = recentLocation.capturedAt
      status.value = 'granted'
      errorMessage.value = null
      return coords.value
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

    return null
  }

  function request(options: GeoRequestOptions = {}): Promise<GeoCoords | null> {
    const hasFreshCoordinates =
      coords.value !== null && Date.now() - capturedAt <= MAX_LOCATION_AGE_MS

    if (!options.forceRefresh && hasFreshCoordinates) {
      status.value = 'granted'
      errorMessage.value = null
      startSharedWatch()
      return Promise.resolve(coords.value)
    }

    if (pendingRequest && !options.forceRefresh) return pendingRequest

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
    const generation = ++requestGeneration

    const requestPromise = (async (): Promise<GeoCoords | null> => {
      try {
        let position: GeolocationPosition

        try {
          position = await getBrowserPosition(POSITION_OPTIONS)
        } catch (error: unknown) {
          const firstError = error as GeolocationPositionError
          if (firstError.code !== firstError.TIMEOUT) throw firstError

          await waitBeforeRetry()
          if (generation !== requestGeneration) return null
          position = await getBrowserPosition(RETRY_POSITION_OPTIONS)
        }

        if (generation !== requestGeneration) return null

        const currentPosition = setPosition(position)
        startSharedWatch()
        return currentPosition
      } catch (error: unknown) {
        if (generation !== requestGeneration) return null
        return applyLocationError(error as GeolocationPositionError)
      }
    })().finally(() => {
      if (pendingRequest === requestPromise) {
        pendingRequest = null
      }
    })

    pendingRequest = requestPromise
    return requestPromise
  }

  return {
    status: readonly(status),
    coords: readonly(coords),
    errorMessage: readonly(errorMessage),
    request,
    getLastKnownLocation,
  }
}
