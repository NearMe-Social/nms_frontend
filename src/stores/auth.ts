import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  clearStoredSession,
  getTokenExpiresAt,
  isTokenActive,
  notifySessionExpired,
} from '@/utils/session'

export interface AuthUser {
  userId?: number
  user_id?: number
  username: string
  email: string
  role: string
  profile_completed?: boolean
  onboarding_completed?: boolean
  profile_image?: string | null
  first_name?: string
  last_name?: string
  bio?: string | null
  profile?: unknown
}

export function getPostAuthPath(user: AuthUser | null): string {
  if (user?.role === 'ADMIN') return '/admin/dashboard'
  if (user?.profile_completed !== true) return '/select-profile'
  if (user?.onboarding_completed !== true) return '/permission-request'
  return '/'
}

function readStoredUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null') as AuthUser | null
  } catch {
    clearStoredSession()
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const storedToken = localStorage.getItem('token')
  let initialToken = storedToken && isTokenActive(storedToken) ? storedToken : null
  const initialUser = initialToken ? readStoredUser() : null

  if ((storedToken && !initialToken) || (initialToken && !initialUser)) {
    clearStoredSession()
    initialToken = null
  }

  const token = ref<string | null>(initialToken)
  const user = ref<AuthUser | null>(initialToken ? initialUser : null)
  let expiryTimer: ReturnType<typeof setTimeout> | null = null

  const isLoggedIn = computed(() => !!token.value)

  function clearExpiryTimer() {
    if (expiryTimer) clearTimeout(expiryTimer)
    expiryTimer = null
  }

  function scheduleExpiry(newToken: string) {
    clearExpiryTimer()
    const expiresAt = getTokenExpiresAt(newToken)
    if (!expiresAt) return

    const remainingMs = expiresAt - Date.now()
    if (remainingMs <= 0) {
      expireSession()
      return
    }

    expiryTimer = setTimeout(expireSession, remainingMs)
  }

  function expireSession() {
    clearExpiryTimer()
    token.value = null
    user.value = null
    notifySessionExpired()
  }

  function hasValidSession() {
    if (!token.value) return false
    if (isTokenActive(token.value)) return true

    expireSession()
    return false
  }

  function setAuth(newToken: string, userData: AuthUser) {
    const normalizedUser = {
      ...userData,
      userId: userData.userId ?? userData.user_id,
    }

    token.value = newToken
    user.value = normalizedUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(normalizedUser))
    scheduleExpiry(newToken)
  }

  // Keep setToken for backward compatibility
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    scheduleExpiry(newToken)
  }

  function logout() {
    clearExpiryTimer()
    token.value = null
    user.value = null
    clearStoredSession()
  }

  function updateProfile(profileData: object) {
    if (user.value) {
      const profileFields = profileData as Partial<AuthUser>
      const existingProfile =
        user.value.profile && typeof user.value.profile === 'object' ? user.value.profile : {}

      user.value = {
        ...user.value,
        ...profileFields,
        userId: profileFields.userId ?? profileFields.user_id ?? user.value.userId,
        profile: {
          ...existingProfile,
          ...profileData,
        },
      }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  if (initialToken) scheduleExpiry(initialToken)

  return {
    token,
    user,
    isLoggedIn,
    hasValidSession,
    setAuth,
    setToken,
    logout,
    updateProfile,
  }
})
