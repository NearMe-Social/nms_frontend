<template>
  <AuthPageShell
    title="Meet the people and moments around you."
    description="Create your Nearme account and become part of the conversations happening in your local community."
    wide
  >
    <section class="register-card">
      <div class="card-heading">
        <p class="card-eyebrow">Join Nearme</p>
        <h2>Create your account</h2>
        <p>A few details are all you need to get started.</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="two-column">
          <div class="form-group">
            <label for="first-name">First name</label>
            <div class="input-wrapper">
              <input
                id="first-name"
                type="text"
                placeholder="e.g. Julian"
                v-model="firstName"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="last-name">Last name</label>
            <div class="input-wrapper">
              <input
                id="last-name"
                type="text"
                placeholder="e.g. Thorne"
                v-model="lastName"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="birthday">Birthday</label>
          <div class="input-wrapper">
            <input id="birthday" type="date" v-model="birthday" required />
          </div>
        </div>

        <div class="form-group">
          <label for="gender">Select your gender</label>
          <div
            class="input-wrapper custom-select"
            ref="genderDropdownRef"
            :class="{ 'is-open': isGenderOpen }"
          >
            <button
              id="gender"
              type="button"
              class="select-trigger"
              :class="{ 'is-placeholder': !gender }"
              aria-haspopup="listbox"
              :aria-expanded="isGenderOpen"
              @click="toggleGenderDropdown"
            >
              <span>{{ selectedGenderLabel }}</span>
              <span class="select-chevron" :class="{ 'is-open': isGenderOpen }">▾</span>
            </button>

            <ul
              v-if="isGenderOpen"
              class="select-menu"
              role="listbox"
              aria-label="Select your gender"
            >
              <li
                v-for="option in genderOptions"
                :key="option.value"
                role="option"
                :aria-selected="gender === option.value"
              >
                <button
                  type="button"
                  class="select-option"
                  :class="{ 'is-selected': gender === option.value }"
                  @click="selectGender(option.value)"
                >
                  {{ option.label }}
                </button>
              </li>
            </ul>
          </div>
          <p v-if="genderError" class="field-error">{{ genderError }}</p>
        </div>

        <div class="form-group">
          <label for="contact">Mobile number or email</label>
          <div class="input-wrapper">
            <input
              id="contact"
              type="text"
              placeholder="phone@example.com"
              v-model="contact"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              type="password"
              placeholder="********"
              v-model="password"
              required
            />
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="register-btn" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register Now' }}
        </button>
        <button type="button" class="ghost-link" @click="goToLogin">
          I already have an account
        </button>
      </form>

      <p class="cookie-text">
        By creating an account, you agree to our <a href="/terms">Terms</a>,
        <a href="/privacy">Privacy Policy</a>, and <a href="/cookies">Cookies Policy</a>.
      </p>
    </section>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import AuthPageShell from '@/components/AuthPageShell.vue'

const router = useRouter()
const auth = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const birthday = ref('')
const gender = ref('')
const contact = ref('')
const password = ref('')
const isGenderOpen = ref(false)
const genderError = ref('')
const genderDropdownRef = ref<HTMLElement | null>(null)
const errorMsg = ref('')
const isLoading = ref(false)

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

const selectedGenderLabel = computed(() => {
  return (
    genderOptions.find((option) => option.value === gender.value)?.label || 'Select your gender'
  )
})

const birthdayDate = computed(() => {
  return birthday.value || undefined
})

function toggleGenderDropdown() {
  isGenderOpen.value = !isGenderOpen.value
}

function selectGender(value: string) {
  gender.value = value
  genderError.value = ''
  isGenderOpen.value = false
}

function closeGenderDropdownOnOutsideClick(event: MouseEvent) {
  if (!genderDropdownRef.value) {
    return
  }
  const target = event.target as Node
  if (!genderDropdownRef.value.contains(target)) {
    isGenderOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeGenderDropdownOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeGenderDropdownOnOutsideClick)
})

async function handleRegister() {
  if (!gender.value) {
    genderError.value = 'Please select your gender.'
    isGenderOpen.value = true
    return
  }

  // Map form fields to backend DTO.
  const username = `${firstName.value}.${lastName.value}`.trim().toLowerCase()
  const email = contact.value

  errorMsg.value = ''
  isLoading.value = true
  try {
    const res = await authApi.register({
      username,
      first_name: firstName.value,
      last_name: lastName.value,
      email,
      password: password.value,
      birthday: birthdayDate.value,
      gender: gender.value,
    })
    router.push({ path: '/verify-otp', query: { email: res.email } })
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-card {
  width: min(620px, 100%);
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
  margin-bottom: 26px;
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

.card-heading > p:last-child {
  margin: 8px 0 0;
  color: #718094;
  font-size: 0.93rem;
  line-height: 1.55;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-group label {
  color: #34465a;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  min-height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  border: 1px solid #dce5ea;
  border-radius: 14px;
  background: #f8fafb;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #0c9081;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(12, 144, 129, 0.11);
}

.input-wrapper input,
.input-wrapper select {
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

.custom-select {
  padding: 0;
  position: relative;
  overflow: visible;
}

.custom-select.is-open {
  border-color: #0c9081;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(12, 144, 129, 0.11);
}

.select-trigger {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 46px;
  padding: 0 14px;
  color: #23364a;
  font: inherit;
  font-size: 0.92rem;
  text-align: left;
  cursor: pointer;
}

.select-trigger.is-placeholder {
  color: #9aa7b3;
}

.select-trigger:focus-visible {
  outline: none;
}

.select-chevron {
  color: #758696;
  font-size: 0.88rem;
  transition: transform 0.16s ease;
}

.select-chevron.is-open {
  transform: rotate(180deg);
}

.select-menu {
  list-style: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px;
  background: #fff;
  border: 1px solid #dce5ea;
  border-radius: 14px;
  box-shadow: 0 18px 36px rgba(28, 64, 82, 0.16);
  max-height: 220px;
  overflow-y: auto;
  z-index: 20;
}

.select-option {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: transparent;
  color: #33475b;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
}

.select-option:hover,
.select-option:focus-visible {
  background: #eff8f7;
  outline: none;
}

.select-option.is-selected {
  background: #e4f5f2;
  color: #08766c;
  font-weight: 700;
}

.field-error {
  margin-top: 6px;
  font-size: 0.78rem;
  color: #b42318;
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

.register-btn {
  width: 100%;
  min-height: 50px;
  margin-top: 2px;
  border: 0;
  border-radius: 14px;
  padding: 0 18px;
  cursor: pointer;
  font-weight: 750;
  font-size: 0.95rem;
  color: #fff;
  background: linear-gradient(135deg, #0d9b8a, #08766c);
  box-shadow: 0 13px 28px rgba(12, 144, 129, 0.24);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(12, 144, 129, 0.3);
}

.register-btn:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.ghost-link {
  margin-top: -2px;
  border: 0;
  background: none;
  color: #0b8275;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
}

.ghost-link:hover {
  text-decoration: underline;
}

.cookie-text {
  margin: 22px 0 0;
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
  .register-card {
    margin-inline: auto;
  }
}

@media (max-width: 640px) {
  .register-card {
    padding: 28px 20px 26px;
    border-radius: 22px;
  }

  .register-form {
    gap: 15px;
  }

  .two-column {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 380px) {
  .register-card {
    padding-inline: 17px;
  }
}
</style>
