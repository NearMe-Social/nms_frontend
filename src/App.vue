<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatSocketStore } from '@/stores/chatSocket'
import { stopGeolocationTracking } from '@/composables/useGeolocation'
import {
  startNearbyPresenceHeartbeat,
  stopNearbyPresenceHeartbeat,
} from '@/composables/useNearbyPresenceHeartbeat'
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
  stopNearbyPresenceHeartbeat({ clearRemote: true })
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

function handlePageHide() {
  if (auth.isLoggedIn) {
    stopNearbyPresenceHeartbeat({ clearRemote: true, keepalive: true })
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (auth.hasValidSession()) {
      startNearbyPresenceHeartbeat()
      void validateRememberedSession()
    }
  }
}

onMounted(() => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  window.addEventListener('pagehide', handlePageHide)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (auth.hasValidSession()) {
    chatSocket.connect()
    startNearbyPresenceHeartbeat()
    void validateRememberedSession()
  } else {
    stopGeolocationTracking(true)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  window.removeEventListener('pagehide', handlePageHide)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      chatSocket.connect()
      startNearbyPresenceHeartbeat()
    } else {
      stopNearbyPresenceHeartbeat({ clearRemote: true })
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
