<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatSocketStore } from '@/stores/chatSocket'
import { stopGeolocationTracking } from '@/composables/useGeolocation'
import { authApi } from '@/services/api'
import { SESSION_EXPIRED_EVENT } from '@/utils/session'

const auth = useAuthStore()
const chatSocket = useChatSocketStore()
const router = useRouter()

async function validateRememberedSession() {
  if (!auth.hasValidSession()) return

  try {
    const user = await authApi.me()
    auth.updateProfile(user)
  } catch {
    // Authenticated 401 responses are handled centrally by the API client.
  }
}

function handleSessionExpired() {
  auth.logout()
  chatSocket.disconnect()
  stopGeolocationTracking(true)

  if (router.currentRoute.value.meta.requiresAuth) {
    void router.replace({
      name: 'Login',
      query: { reason: 'session-expired' },
    })
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (auth.hasValidSession()) {
      void validateRememberedSession()
    }
  }
}

onMounted(() => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (auth.hasValidSession()) {
    chatSocket.connect()
    void validateRememberedSession()
  } else {
    stopGeolocationTracking(true)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      chatSocket.connect()
    } else {
      chatSocket.disconnect()
      stopGeolocationTracking(true)
    }
  },
)
</script>

<template>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

body {
  background: #f4f7fb;
}
</style>
