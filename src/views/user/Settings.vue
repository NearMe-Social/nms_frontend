<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LogOut,
  MapPinOff,
  Pencil,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import Navbar from '@/components/Navbar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { authApi, userApi, type UserProfile } from '@/services/api'
import { stopGeolocationTracking } from '@/composables/useGeolocation'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'UserSettings' })

type SettingsTab = 'account' | 'security' | 'privacy'

const router = useRouter()
const auth = useAuthStore()
const activeTab = ref<SettingsTab>('account')
const profile = ref<UserProfile | null>(null)
const loadingProfile = ref(true)
const profileError = ref('')
const passwordForm = ref({ current: '', next: '', confirm: '' })
const showCurrent = ref(false)
const showNext = ref(false)
const showConfirm = ref(false)
const savingPassword = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')
const clearingLocation = ref(false)
const privacySuccess = ref('')
const privacyError = ref('')

const tabs = [
  { key: 'account' as const, label: 'Account', icon: UserRound },
  { key: 'security' as const, label: 'Security', icon: KeyRound },
  { key: 'privacy' as const, label: 'Location & privacy', icon: ShieldCheck },
]

const username = computed(() => profile.value?.username || auth.user?.username || 'neighbor')
const displayName = computed(() => {
  const firstName = profile.value?.first_name || auth.user?.first_name || ''
  const lastName = profile.value?.last_name || auth.user?.last_name || ''
  const name = `${firstName} ${lastName}`.trim()

  return (
    name ||
    username.value
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') ||
    'Nearme Neighbor'
  )
})
const profileImage = computed(
  () => profile.value?.profile_image || auth.user?.profile_image || null,
)
const passwordStrength = computed(() => {
  const password = passwordForm.value.next
  if (!password) return { score: 0, label: 'Enter a new password' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  return {
    score,
    label: ['Too short', 'Basic', 'Good', 'Strong'][Math.max(0, score - 1)] || 'Too short',
  }
})
const passwordsMatch = computed(
  () =>
    passwordForm.value.confirm.length === 0 ||
    passwordForm.value.next === passwordForm.value.confirm,
)

onMounted(async () => {
  try {
    profile.value = await userApi.getProfile()
  } catch (error: unknown) {
    profileError.value = error instanceof Error ? error.message : 'Could not load account details.'
  } finally {
    loadingProfile.value = false
  }
})

async function changePassword() {
  passwordSuccess.value = ''
  passwordError.value = ''

  if (passwordForm.value.next.length < 8) {
    passwordError.value = 'New password must be at least 8 characters.'
    return
  }

  if (passwordForm.value.next !== passwordForm.value.confirm) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  savingPassword.value = true
  try {
    const response = await authApi.changePassword(
      passwordForm.value.current,
      passwordForm.value.next,
    )
    passwordSuccess.value = response.message
    passwordForm.value = { current: '', next: '', confirm: '' }
  } catch (error: unknown) {
    passwordError.value = error instanceof Error ? error.message : 'Password could not be updated.'
  } finally {
    savingPassword.value = false
  }
}

async function clearLocation() {
  privacySuccess.value = ''
  privacyError.value = ''
  clearingLocation.value = true

  try {
    const response = await userApi.clearLocation()
    stopGeolocationTracking(true)
    privacySuccess.value = response.message
  } catch (error: unknown) {
    privacyError.value =
      error instanceof Error ? error.message : 'Saved location could not be cleared.'
  } finally {
    clearingLocation.value = false
  }
}

async function signOut() {
  auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <div class="settings-page">
    <Navbar />

    <div class="settings-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <div>
            <p class="eyebrow">Account control</p>
            <h1>Settings</h1>
            <p>Manage your Nearme identity, account access, and saved location data.</p>
          </div>
          <span class="security-badge"><ShieldCheck /> Privacy-first account controls</span>
        </header>

        <div class="settings-layout">
          <aside class="settings-nav" aria-label="Settings sections">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <component :is="tab.icon" />
              <span>{{ tab.label }}</span>
              <ArrowRight />
            </button>
          </aside>

          <section class="settings-content">
            <template v-if="activeTab === 'account'">
              <article class="panel profile-panel">
                <div v-if="loadingProfile" class="state-message">
                  <LoaderCircle class="spinner" /> Loading account details...
                </div>
                <p v-else-if="profileError" class="alert alert-error">{{ profileError }}</p>
                <template v-else>
                  <div class="profile-summary">
                    <UserAvatar
                      :src="profileImage"
                      :username="username"
                      :alt="`${displayName} profile`"
                      class="profile-avatar"
                    />
                    <div>
                      <p class="panel-label">Your Nearme identity</p>
                      <h2>{{ displayName }}</h2>
                      <p class="profile-handle">@{{ username }}</p>
                      <p class="profile-email">{{ profile?.email || auth.user?.email }}</p>
                    </div>
                  </div>

                  <RouterLink to="/profile/edit" class="primary-link">
                    <Pencil /> Edit profile
                  </RouterLink>
                </template>
              </article>

              <article class="panel">
                <div class="panel-heading">
                  <span class="panel-icon"><UserRound /></span>
                  <div>
                    <p class="panel-label">Profile ownership</p>
                    <h2>One editor, consistent everywhere</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Your dedicated profile editor controls your name, username, bio, and profile
                  photo. Changes update the navbar, profile page, posts, and nearby identity.
                </p>
                <RouterLink to="/profile" class="secondary-link">
                  View public profile <ArrowRight />
                </RouterLink>
              </article>

              <article class="panel session-panel">
                <div>
                  <p class="panel-label">Current session</p>
                  <h2>Signed in as {{ profile?.email || auth.user?.email }}</h2>
                  <p class="panel-copy">Sign out on this browser without changing your account.</p>
                </div>
                <button type="button" class="secondary-button" @click="signOut">
                  <LogOut /> Sign out
                </button>
              </article>
            </template>

            <template v-else-if="activeTab === 'security'">
              <article class="panel">
                <div class="panel-heading">
                  <span class="panel-icon"><KeyRound /></span>
                  <div>
                    <p class="panel-label">Account access</p>
                    <h2>Change password</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Use your current password to protect this change. Google-only accounts should
                  continue signing in with Google.
                </p>

                <form class="password-form" @submit.prevent="changePassword">
                  <label>
                    <span>Current password</span>
                    <div class="password-input">
                      <input
                        v-model="passwordForm.current"
                        :type="showCurrent ? 'text' : 'password'"
                        autocomplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        :aria-label="
                          showCurrent ? 'Hide current password' : 'Show current password'
                        "
                        @click="showCurrent = !showCurrent"
                      >
                        <EyeOff v-if="showCurrent" />
                        <Eye v-else />
                      </button>
                    </div>
                  </label>

                  <div class="password-grid">
                    <label>
                      <span>New password</span>
                      <div class="password-input">
                        <input
                          v-model="passwordForm.next"
                          :type="showNext ? 'text' : 'password'"
                          autocomplete="new-password"
                          minlength="8"
                          required
                        />
                        <button
                          type="button"
                          :aria-label="showNext ? 'Hide new password' : 'Show new password'"
                          @click="showNext = !showNext"
                        >
                          <EyeOff v-if="showNext" />
                          <Eye v-else />
                        </button>
                      </div>
                      <div class="strength-row">
                        <span class="strength-track">
                          <i :style="{ width: `${passwordStrength.score * 25}%` }"></i>
                        </span>
                        <small>{{ passwordStrength.label }}</small>
                      </div>
                    </label>

                    <label>
                      <span>Confirm new password</span>
                      <div class="password-input" :class="{ invalid: !passwordsMatch }">
                        <input
                          v-model="passwordForm.confirm"
                          :type="showConfirm ? 'text' : 'password'"
                          autocomplete="new-password"
                          minlength="8"
                          required
                        />
                        <button
                          type="button"
                          :aria-label="showConfirm ? 'Hide confirmation' : 'Show confirmation'"
                          @click="showConfirm = !showConfirm"
                        >
                          <EyeOff v-if="showConfirm" />
                          <Eye v-else />
                        </button>
                      </div>
                      <small v-if="!passwordsMatch" class="field-error">
                        Passwords do not match
                      </small>
                    </label>
                  </div>

                  <p v-if="passwordSuccess" class="alert alert-success">
                    <Check /> {{ passwordSuccess }}
                  </p>
                  <p v-if="passwordError" class="alert alert-error">{{ passwordError }}</p>

                  <div class="form-actions">
                    <button
                      type="submit"
                      class="primary-button"
                      :disabled="savingPassword || !passwordsMatch"
                    >
                      <LoaderCircle v-if="savingPassword" class="spinner" />
                      <KeyRound v-else />
                      {{ savingPassword ? 'Updating...' : 'Update password' }}
                    </button>
                  </div>
                </form>
              </article>
            </template>

            <template v-else>
              <article class="panel">
                <div class="panel-heading">
                  <span class="panel-icon"><ShieldCheck /></span>
                  <div>
                    <p class="panel-label">How Nearme protects you</p>
                    <h2>Approximate discovery by design</h2>
                  </div>
                </div>

                <div class="privacy-list">
                  <div>
                    <Check />
                    <p>
                      <strong>Exact coordinates are not returned with posts.</strong>
                      People see approximate distance and visibility radius instead.
                    </p>
                  </div>
                  <div>
                    <Check />
                    <p>
                      <strong>Nearby presence expires quickly.</strong>
                      User discovery only considers recently updated locations.
                    </p>
                  </div>
                  <div>
                    <Check />
                    <p>
                      <strong>Location is requested when a nearby feature needs it.</strong>
                      The login and registration pages do not start location tracking.
                    </p>
                  </div>
                </div>
              </article>

              <article class="panel clear-location-panel">
                <div class="panel-heading">
                  <span class="panel-icon panel-icon-warn"><MapPinOff /></span>
                  <div>
                    <p class="panel-label">Saved location</p>
                    <h2>Clear location activity</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Removes the latest location stored for your account and clears this browser's
                  cached coordinates. Nearby features will ask again the next time you use them.
                </p>

                <p v-if="privacySuccess" class="alert alert-success">
                  <Check /> {{ privacySuccess }}
                </p>
                <p v-if="privacyError" class="alert alert-error">{{ privacyError }}</p>

                <button
                  type="button"
                  class="warning-button"
                  :disabled="clearingLocation"
                  @click="clearLocation"
                >
                  <LoaderCircle v-if="clearingLocation" class="spinner" />
                  <MapPinOff v-else />
                  {{ clearingLocation ? 'Clearing...' : 'Clear saved location' }}
                </button>
              </article>
            </template>
          </section>
        </div>
      </main>
    </div>

    <MobileBottomNav />
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #20384a;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.settings-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 28px clamp(18px, 3vw, 38px) 64px;
}

.page-heading {
  margin-bottom: 22px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.eyebrow,
.panel-label {
  margin: 0;
  color: #168278;
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 7px 0 0;
  color: #0f172a;
  font-size: clamp(2rem, 3vw, 2.65rem);
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.page-heading > div > p:last-child {
  margin: 10px 0 0;
  color: #718096;
  font-size: 0.92rem;
  line-height: 1.6;
}

.security-badge {
  padding: 9px 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d5ebe9;
  border-radius: 999px;
  background: #f0faf8;
  color: #246e74;
  font-size: 0.74rem;
  font-weight: 750;
  white-space: nowrap;
}

.security-badge svg,
.primary-link svg,
.secondary-link svg,
.secondary-button svg,
.primary-button svg,
.warning-button svg,
.alert svg {
  width: 16px;
  height: 16px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 780px);
  align-items: start;
  gap: 22px;
}

.settings-nav {
  position: sticky;
  top: 82px;
  padding: 9px;
  display: grid;
  gap: 5px;
  border: 1px solid #e1eaf1;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(42, 67, 83, 0.045);
}

.settings-nav button {
  min-height: 46px;
  padding: 0 12px;
  display: grid;
  grid-template-columns: 19px 1fr 15px;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #60798a;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 750;
  text-align: left;
}

.settings-nav button svg {
  width: 17px;
  height: 17px;
}

.settings-nav button svg:last-child {
  width: 14px;
  color: #a7b4be;
}

.settings-nav button:hover,
.settings-nav button.active {
  background: #edf8f6;
  color: #14766f;
}

.settings-content {
  min-width: 0;
  display: grid;
  gap: 16px;
}

.panel {
  padding: 22px;
  border: 1px solid #e1eaf1;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(42, 67, 83, 0.05);
}

.profile-panel,
.session-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.profile-summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-avatar {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  border: 4px solid #fff;
  border-radius: 22px;
  box-shadow:
    0 0 0 1px #dbe8ed,
    0 9px 22px rgba(33, 73, 91, 0.12);
  font-size: 1.7rem;
}

.profile-summary h2,
.panel-heading h2,
.session-panel h2 {
  margin: 4px 0 0;
  color: #193a4c;
  font-size: 1.02rem;
  font-weight: 850;
}

.profile-handle,
.profile-email {
  margin: 3px 0 0;
  color: #698293;
  font-size: 0.77rem;
}

.profile-handle {
  color: #168278;
  font-weight: 700;
}

.primary-link,
.secondary-link,
.primary-button,
.secondary-button,
.warning-button {
  min-height: 42px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
}

.primary-link,
.primary-button {
  border: 0;
  background: #13867d;
  color: #fff;
  box-shadow: 0 8px 18px rgba(19, 134, 125, 0.18);
}

.secondary-link,
.secondary-button {
  width: fit-content;
  border: 1px solid #dce6ed;
  background: #f8fafb;
  color: #526d7f;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #eaf7f5;
  color: #187970;
}

.panel-icon svg {
  width: 19px;
  height: 19px;
}

.panel-copy {
  margin: 14px 0 0;
  color: #718899;
  font-size: 0.8rem;
  line-height: 1.65;
}

.panel .secondary-link {
  margin-top: 16px;
}

.state-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718899;
  font-size: 0.82rem;
}

.password-form {
  margin-top: 22px;
  display: grid;
  gap: 18px;
}

.password-form label {
  display: block;
  color: #3d596b;
  font-size: 0.76rem;
  font-weight: 800;
}

.password-form label > span {
  display: block;
  margin-bottom: 7px;
}

.password-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.password-input {
  min-height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border: 1px solid #dce6ed;
  border-radius: 12px;
  background: #f8fafb;
}

.password-input:focus-within {
  border-color: #59aaa4;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(19, 134, 125, 0.09);
}

.password-input.invalid {
  border-color: #e9a6a6;
}

.password-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #233f51;
  font: inherit;
  font-size: 0.86rem;
}

