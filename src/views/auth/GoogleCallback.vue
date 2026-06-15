<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleAlert, LoaderCircle } from 'lucide-vue-next'
import { getPostAuthPath, useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import AuthPageShell from '@/components/AuthPageShell.vue'

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

    await router.replace(getPostAuthPath(user))
  } catch {
    auth.logout()
    error.value = 'Google login failed'
    setTimeout(() => router.replace('/login'), 1500)
  }
})
</script>

<template>
  <AuthPageShell
    eyebrow="Secure sign in"
    title="Connecting you to your local circle."
    description="We are securely completing your Google sign-in and preparing your Nearme account."
  >
    <section class="callback-card" role="status" aria-live="polite">
      <div class="callback-icon" :class="{ 'callback-icon--error': error }">
        <CircleAlert v-if="error" :size="29" />
        <LoaderCircle v-else :size="29" class="callback-spinner" />
      </div>
      <h2>{{ error ? 'Sign-in could not be completed' : 'Signing you in' }}</h2>
      <p>{{ error || 'Please wait while we securely connect your account.' }}</p>
    </section>
  </AuthPageShell>
</template>

<style scoped>
.callback-card {
  width: min(470px, 100%);
  margin-left: auto;
  padding: 52px 36px;
  border: 1px solid rgba(134, 160, 176, 0.22);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 28px 70px rgba(28, 64, 82, 0.13),
    0 2px 8px rgba(28, 64, 82, 0.04);
  text-align: center;
  backdrop-filter: blur(18px);
}

.callback-icon {
  width: 62px;
  height: 62px;
  margin: 0 auto 20px;
  display: grid;
  place-items: center;
  border: 1px solid #d0ece8;
  border-radius: 19px;
  background: #e8f7f5;
  color: #0c9081;
}

.callback-icon--error {
  border-color: #fed7d7;
  background: #fff1f1;
  color: #c2413b;
}

.callback-card h2 {
  margin: 0;
  color: #17283d;
  font-size: 1.55rem;
  letter-spacing: -0.035em;
}

.callback-card p {
  margin: 10px 0 0;
  color: #718094;
  font-size: 0.9rem;
  line-height: 1.6;
}

.callback-spinner {
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .callback-card {
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .callback-card {
    padding: 38px 22px;
    border-radius: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .callback-spinner {
    animation-duration: 1.8s;
  }
}
</style>
