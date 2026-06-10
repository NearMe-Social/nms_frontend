import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AuthUser {
  userId?: number
  user_id?: number
  username: string
  email: string
  role: string
  profile_completed?: boolean
  onboarding_completed?: boolean
  profile_image?: string | null
  profile?: unknown
}

export function getPostAuthPath(user: AuthUser | null): string {
  if (user?.role === 'ADMIN') return '/admin/reports'
  if (user?.profile_completed !== true) return '/select-profile'
  if (user?.onboarding_completed !== true) return '/permission-request'
  return '/'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<AuthUser | null>(
    JSON.parse(localStorage.getItem('auth_user') || 'null'),
  )

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(newToken: string, userData: AuthUser) {
    const normalizedUser = {
      ...userData,
      userId: userData.userId ?? userData.user_id,
    }

    token.value = newToken
    user.value = normalizedUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(normalizedUser))
  }

  // Keep setToken for backward compatibility
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('nms_token')
  }

  function updateProfile(profileData: unknown) {
    if (user.value) {
      user.value.profile = profileData
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return { token, user, isLoggedIn, setAuth, setToken, logout, updateProfile }
})
