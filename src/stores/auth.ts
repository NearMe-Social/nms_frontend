import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthUser {
  userId: number
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
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
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
  }

  return { token, user, isLoggedIn, setAuth, setToken, logout }
})
