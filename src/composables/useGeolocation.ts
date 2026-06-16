import { readonly, ref } from 'vue'

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'
export type GeoLocationSource = 'live' | 'cached' | 'account' | null

export interface GeoCoords {
  lat: number
  lng: number
}

interface StoredGeoCoords extends GeoCoords {
  capturedAt: number
  source?: Exclude<GeoLocationSource, null>
}

export interface GeoRequestOptions {
  forceRefresh?: boolean
}

const TAB_LOCATION_KEY = 'nms_tab_location'
const LEGACY_PERSISTENT_LOCATION_KEY = 'nms_last_known_location'
const FRESH_LOCATION_AGE_MS = 2 * 60_000
const SHAREABLE_LOCATION_AGE_MS = 10 * 60_000
const ACCOUNT_FALLBACK_MAX_AGE_MS = 24 * 60 * 60_000
const POSITION_OPTIONS: PositionOptions = {
  timeout: 20_000,
  maximumAge: FRESH_LOCATION_AGE_MS,
  enableHighAccuracy: false,
}
const RETRY_POSITION_OPTIONS: PositionOptions = {
  timeout: 18_000,
  maximumAge: 10 * 60_000,
  enableHighAccuracy: false,
}
const WATCH_OPTIONS: PositionOptions = {
  maximumAge: 30_000,
  enableHighAccuracy: false,
}
const RETRY_DELAY_MS = 400

localStorage.removeItem(LEGACY_PERSISTENT_LOCATION_KEY)

const status = ref<GeoStatus>('idle')
const coords = ref<GeoCoords | null>(null)
const errorMessage = ref<string | null>(null)
const locationSource = ref<GeoLocationSource>(null)
let capturedAt = 0
let pendingRequest: Promise<GeoCoords | null> | null = null
let watchId: number | null = null
let requestGeneration = 0

function readTabLocation(): StoredGeoCoords | null {
  const raw = sessionStorage.getItem(TAB_LOCATION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredGeoCoords
    const valid =
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng) &&
      Number.isFinite(parsed.capturedAt)

    return valid ? parsed : null
  } catch {
    return null
  }
}

function saveTabLocation(
  position: GeoCoords,
  positionCapturedAt: number,
  source: Exclude<GeoLocationSource, null>,
) {
  sessionStorage.setItem(
    TAB_LOCATION_KEY,
    JSON.stringify({ ...position, capturedAt: positionCapturedAt, source }),
  )
}

function sourceForCapturedAt(positionCapturedAt: number): Exclude<GeoLocationSource, null> {
  return Date.now() - positionCapturedAt <= FRESH_LOCATION_AGE_MS ? 'live' : 'cached'
}

function setLivePosition(position: GeolocationPosition): GeoCoords {
  coords.value = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  }
  capturedAt = Number.isFinite(position.timestamp) ? position.timestamp : Date.now()
  const source = sourceForCapturedAt(capturedAt)
  saveTabLocation(coords.value, capturedAt, source)
  locationSource.value = source
  status.value = 'granted'
  errorMessage.value = null
  return coords.value
}

function setStoredPosition(position: StoredGeoCoords): GeoCoords {
  coords.value = { lat: position.lat, lng: position.lng }
  capturedAt = position.capturedAt
  locationSource.value = position.source === 'account' ? 'account' : sourceForCapturedAt(capturedAt)
  status.value = 'granted'
  errorMessage.value = null
  startSharedWatch()
  return coords.value
}

function setCachedPosition(position: StoredGeoCoords): GeoCoords {
  coords.value = { lat: position.lat, lng: position.lng }
  capturedAt = position.capturedAt
  saveTabLocation(coords.value, capturedAt, 'account')
  locationSource.value = 'account'
  status.value = 'granted'
  errorMessage.value = null
  startSharedWatch()
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
      setLivePosition(position)
    },
    (error) => {
      if (!coords.value && error.code === error.PERMISSION_DENIED) {
        status.value = 'denied'
        errorMessage.value = 'Location access was denied. Enable it in browser settings.'
      }
    },
    WATCH_OPTIONS,
  )
}

async function canUseStoredLocation(): Promise<boolean> {
  if (!navigator.permissions?.query) return true

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })
    if (permission.state !== 'denied') return true

    status.value = 'denied'
    errorMessage.value = 'Location access was denied. Enable it in browser settings.'
    locationSource.value = null
    return false
  } catch {
    return true
  }
}

