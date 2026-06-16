import { userApi } from '@/services/api'
import { useGeolocation } from '@/composables/useGeolocation'
import { clearNearbyPresence } from '@/utils/nearbyPresence'

const PRESENCE_ENABLED_KEY = 'nms_nearby_presence_enabled'
const PRESENCE_REFRESH_INTERVAL_MS = 5_000

let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let heartbeatInFlight = false

export function isNearbyPresenceEnabled() {
  return sessionStorage.getItem(PRESENCE_ENABLED_KEY) !== 'false'
}

export function setNearbyPresenceEnabled(enabled: boolean) {
  sessionStorage.setItem(PRESENCE_ENABLED_KEY, enabled ? 'true' : 'false')
}

export async function refreshNearbyPresenceNow() {
  if (heartbeatInFlight || !isNearbyPresenceEnabled() || !localStorage.getItem('token')) {
    return
  }

  heartbeatInFlight = true
  try {
    const geo = useGeolocation()
    const coords = await geo.request({ forceRefresh: !geo.isShareable() })

    if (coords && geo.isShareable()) {
      await userApi.updateLocation(coords.lat, coords.lng)
    }
  } catch {
    // Presence refresh should never interrupt the page the user is currently using.
  } finally {
    heartbeatInFlight = false
  }
}

export function startNearbyPresenceHeartbeat() {
  if (heartbeatTimer || !isNearbyPresenceEnabled() || !localStorage.getItem('token')) {
    return
  }

  void refreshNearbyPresenceNow()
  heartbeatTimer = setInterval(() => {
    void refreshNearbyPresenceNow()
  }, PRESENCE_REFRESH_INTERVAL_MS)
}

export function stopNearbyPresenceHeartbeat(
  options: { clearRemote?: boolean; keepalive?: boolean } = {},
) {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  if (options.clearRemote) {
    clearNearbyPresence({ keepalive: options.keepalive })
  }
}
