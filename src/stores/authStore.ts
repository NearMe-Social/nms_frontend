import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('nms_token'))

  const isAuthenticated = computed(() => !!token.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('nms_token', t)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('nms_token')
  }

  return { token, isAuthenticated, setToken, clearToken }
})