function applyLocationError(error: GeolocationPositionError): GeoCoords | null {
  if (error.code === error.PERMISSION_DENIED) {
    status.value = 'denied'
    errorMessage.value = 'Location access was denied. Enable it in browser settings.'
    locationSource.value = null
    return null
  }

  if (coords.value) {
    status.value = 'granted'
    errorMessage.value = null
    return coords.value
  }

  locationSource.value = null
  if (error.code === error.POSITION_UNAVAILABLE) {
    status.value = 'unavailable'
    errorMessage.value = 'Your location could not be determined right now.'
  } else {
    status.value = 'error'
    errorMessage.value =
      'Location is taking longer than expected. Check that device location is enabled and try again.'
  }
  return null
}

export function stopGeolocationTracking(clearStoredLocation = false) {
  requestGeneration++

  if (watchId !== null && navigator.geolocation?.clearWatch) {
    navigator.geolocation.clearWatch(watchId)
  }

  watchId = null
  pendingRequest = null
  coords.value = null
  capturedAt = 0
  status.value = 'idle'
  errorMessage.value = null
  locationSource.value = null

  if (clearStoredLocation) {
    sessionStorage.removeItem(TAB_LOCATION_KEY)
  }
}

export function useGeolocation() {
  function getBrowserPosition(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  function isFresh(): boolean {
    return (
      coords.value !== null &&
      locationSource.value === 'live' &&
      Date.now() - capturedAt <= FRESH_LOCATION_AGE_MS
    )
  }

  function isShareable(): boolean {
    return (
      coords.value !== null &&
      locationSource.value !== null &&
      locationSource.value !== 'account' &&
      Date.now() - capturedAt <= SHAREABLE_LOCATION_AGE_MS
    )
  }

  async function request(options: GeoRequestOptions = {}): Promise<GeoCoords | null> {
    if (!options.forceRefresh && isFresh()) {
      startSharedWatch()
      return coords.value
    }

    if (!options.forceRefresh) {
      const stored = readTabLocation()
      if (stored && (await canUseStoredLocation())) {
        const restored = setStoredPosition(stored)
        if (
          locationSource.value !== 'account' &&
          locationSource.value !== 'live' &&
          !pendingRequest
        ) {
          void request({ forceRefresh: true })
        }
        return restored
      }
    }

    if (pendingRequest) return pendingRequest

    if (!navigator.geolocation) {
      status.value = 'unavailable'
      errorMessage.value = 'Geolocation is not supported by your browser.'
      return null
    }

    if (window.isSecureContext === false) {
      status.value = 'unavailable'
      errorMessage.value = 'Location requires HTTPS or localhost.'
      return null
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

          await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS))
          if (generation !== requestGeneration) return null
          position = await getBrowserPosition(RETRY_POSITION_OPTIONS)
        }

        if (generation !== requestGeneration) return null

        const livePosition = setLivePosition(position)
        startSharedWatch()
        return livePosition
      } catch (error: unknown) {
        if (generation !== requestGeneration) return null
        return applyLocationError(error as GeolocationPositionError)
      }
    })().finally(() => {
      if (pendingRequest === requestPromise) pendingRequest = null
    })

    pendingRequest = requestPromise
    return requestPromise
  }

  function getLastKnownLocation(): GeoCoords | null {
    const stored = readTabLocation()
    return stored ? { lat: stored.lat, lng: stored.lng } : null
  }

  async function restoreAccountLocation(
    position: GeoCoords,
    positionCapturedAt: number,
  ): Promise<boolean> {
    const ageMs = Date.now() - positionCapturedAt
    const valid =
      Number.isFinite(position.lat) &&
      Number.isFinite(position.lng) &&
      Number.isFinite(positionCapturedAt) &&
      ageMs >= 0 &&
      ageMs <= ACCOUNT_FALLBACK_MAX_AGE_MS

    if (!valid || isFresh() || !(await canUseStoredLocation())) return false

    setCachedPosition({ ...position, capturedAt: positionCapturedAt })
    return true
  }

  return {
    status: readonly(status),
    coords: readonly(coords),
    errorMessage: readonly(errorMessage),
    locationSource: readonly(locationSource),
    request,
    isFresh,
    isShareable,
    getLastKnownLocation,
    restoreAccountLocation,
  }
}
