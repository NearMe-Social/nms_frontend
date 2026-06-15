<template>
  <AuthPageShell
    title="Your community is closer than you think."
    description="Sign in to see nearby conversations, reconnect with neighbors, and discover what is happening around you."
  >
    <section class="login-card">
      <div class="card-heading">
        <p class="card-eyebrow">Welcome back</p>
        <h2>Log in to <span class="brand-word">Nearme</span></h2>
        <p>Enter your account details to continue.</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email address</label>
          <div class="input-wrapper">
            <Mail :size="19" aria-hidden="true" />
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label for="password">Password</label>
            <a href="/forgot-password">Forgot password?</a>
          </div>
          <div class="input-wrapper">
            <LockKeyhole :size="19" aria-hidden="true" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg" role="alert">{{ errorMsg }}</p>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span>{{ isLoading ? 'Logging in...' : 'Log in' }}</span>
          <ArrowRight v-if="!isLoading" :size="18" aria-hidden="true" />
        </button>

        <p class="signup-text">
          New to Nearme?
          <RouterLink to="/register">Create an account</RouterLink>
        </p>

        <div class="divider">
          <span>Or continue with</span>
        </div>

        <div class="btn-social">
          <button
            type="button"
            class="btn-social__item"
            aria-label="Continue with Google"
            @click="handleSocialLogin('google')"
          >
            <img :src="googleIcon" alt="" class="btn-icon btn-icon--google" />
            <span>Google</span>
          </button>

          <button
            type="button"
            class="btn-social__item btn-social__item--icon"
            aria-label="Continue with Facebook"
            @click="handleSocialLogin('facebook')"
          >
            <img :src="facebookIcon" alt="" class="btn-icon btn-icon--social" />
          </button>

          <button
            type="button"
            class="btn-social__item btn-social__item--icon"
            aria-label="Continue with X"
            @click="handleSocialLogin('x')"
          >
            <img :src="xIcon" alt="" class="btn-icon btn-icon--social" />
          </button>
        </div>
      </form>

      <p class="cookie-text">
        By continuing, you agree to our <a href="/terms">Terms</a>,
        <a href="/privacy">Privacy Policy</a>, and <a href="/cookies">Cookies Policy</a>.
      </p>
    </section>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-vue-next'
import { getPostAuthPath, useAuthStore } from '@/stores/auth'
import { API_URL, authApi } from '@/services/api'
import AuthPageShell from '@/components/AuthPageShell.vue'

import googleIcon from '@/assets/icons/Google.png'
import facebookIcon from '@/assets/icons/Facebook.png'
import xIcon from '@/assets/icons/X.png'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  isLoading.value = true
  try {
    const res = await authApi.login(email.value, password.value)
    auth.setAuth(res.token, res.user)
    const redirect = router.currentRoute.value.query.redirect
    const postAuthPath = getPostAuthPath(res.user)

    if (postAuthPath !== '/') {
      router.replace(postAuthPath)
    } else if (typeof redirect === 'string' && !redirect.startsWith('/admin')) {
      router.replace(redirect)
    } else {
      router.replace('/')
    }
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function handleSocialLogin(provider: string) {
  if (provider === 'google') {
    window.location.assign(`${API_URL}/auth/google`)
  }
}
</script>

<style scoped>
.login-card {
  width: min(470px, 100%);
  margin-left: auto;
  padding: clamp(30px, 4vw, 44px);
  border: 1px solid rgba(134, 160, 176, 0.22);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 28px 70px rgba(28, 64, 82, 0.13),
    0 2px 8px rgba(28, 64, 82, 0.04);
  backdrop-filter: blur(18px);
}

.card-heading {
  margin-bottom: 28px;
}

.card-eyebrow {
  margin: 0 0 8px;
  color: #0c9081;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-heading h2 {
  margin: 0;
  color: #17283d;
  font-size: clamp(1.65rem, 3vw, 2rem);
  letter-spacing: -0.035em;
  line-height: 1.2;
}

.brand-word {
  position: relative;
  display: inline-block;
  color: #087f74;
  font-weight: 850;
  letter-spacing: -0.045em;
}

.brand-word::after {
  content: '';
  position: absolute;
  right: 0.02em;
  bottom: -0.08em;
  left: 0.02em;
  height: 0.12em;
  border-radius: 999px;
  background: linear-gradient(90deg, #18b5a2, #63c8bd);
  opacity: 0.65;
  transform: rotate(-1.5deg);
}

.card-heading > p:last-child {
  margin: 8px 0 0;
  color: #718094;
  font-size: 0.93rem;
  line-height: 1.55;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  min-width: 0;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #34465a;
  font-size: 0.82rem;
  font-weight: 700;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.label-row a {
  margin-bottom: 8px;
  color: #0b8275;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.label-row a:hover {
  text-decoration: underline;
}

.input-wrapper {
  min-height: 50px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid #dce5ea;
  border-radius: 14px;
  background: #f8fafb;
  color: #8a9aa8;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #0c9081;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(12, 144, 129, 0.11);
  color: #0c9081;
}

.input-wrapper input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #23364a;
  font: inherit;
  font-size: 0.92rem;
}

.input-wrapper input::placeholder {
  color: #9aa7b3;
}

.error-msg {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fff5f5;
  color: #b42318;
  font-size: 0.83rem;
  line-height: 1.45;
  text-align: center;
}

.login-btn {
  width: 100%;
  min-height: 50px;
  margin-top: 2px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #0d9b8a, #08766c);
  box-shadow: 0 13px 28px rgba(12, 144, 129, 0.24);
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 750;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(12, 144, 129, 0.3);
}

.login-btn:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.signup-text {
  margin: -1px 0 0;
  color: #718094;
  font-size: 0.85rem;
  text-align: center;
}

.signup-text a {
  color: #0b8275;
  font-weight: 750;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #99a5b1;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.divider::before,
.divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: #e4ebef;
}

.btn-social {
  display: grid;
  grid-template-columns: 1fr 52px 52px;
  gap: 10px;
}

.btn-social__item {
  height: 48px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid #dce5ea;
  border-radius: 13px;
  background: #fff;
  color: #33475b;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.btn-social__item:hover {
  border-color: #b8cbd3;
  background: #f8fbfc;
  transform: translateY(-1px);
}

.btn-social__item--icon {
  padding: 0;
}

.btn-icon {
  display: block;
  object-fit: contain;
}

.btn-icon--google {
  width: 28px;
  height: 28px;
}

.btn-icon--social {
  width: 31px;
  height: 31px;
}

.cookie-text {
  margin: 24px 0 0;
  color: #8b98a6;
  font-size: 0.7rem;
  line-height: 1.55;
  text-align: center;
}

.cookie-text a {
  color: #587486;
  font-weight: 650;
  text-decoration: none;
}

@media (max-width: 900px) {
  .login-card {
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .login-card {
    padding: 27px 20px 26px;
    border-radius: 22px;
  }

  .card-heading {
    margin-bottom: 24px;
  }

  .login-form {
    gap: 16px;
  }
}
</style>
