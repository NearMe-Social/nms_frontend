<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LogOut,
  MapPin,
  MapPinOff,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Unlock,
  UserRound,
} from 'lucide-vue-next'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import Navbar from '@/components/Navbar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { authApi, blockApi, userApi, type BlockedUser, type UserProfile } from '@/services/api'
import { stopGeolocationTracking, useGeolocation } from '@/composables/useGeolocation'
import { useAuthStore } from '@/stores/auth'
import { clearNearbyPresence } from '@/utils/nearbyPresence'

defineOptions({ name: 'UserSettings' })

type SettingsTab = 'account' | 'security' | 'privacy'
type BrowserLocationPermission = 'checking' | 'granted' | 'prompt' | 'denied' | 'unsupported'

const router = useRouter()
const auth = useAuthStore()
const geo = useGeolocation()
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
const updatingLocation = ref(false)
const clearingLocation = ref(false)
const privacySuccess = ref('')
const privacyError = ref('')
const blockedUsers = ref<BlockedUser[]>([])
const loadingBlockedUsers = ref(false)
const unblockingUserId = ref<number | null>(null)
const blockSuccess = ref('')
const blockError = ref('')
const locationPermission = ref<BrowserLocationPermission>('checking')
let locationPermissionStatus: PermissionStatus | null = null
let privacyMessageTimeout: number | null = null

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
const hasProfilePhoto = computed(() => Boolean(profileImage.value))
const profileCompleted = computed(() => Boolean(profile.value?.profile_completed))
const onboardingCompleted = computed(() => Boolean(profile.value?.onboarding_completed))
const hasSavedLocation = computed(
  () => profile.value?.current_latitude != null && profile.value?.current_longitude != null,
)
const locationUpdatedLabel = computed(() => {
  const updatedAt = profile.value?.location_updated_at
  if (!updatedAt) return 'Not saved yet'

  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return 'Saved recently'

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
const permissionSummary = computed(() => {
  switch (locationPermission.value) {
    case 'granted':
      return {
        label: 'Allowed',
        detail: 'This browser can update your nearby location when you ask it to.',
      }
    case 'prompt':
      return {
        label: 'Ask first',
        detail: 'The browser will ask for permission when a nearby feature needs location.',
      }
    case 'denied':
      return {
        label: 'Blocked',
        detail: 'Location is blocked in this browser. Change site settings to use nearby features.',
      }
    case 'unsupported':
      return {
        label: 'Unavailable',
        detail: 'This browser or connection cannot provide location access.',
      }
    default:
      return {
        label: 'Checking',
        detail: 'Reading this browser location permission...',
      }
  }
})
const accountChecklist = computed(() => [
  {
    label: 'Profile details',
    complete: profileCompleted.value,
    detail: profileCompleted.value ? 'Ready for nearby discovery' : 'Finish username and profile setup',
  },
  {
    label: 'Onboarding',
    complete: onboardingCompleted.value,
    detail: onboardingCompleted.value ? 'Intro flow completed' : 'Permission and profile steps still need attention',
  },
  {
    label: 'Profile photo',
    complete: hasProfilePhoto.value,
    detail: hasProfilePhoto.value ? 'Avatar is visible across the app' : 'Using generated initials for now',
  },
])
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

onMounted(() => {
  void loadProfile()
  void loadBlockedUsers()
  void checkBrowserPermission()
})

onBeforeUnmount(() => {
  if (locationPermissionStatus) {
    locationPermissionStatus.onchange = null
  }
  if (privacyMessageTimeout !== null) {
    window.clearTimeout(privacyMessageTimeout)
  }
})

async function loadProfile() {
  loadingProfile.value = true
  profileError.value = ''
  try {
    profile.value = await userApi.getProfile()
  } catch (error: unknown) {
    profileError.value = error instanceof Error ? error.message : 'Could not load account details.'
  } finally {
    loadingProfile.value = false
  }
}

async function loadBlockedUsers() {
  loadingBlockedUsers.value = true
  blockError.value = ''

  try {
    blockedUsers.value = await blockApi.listMine()
  } catch (error: unknown) {
    blockError.value =
      error instanceof Error ? error.message : 'Could not load blocked users.'
  } finally {
    loadingBlockedUsers.value = false
  }
}

function blockedDisplayName(user: BlockedUser) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return name || user.username
}

function blockedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Blocked recently'

  return `Blocked ${date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

async function unblockUser(user: BlockedUser) {
  blockSuccess.value = ''
  blockError.value = ''
  unblockingUserId.value = user.blocked_user_id

  try {
    const response = await blockApi.unblock(user.blocked_user_id)
    blockedUsers.value = blockedUsers.value.filter(
      (blocked) => blocked.blocked_user_id !== user.blocked_user_id,
    )
    blockSuccess.value = response.message
  } catch (error: unknown) {
    blockError.value =
      error instanceof Error ? error.message : 'Could not unblock this user.'
  } finally {
    unblockingUserId.value = null
  }
}

function setPermissionState(state: PermissionState) {
  locationPermission.value = state === 'granted' || state === 'denied' ? state : 'prompt'
}

async function checkBrowserPermission() {
  if (!navigator.geolocation || window.isSecureContext === false) {
    locationPermission.value = 'unsupported'
    return
  }

  if (!navigator.permissions?.query) {
    locationPermission.value = 'prompt'
    return
  }

  try {
    locationPermissionStatus = await navigator.permissions.query({
      name: 'geolocation' as PermissionName,
    })
    setPermissionState(locationPermissionStatus.state)
    locationPermissionStatus.onchange = () => {
      if (locationPermissionStatus) setPermissionState(locationPermissionStatus.state)
    }
  } catch {
    locationPermission.value = 'prompt'
  }
}

async function updateSavedLocation() {
  clearPrivacyMessage()
  updatingLocation.value = true

  try {
    const position = await geo.request({ forceRefresh: true })
    if (!position) {
      throw new Error(geo.errorMessage.value || 'Could not read your current location.')
    }

    await userApi.updateLocation(position.lat, position.lng)
    if (profile.value) {
      profile.value = {
        ...profile.value,
        current_latitude: position.lat,
        current_longitude: position.lng,
        location_updated_at: new Date().toISOString(),
      }
    }
    showPrivacyMessage(
      'success',
      'Saved location updated. Nearby pages also refresh location in the background when you use them.',
    )
    await checkBrowserPermission()
  } catch (error: unknown) {
    showPrivacyMessage(
      'error',
      error instanceof Error ? error.message : 'Saved location could not be updated.',
    )
  } finally {
    updatingLocation.value = false
  }
}

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
  clearPrivacyMessage()
  clearingLocation.value = true

  try {
    const response = await userApi.clearLocation()
    stopGeolocationTracking(true)
    if (profile.value) {
      profile.value = {
        ...profile.value,
        current_latitude: null,
        current_longitude: null,
        location_updated_at: null,
      }
    }
    showPrivacyMessage(
      'success',
      `${response.message} Nearby features will ask for location again when needed.`,
    )
  } catch (error: unknown) {
    showPrivacyMessage(
      'error',
      error instanceof Error ? error.message : 'Saved location could not be cleared.',
    )
  } finally {
    clearingLocation.value = false
  }
}

function clearPrivacyMessage() {
  privacySuccess.value = ''
  privacyError.value = ''
  if (privacyMessageTimeout !== null) {
    window.clearTimeout(privacyMessageTimeout)
    privacyMessageTimeout = null
  }
}

function showPrivacyMessage(type: 'success' | 'error', message: string) {
  clearPrivacyMessage()
  if (type === 'success') {
    privacySuccess.value = message
  } else {
    privacyError.value = message
  }

  privacyMessageTimeout = window.setTimeout(() => {
    privacySuccess.value = ''
    privacyError.value = ''
    privacyMessageTimeout = null
  }, 3000)
}

async function signOut() {
  clearNearbyPresence()
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

              <article class="panel account-health-panel">
                <div class="panel-heading">
                  <span class="panel-icon"><BadgeCheck /></span>
                  <div>
                    <p class="panel-label">Account readiness</p>
                    <h2>Make sure your profile feels complete</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  These checks use your real account data, so you can quickly see what still needs
                  attention before classmates find you nearby.
                </p>

                <div class="settings-metrics" aria-label="Account readiness summary">
                  <div>
                    <strong>{{ profile?.role || auth.user?.role || 'USER' }}</strong>
                    <span>Account role</span>
                  </div>
                  <div>
                    <strong>{{ hasSavedLocation ? 'Saved' : 'Empty' }}</strong>
                    <span>Location status</span>
                  </div>
                </div>

                <div class="readiness-list">
                  <div
                    v-for="item in accountChecklist"
                    :key="item.label"
                    :class="{ complete: item.complete }"
                  >
                    <span><Check v-if="item.complete" /><Clock3 v-else /></span>
                    <p>
                      <strong>{{ item.label }}</strong>
                      {{ item.detail }}
                    </p>
                  </div>
                </div>

                <div class="panel-actions">
                  <RouterLink to="/profile/edit" class="secondary-link">
                    Complete profile <ArrowRight />
                  </RouterLink>
                  <button
                    type="button"
                    class="secondary-button"
                    :disabled="loadingProfile"
                    @click="loadProfile"
                  >
                    <LoaderCircle v-if="loadingProfile" class="spinner" />
                    <RefreshCw v-else />
                    Refresh details
                  </button>
                </div>
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
              <div class="settings-section-heading">
                <span>Privacy explanation</span>
                <p>What other people can see and what Nearme keeps hidden.</p>
              </div>

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

                <div class="privacy-note-card">
                  <p class="panel-label">What Nearme stores</p>
                  <p>
                    Your account keeps the latest latitude, longitude, and update time so nearby
                    users and posts can be matched. Other people only see approximate distance.
                  </p>
                </div>
              </article>

              <div class="settings-section-heading">
                <span>Location controls</span>
                <p>
                  Nearby Feed and Nearby Users refresh location in the background. These controls
                  are only for manually checking, updating, or clearing your saved account location.
                </p>
              </div>

              <article class="panel location-access-panel">
                <div class="panel-heading">
                  <span class="panel-icon"><MapPin /></span>
                  <div>
                    <p class="panel-label">Location</p>
                    <h2>Browser location permission</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Check whether this browser can share location. Use the update button only when you
                  want to immediately refresh the saved location on your account.
                </p>

                <div class="location-status">
                  <div :class="{ blocked: locationPermission === 'denied' }">
                    <span class="status-icon"><MapPin /></span>
                    <p>
                      <strong>{{ permissionSummary.label }}</strong>
                      <span>{{ permissionSummary.detail }}</span>
                    </p>
                  </div>
                </div>

                <div class="panel-actions">
                  <button
                    type="button"
                    class="primary-button"
                    :disabled="updatingLocation || locationPermission === 'unsupported'"
                    @click="updateSavedLocation"
                  >
                    <LoaderCircle v-if="updatingLocation" class="spinner" />
                    <RefreshCw v-else />
                    {{ updatingLocation ? 'Updating...' : 'Update saved location' }}
                  </button>
                  <button type="button" class="secondary-button" @click="checkBrowserPermission">
                    <RefreshCw /> Recheck permission
                  </button>
                </div>
              </article>

              <article class="panel clear-location-panel">
                <div class="panel-heading">
                  <span class="panel-icon panel-icon-warn"><MapPinOff /></span>
                  <div>
                    <p class="panel-label">Location</p>
                    <h2>Clear location activity</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Removes the last saved location from your account and clears this browser's cached
                  coordinates. It does not disable location forever; nearby pages can ask again when
                  you open them.
                </p>

                <div class="location-status">
                  <div>
                    <span class="status-icon"><MapPin /></span>
                    <p>
                      <strong>
                        {{ hasSavedLocation ? 'Location currently saved' : 'No saved location' }}
                      </strong>
                      <span>Last update: {{ locationUpdatedLabel }}</span>
                    </p>
                  </div>
                </div>

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

              <div class="settings-section-heading">
                <span>Privacy controls</span>
                <p>Review people you blocked and restore access when you choose.</p>
              </div>

              <article class="panel blocked-users-panel">
                <div class="panel-heading">
                  <span class="panel-icon panel-icon-danger"><Ban /></span>
                  <div>
                    <p class="panel-label">Blocked users</p>
                    <h2>People you have blocked</h2>
                  </div>
                </div>
                <p class="panel-copy">
                  Blocking is saved to your account. You can review blocked people here and unblock
                  them when you are ready.
                </p>

                <p v-if="blockSuccess" class="alert alert-success">
                  <Check /> {{ blockSuccess }}
                </p>
                <p v-if="blockError" class="alert alert-error">{{ blockError }}</p>

                <div v-if="loadingBlockedUsers" class="state-message blocked-state">
                  <LoaderCircle class="spinner" /> Loading blocked users...
                </div>
                <div v-else-if="blockedUsers.length === 0" class="blocked-empty">
                  <Ban />
                  <p>
                    <strong>No blocked users</strong>
                    <span>People you block from profile or post menus will appear here.</span>
                  </p>
                </div>
                <div v-else class="blocked-list">
                  <div v-for="user in blockedUsers" :key="user.user_block_id" class="blocked-item">
                    <RouterLink :to="`/users/${user.blocked_user_id}`" class="blocked-person">
                      <UserAvatar
                        :src="user.profile_image"
                        :username="user.username"
                        :alt="`${user.username} profile`"
                        class="blocked-avatar"
                      />
                      <span>
                        <strong>{{ blockedDisplayName(user) }}</strong>
                        <small>@{{ user.username }} · {{ blockedDate(user.created_at) }}</small>
                      </span>
                    </RouterLink>
                    <button
                      type="button"
                      class="secondary-button unblock-button"
                      :disabled="unblockingUserId === user.blocked_user_id"
                      @click="unblockUser(user)"
                    >
                      <LoaderCircle
                        v-if="unblockingUserId === user.blocked_user_id"
                        class="spinner"
                      />
                      <Unlock v-else />
                      {{ unblockingUserId === user.blocked_user_id ? 'Unblocking...' : 'Unblock' }}
                    </button>
                  </div>
                </div>
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

.settings-section-heading {
  margin: 8px 2px -2px;
}

.settings-section-heading span {
  display: block;
  color: #0f8179;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.settings-section-heading p {
  max-width: 720px;
  margin: 5px 0 0;
  color: #718899;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.55;
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

.account-health-panel {
  background:
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.1), transparent 34%),
    #fff;
}

.settings-metrics {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-metrics > div {
  min-height: 72px;
  padding: 13px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #e1eaf1;
  border-radius: 15px;
  background: rgba(248, 251, 252, 0.86);
}

.settings-metrics strong {
  color: #0f172a;
  font-size: clamp(1.15rem, 2vw, 1.6rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
}

.settings-metrics span {
  margin-top: 5px;
  color: #718899;
  font-size: 0.72rem;
  font-weight: 800;
}

.panel-actions {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.panel-actions .secondary-link,
.panel-actions .secondary-button {
  margin-top: 0;
}

.readiness-list {
  margin-top: 14px;
  display: grid;
  gap: 9px;
}

.readiness-list > div,
.location-status > div {
  padding: 12px 13px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid #e5edf2;
  border-radius: 13px;
  background: #f8fbfc;
}

.readiness-list > div.complete {
  border-color: #d2ebe5;
  background: #f1faf7;
}

.location-status > div.blocked {
  border-color: #f1cccc;
  background: #fff7f7;
}

.location-status > div.blocked .status-icon {
  background: #fee2e2;
  color: #b84e4e;
}

.readiness-list > div > span,
.status-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #e8f5f2;
  color: #168278;
}

.readiness-list svg,
.status-icon svg {
  width: 15px;
  height: 15px;
}

.readiness-list p,
.location-status p {
  margin: 0;
  color: #718899;
  font-size: 0.76rem;
  line-height: 1.55;
}

.readiness-list strong,
.location-status strong {
  display: block;
  color: #315467;
}

.privacy-note-card {
  margin-top: 16px;
  padding: 15px 16px;
  border: 1px solid #d8ebe8;
  border-radius: 15px;
  background: #f1faf8;
}

.privacy-note-card p:last-child {
  margin: 8px 0 0;
  color: #5e7b8d;
  font-size: 0.78rem;
  line-height: 1.65;
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
.secondary-button:disabled,
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
  border-color: #d7ebe7;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.09), transparent 32%),
    #fff;
}

.panel-icon-warn {
  background: #eaf7f5;
  color: #187970;
}

.panel-icon-danger {
  background: #fee9e9;
  color: #bd3f3f;
}

.warning-button {
  margin-top: 18px;
  border: 1px solid #cfe7e3;
  background: #f2fbf9;
  color: #187970;
}

.warning-button:hover:not(:disabled) {
  background: #e5f6f3;
  border-color: #b8ddd7;
}

.location-status {
  margin-top: 16px;
}

.location-status p span {
  display: block;
  margin-top: 2px;
}

.blocked-users-panel {
  background:
    radial-gradient(circle at top right, rgba(248, 113, 113, 0.08), transparent 30%),
    #fff;
}

.blocked-state {
  margin-top: 16px;
}

.blocked-empty {
  margin-top: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px dashed #dce7ee;
  border-radius: 16px;
  background: #f8fbfc;
  color: #718899;
}

.blocked-empty > svg {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  padding: 8px;
  border-radius: 12px;
  background: #edf6f5;
  color: #187970;
}

.blocked-empty p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
}

.blocked-empty strong,
.blocked-empty span {
  display: block;
}

.blocked-empty strong {
  color: #20384a;
}

.blocked-list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.blocked-item {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #e5edf2;
  border-radius: 16px;
  background: #f8fbfc;
}

.blocked-person {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.blocked-avatar {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 15px;
}

.blocked-person span {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.blocked-person strong {
  color: #20384a;
  font-size: 0.86rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blocked-person small {
  color: #7c93a4;
  font-size: 0.72rem;
  font-weight: 750;
}

.unblock-button {
  margin: 0;
  flex: 0 0 auto;
  color: #187970;
}

.unblock-button svg {
  width: 15px;
  height: 15px;
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
  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .panel-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .panel-actions .secondary-link,
  .panel-actions .secondary-button {
    width: 100%;
  }

  .blocked-item {
    align-items: stretch;
    flex-direction: column;
  }

  .unblock-button {
    width: 100%;
    justify-content: center;
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