.password-input button {
  padding: 4px;
  display: inline-flex;
  border: 0;
  background: transparent;
  color: #7f92a0;
  cursor: pointer;
}

.password-input button svg {
  width: 17px;
  height: 17px;
}

.strength-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.strength-track {
  height: 5px;
  flex: 1;
  overflow: hidden;
  border-radius: 999px;
  background: #e9eff3;
}

.strength-track i {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: #1a9388;
  transition: width 0.2s ease;
}

.strength-row small,
.field-error {
  color: #7c91a1;
  font-size: 0.68rem;
}

.field-error {
  margin-top: 6px;
  display: block;
  color: #b84e4e;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-button:disabled,
.warning-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.alert {
  margin: 0;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 11px;
  font-size: 0.76rem;
  font-weight: 700;
}

.alert-success {
  border: 1px solid #cceae4;
  background: #effaf7;
  color: #14766f;
}

.alert-error {
  border: 1px solid #f1cccc;
  background: #fff5f5;
  color: #b84e4e;
}

.privacy-list {
  margin-top: 20px;
  display: grid;
  gap: 11px;
}

.privacy-list > div {
  padding: 13px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid #e5edf2;
  border-radius: 13px;
  background: #f8fbfc;
}

.privacy-list svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  margin-top: 2px;
  color: #178277;
}

