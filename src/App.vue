<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatSocketStore } from '@/stores/chatSocket'

const auth = useAuthStore()
const chatSocket = useChatSocketStore()

onMounted(() => {
  if (auth.isLoggedIn) {
    chatSocket.connect()
  }
})

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      chatSocket.connect()
    } else {
      chatSocket.disconnect()
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
