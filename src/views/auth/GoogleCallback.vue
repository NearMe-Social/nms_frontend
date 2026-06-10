<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  const token = new URLSearchParams(window.location.search).get('token')

  if (!token) {
    await router.replace('/login')
    return
  }

  try {
    auth.setToken(token)

    const user = await authApi.me()
    auth.setAuth(token, user)

    // Remove the token from the visible browser URL.
    await router.replace('/')
  } catch {
    auth.logout()
    error.value = 'Google login failed'
    setTimeout(() => router.replace('/login'), 1500)
  }
})
</script>

<template>
  <div>
    {{ error || 'Logging in with Google...' }}
  </div>
</template>
