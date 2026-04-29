<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/profile">Profile</RouterLink>
    <RouterLink to="/chat">Chat</RouterLink>
    <RouterLink to="/notifications">Notifications</RouterLink>
    <RouterLink to="/settings">Settings</RouterLink>
    <RouterLink to="/discussion">Discussion</RouterLink>

    <button @click="handleLogout">Logout</button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
nav {
  display: flex;
  gap: 16px;
  padding: 12px 24px;
}
nav a {
  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}
button {
  margin-left: auto;
  cursor: pointer;
}
</style>