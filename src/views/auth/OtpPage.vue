<template>
  <AuthPageShell
    eyebrow="Secure verification"
    title="One quick step, then you're in."
    description="Verify your email to protect your account and keep the Nearme community trustworthy."
  >
    <section class="otp-card">
      <div class="otp-card__inner">
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
            :ref="(el) => (inputRefs[index] = el)"
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
        <button class="verify-btn" :disabled="!isComplete || isLoading" @click="handleVerify">
          {{ isLoading ? 'Verifying...' : 'Verify Code' }}
        </button>

        <!-- Resend -->
        <div class="resend-row">
          <span class="resend-text">Didn't receive the code?</span>
          <button class="resend-btn" :disabled="resendCooldown > 0" @click="handleResend">
            {{ resendCooldown > 0 ? 'Resend in ' + resendCooldown + 's' : 'Resend Code' }}
          </button>
        </div>

        <!-- Back to login -->
        <button class="back-btn" @click="router.push('/login')">← Back to Login</button>
      </div>
    </section>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostAuthPath, useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import AuthPageShell from '@/components/AuthPageShell.vue'
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

const isComplete = computed(() => otpDigits.value.every((d) => d !== ''))
const otpValue = computed(() => otpDigits.value.join(''))

onMounted(async () => {
  // Focus first input
  setTimeout(() => inputRefs.value[0]?.focus(), 100)

  if (!email.value) {
    await router.replace('/register')
    return
  }

  try {
    await authApi.sendOtp(email.value)
    startCooldown()
    errorMsg.value = ''
    hasError.value = false
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.'
  }
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
    router.replace(getPostAuthPath(res.user))
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
    startCooldown()
    errorMsg.value = ''
    hasError.value = false
    otpDigits.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to resend OTP.'
  }
}
</script>

<style scoped>
.otp-card {
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

.otp-card__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.otp-icon {
  width: 62px;
  height: 62px;
  background: #e8f7f5;
  border: 1px solid #d0ece8;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: clamp(1.65rem, 3vw, 2rem);
  color: #17283d;
  letter-spacing: -0.035em;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #718094;
  margin-bottom: 32px;
  line-height: 1.6;
}

.card-subtitle strong {
  color: #33475b;
  font-weight: 750;
}

.otp-inputs {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.otp-input {
  width: min(50px, 13%);
  aspect-ratio: 0.86;
  border: 1px solid #dce5ea;
  border-radius: 13px;
  background: #f8fafb;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #23364a;
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
  background: #edf9f7;
}

.otp-input.error {
  border-color: #e74c3c;
  background: #fdf0ef;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

.error-msg {
  font-size: 0.88rem;
  color: #b42318;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 16px;
  width: 100%;
}

.verify-btn {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  font-weight: 750;
  font-size: 0.95rem;
  color: #fff;
  background: linear-gradient(135deg, #0d9b8a, #08766c);
  box-shadow: 0 13px 28px rgba(12, 144, 129, 0.24);
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
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.resend-text {
  font-size: 0.88rem;
  color: #718094;
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
  color: #82909e;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #0c9081;
}

@media (max-width: 900px) {
  .otp-card {
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .otp-card {
    padding: 28px 20px;
    border-radius: 22px;
  }

  .otp-input {
    width: min(43px, 14%);
    font-size: 1.2rem;
  }
}
</style>
