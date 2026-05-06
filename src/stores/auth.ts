import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthUser {
  userId?: number
  user_id?: number
  username: string
  email: string
  role: string
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

  return { token, user, isLoggedIn, setAuth, setToken, logout }
})
