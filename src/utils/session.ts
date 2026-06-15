export const SESSION_EXPIRED_EVENT = 'nms:session-expired'

const TOKEN_KEY = 'token'
const USER_KEY = 'auth_user'
const LEGACY_TOKEN_KEY = 'nms_token'

interface JwtPayload {
  exp?: number
}

export function getTokenExpiresAt(token: string): number | null {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded)) as JwtPayload

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenActive(token: string, now = Date.now()): boolean {
  const expiresAt = getTokenExpiresAt(token)
  return expiresAt !== null && expiresAt > now
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export function notifySessionExpired() {
  clearStoredSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
