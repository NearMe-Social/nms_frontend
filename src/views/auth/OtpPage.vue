<template>
  <div class="otp-page">
    <header class="otp-header">
      <h1>Nearme</h1>
    </header>

    <main class="otp-main">
      <section class="otp-card">

        <!-- Icon -->
        <div class="otp-icon">
          <Mail :size="32" color="#0c9081" />
        </div>

        <h1 class="card-title">Check your email</h1>
        <p class="card-subtitle">
          We sent a 6-digit verification code to<br />
          <strong>{{ email }}</strong>
        </p>

        <!-- OTP inputs -->
        <div class="otp-inputs">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="el => inputRefs[index] = el"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-input"
            :class="{ filled: digit !== '', error: hasError }"
            :value="digit"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>

        <!-- Error message -->
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <!-- Verify button -->
        <button
          class="verify-btn"
          :disabled="!isComplete || isLoading"
          @click="handleVerify"
        >
          {{ isLoading ? 'Verifying...' : 'Verify Code' }}
        </button>

        <!-- Resend -->
        <div class="resend-row">
          <span class="resend-text">Didn't receive the code?</span>
          <button
            class="resend-btn"
            :disabled="resendCooldown > 0"
            @click="handleResend"
          >
            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
          </button>
        </div>

        <!-- Back to login -->
        <button class="back-btn" @click="router.push('/login')">
          ← Back to Login
        </button>

      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import { Mail } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Get email from query param
const email = ref((route.query.email as string) || '')

const otpDigits = ref(['', '', '', '', '', ''])
const inputRefs = ref<any[]>([])
const errorMsg = ref('')
const hasError = ref(false)
const isLoading = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const isComplete = computed(() => otpDigits.value.every(d => d !== ''))
const otpValue = computed(() => otpDigits.value.join(''))

onMounted(() => {
  // Focus first input
  setTimeout(() => inputRefs.value[0]?.focus(), 100)
  // Start resend cooldown
  startCooldown()
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

function startCooldown() {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer!)
    }
  }, 1000)
}

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '') // numbers only
  otpDigits.value[index] = value.slice(-1)
  errorMsg.value = ''
  hasError.value = false

  // Auto move to next
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  // Auto verify when all filled
  if (isComplete.value) {
    handleVerify()
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    inputRefs.value[index - 1]?.focus()
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text') || ''
  const digits = text.replace(/\D/g, '').slice(0, 6).split('')
  digits.forEach((d, i) => {
    if (i < 6) otpDigits.value[i] = d
  })
  // Focus last filled or last input
  const lastIndex = Math.min(digits.length, 5)
  inputRefs.value[lastIndex]?.focus()

  if (isComplete.value) {
    handleVerify()
  }
}

async function handleVerify() {
  if (!isComplete.value || isLoading.value) return
  errorMsg.value = ''
  hasError.value = false
  isLoading.value = true

  try {
    const res = await authApi.verifyOtp(email.value, otpValue.value)
    auth.setAuth(res.token, res.user)
    router.replace('/')
  } catch (err: unknown) {
    hasError.value = true
    errorMsg.value = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
    // Shake and clear inputs
    otpDigits.value = ['', '', '', '', '', '']
    setTimeout(() => inputRefs.value[0]?.focus(), 100)
  } finally {
    isLoading.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  try {
    await authApi.sendOtp(email.value)
    errorMsg.value = ''
    hasError.value = false
    otpDigits.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
    startCooldown()
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to resend OTP.'
  }
}
</script>

<style scoped>
.otp-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Poppins', 'Inter', sans-serif;
}

.otp-header {
  padding: 18px 40px;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
}

.otp-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px 56px;
}

.otp-card {
  width: min(380px, 100%);
  padding: 36px 32px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.otp-icon {
  width: 64px;
  height: 64px;
  background: #e6f7f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.5rem;
  color: #2c1d25;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #6f6473;
  margin-bottom: 32px;
  line-height: 1.6;
}

.otp-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.otp-input {
  width: 48px;
  height: 56px;
  border: 2px solid #d6d1ca;
  border-radius: 14px;
  background: #f5f2ef;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2b1d22;
  outline: none;
  transition: all 0.2s ease;
  caret-color: transparent;
}

.otp-input:focus {
  border-color: #0c9081;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(12, 144, 129, 0.15);
}

.otp-input.filled {
  border-color: #0c9081;
  background: #e6f7f5;
}

.otp-input.error {
  border-color: #e74c3c;
  background: #fdf0ef;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.error-msg {
  font-size: 0.88rem;
  color: #c0392b;
  background: #fdf0ef;
  border: 1px solid #f5c6c2;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 16px;
  width: 100%;
}

.verify-btn {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
  background: linear-gradient(140deg, #c7a038, #6c4f15);
  box-shadow: 0 12px 20px rgba(108, 79, 21, 0.25);
  transition: opacity 0.2s;
  margin-bottom: 20px;
}

.verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.resend-text {
  font-size: 0.88rem;
  color: #6f6473;
}

.resend-btn {
  border: none;
  background: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0c9081;
  cursor: pointer;
  transition: opacity 0.2s;
}

.resend-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

.back-btn {
  border: none;
  background: none;
  font-size: 0.85rem;
  color: #9a8d96;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #0c9081;
}

@media (max-width: 480px) {
  .otp-card {
    padding: 28px 20px 32px;
  }
  .otp-input {
    width: 42px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>