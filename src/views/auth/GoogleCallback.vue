<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)

  const token = params.get('token')

  if (token) {
    localStorage.setItem('token', token)

    router.push('/')
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div>
    Logging in with Google...
  </div>
</template>