.privacy-list p {
  margin: 0;
  color: #718899;
  font-size: 0.76rem;
  line-height: 1.55;
}

.privacy-list strong {
  display: block;
  color: #315467;
}

.clear-location-panel {
  border-color: #eadfca;
  background: #fffdf8;
}

.panel-icon-warn {
  background: #f8ecd1;
  color: #9a7131;
}

.warning-button {
  margin-top: 18px;
  border: 1px solid #e4cfa9;
  background: #fff8ea;
  color: #866127;
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .settings-nav button {
    grid-template-columns: 19px 1fr;
  }

  .settings-nav button svg:last-child {
    display: none;
  }
}

@media (max-width: 767px) {
  .settings-page {
    padding-bottom: calc(84px + env(safe-area-inset-bottom));
  }

  .workspace {
    padding: 20px 14px 32px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .security-badge {
    font-size: 0.68rem;
  }

  .settings-nav {
    grid-template-columns: 1fr;
  }

  .settings-nav button {
    grid-template-columns: 19px 1fr 14px;
  }

  .settings-nav button svg:last-child {
    display: block;
  }

  .profile-panel,
  .session-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .primary-link,
  .secondary-button {
    width: 100%;
  }

  .password-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .workspace {
    padding-inline: 12px;
  }

  .panel {
    padding: 18px;
    border-radius: 17px;
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
    border-radius: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 1.6s;
  }
}
</style>
