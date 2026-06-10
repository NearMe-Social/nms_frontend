<template>
  <div>
    <Navbar />
    <div class="flex min-w-0">
      <AppSidebar class="hidden md:flex" />

      <div class="settings-page">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage your account, security and privacy preferences.</p>
        </div>

        <div class="settings-layout">
          <!-- Sub sidebar -->
          <aside class="settings-sidebar">
            <nav class="sidebar-nav">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="sidebar-tab"
                :class="{ active: activeTab === tab.key, disabled: !tab.enabled }"
                :disabled="!tab.enabled"
                @click="tab.enabled && (activeTab = tab.key)"
              >
                <component :is="tab.icon" :size="17" />
                <span>{{ tab.label }}</span>
                <span v-if="!tab.enabled" class="coming-soon">Soon</span>
              </button>
            </nav>
          </aside>

          <!-- Main content -->
          <div class="settings-content">
            <!-- ── PROFILE TAB ── -->
            <div v-if="activeTab === 'profile'">
              <form @submit.prevent="handleSaveProfile" class="profile-form">
                <div class="form-layout">
                  <!-- Photo sidebar -->
                  <aside class="form-sidebar">
                    <div class="profile-photo-card">
                      <div class="photo-section">
                        <UserAvatar
                          :src="photoPreview"
                          :username="profileForm.username || authStore.user?.username"
                          alt="Profile picture"
                          class="settings-avatar"
                        />
                      </div>
                      <button type="button" class="photo-change-btn" @click="triggerFileInput">
                        <UploadCloudIcon :size="16" /> Change Photo
                      </button>
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handlePhotoUpload"
                      />
                      <p class="photo-hint">PNG, JPG up to 5MB</p>
                    </div>
                  </aside>

                  <!-- Profile fields -->
                  <div class="form-content">
                    <section class="settings-section">
                      <div class="section-header">
                        <UserIcon :size="18" />
                        <h2 class="section-title">Public Identity</h2>
                      </div>
                      <div class="form-row">
                        <div class="form-group">
                          <label class="form-label">Full Name</label>
                          <input
                            v-model="profileForm.first_name"
                            type="text"
                            class="form-input"
                            placeholder="Your name"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Username</label>
                          <input
                            v-model="profileForm.username"
                            type="text"
                            class="form-input"
                            placeholder="@username"
                            disabled
                          />
                        </div>
                      </div>
                      <div class="form-group">
                        <label class="form-label">Bio</label>
                        <textarea
                          v-model="profileForm.bio"
                          class="form-textarea"
                          rows="3"
                          placeholder="Tell people about yourself..."
                        />
                        <div class="char-count">{{ profileForm.bio?.length || 0 }} / 500</div>
                      </div>
                    </section>

                    <section class="settings-section">
                      <div class="section-header">
                        <MapPinIcon :size="18" />
                        <h2 class="section-title">Presence</h2>
                      </div>
                      <div class="form-row">
                        <div class="form-group">
                          <label class="form-label">Location</label>
                          <input
                            v-model="profileForm.location"
                            type="text"
                            class="form-input"
                            placeholder="City, Country"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Website</label>
                          <input
                            v-model="profileForm.website"
                            type="url"
                            class="form-input"
                            placeholder="https://yoursite.com"
                          />
                        </div>
                      </div>
                    </section>

                    <div class="form-actions">
                      <button type="button" class="btn-cancel" @click="$router.back()">
                        Cancel
                      </button>
                      <button type="submit" class="btn-save" :disabled="isSavingProfile">
                        <span v-if="isSavingProfile" class="btn-loading"
                          ><LoaderIcon :size="16" class="spinner" /> Saving...</span
                        >
                        <span v-else><CheckIcon :size="16" /> Save Changes</span>
                      </button>
                    </div>

                    <div v-if="profileSuccess" class="alert alert-success">
                      <CheckIcon :size="16" /> {{ profileSuccess }}
                    </div>
                    <div v-if="profileError" class="alert alert-error">
                      <AlertCircleIcon :size="16" /> {{ profileError }}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- ── SECURITY & PRIVACY TAB ── -->
            <div v-else-if="activeTab === 'security'">
              <!-- Change Password -->
              <section class="settings-section">
                <div class="section-header">
                  <LockIcon :size="18" />
                  <h2 class="section-title">Change Password</h2>
                </div>
                <form @submit.prevent="handleChangePassword" class="form-content">
                  <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <div class="input-wrapper">
                      <input
                        v-model="passwordForm.current"
                        :type="showCurrent ? 'text' : 'password'"
                        class="form-input"
                        placeholder="Enter current password"
                      />
                      <button type="button" class="eye-btn" @click="showCurrent = !showCurrent">
                        <EyeOffIcon v-if="showCurrent" :size="16" /><EyeIcon v-else :size="16" />
                      </button>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">New Password</label>
                      <div class="input-wrapper">
                        <input
                          v-model="passwordForm.new"
                          :type="showNew ? 'text' : 'password'"
                          class="form-input"
                          placeholder="Min. 8 characters"
                        />
                        <button type="button" class="eye-btn" @click="showNew = !showNew">
                          <EyeOffIcon v-if="showNew" :size="16" /><EyeIcon v-else :size="16" />
                        </button>
                      </div>
                      <div class="strength-bar-wrap" v-if="passwordForm.new">
                        <div class="strength-bar">
                          <div
                            class="strength-fill"
                            :style="{ width: strength.pct + '%' }"
                            :class="strength.color"
                          ></div>
                        </div>
                        <span class="strength-label" :class="strength.textColor">{{
                          strength.label
                        }}</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Confirm New Password</label>
                      <div class="input-wrapper">
                        <input
                          v-model="passwordForm.confirm"
                          :type="showConfirm ? 'text' : 'password'"
                          class="form-input"
                          :class="{
                            'input-error':
                              passwordForm.confirm && passwordForm.new !== passwordForm.confirm,
                          }"
                          placeholder="Repeat new password"
                        />
                        <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
                          <EyeOffIcon v-if="showConfirm" :size="16" /><EyeIcon v-else :size="16" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn-save" :disabled="pwSaving">
                      <span v-if="pwSaving" class="btn-loading"
                        ><LoaderIcon :size="16" class="spinner" /> Saving...</span
                      >
                      <span v-else><CheckIcon :size="16" /> Update Password</span>
                    </button>
                  </div>
                  <div v-if="pwSuccess" class="alert alert-success">
                    <CheckIcon :size="16" /> {{ pwSuccess }}
                  </div>
                  <div v-if="pwError" class="alert alert-error">
                    <AlertCircleIcon :size="16" /> {{ pwError }}
                  </div>
                </form>
              </section>

              <!-- Privacy -->
              <section class="settings-section">
                <div class="section-header">
                  <ShieldIcon :size="18" />
                  <h2 class="section-title">Privacy</h2>
                </div>
                <div class="toggle-list">
                  <div class="toggle-item" v-for="item in privacyToggles" :key="item.key">
                    <div class="toggle-info">
                      <p class="toggle-title">{{ item.label }}</p>
                      <p class="toggle-desc">{{ item.desc }}</p>
                    </div>
                    <button
                      type="button"
                      class="toggle-btn"
                      :class="{ on: item.value }"
                      @click="item.value = !item.value"
                    >
                      <span class="toggle-knob"></span>
                    </button>
                  </div>
                </div>
                <div class="form-actions mt-4">
                  <button class="btn-save" @click="savePrivacy">
                    <CheckIcon :size="16" /> Save Privacy Settings
                  </button>
                </div>
              </section>

              <!-- Blocked Users -->
              <section class="settings-section">
                <div class="section-header">
                  <UserXIcon :size="18" />
                  <h2 class="section-title">Blocked Users</h2>
                </div>
                <p class="section-desc">
                  Users you have blocked cannot see your posts or message you.
                </p>
                <div class="blocked-list">
                  <div v-for="u in blockedUsers" :key="u.id" class="blocked-item">
                    <div class="blocked-avatar">{{ initials(u.username) }}</div>
                    <div class="blocked-info">
                      <p class="blocked-name">{{ u.username }}</p>
                      <p class="blocked-since">Blocked {{ u.since }}</p>
                    </div>
                    <button class="btn-unblock" @click="unblock(u.id)">Unblock</button>
                  </div>
                  <p v-if="blockedUsers.length === 0" class="empty-blocked">
                    You haven't blocked anyone.
                  </p>
                </div>
              </section>

              <!-- Danger Zone -->
              <section class="settings-section danger-section">
                <div class="section-header">
                  <AlertTriangleIcon :size="18" />
                  <h2 class="section-title">Danger Zone</h2>
                </div>
                <div class="danger-item">
                  <div>
                    <p class="danger-title">Delete Account</p>
                    <p class="danger-desc">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                  </div>
                  <button class="btn-danger" @click="showDeleteModal = true">Delete Account</button>
                </div>
              </section>
            </div>

            <!-- ── PREFERENCES TAB (placeholder) ── -->
            <div v-else-if="activeTab === 'preferences'" class="placeholder-tab">
              <div class="placeholder-icon"><SlidersIcon :size="40" /></div>
              <p class="placeholder-title">Preferences</p>
              <p class="placeholder-desc">
                Theme, language, and notification preferences coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h3 class="modal-title">Delete Account</h3>
        <p class="modal-desc">
          This will permanently delete your account. Type <strong>DELETE</strong> to confirm.
        </p>
        <input v-model="deleteConfirm" type="text" class="form-input" placeholder="Type DELETE" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancel</button>
          <button
            class="btn-danger"
            :disabled="deleteConfirm !== 'DELETE'"
            @click="handleDeleteAccount"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserSettingsPage' })

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi, type UpdateProfilePayload } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import {
  User as UserIcon,
  MapPin as MapPinIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  UserX as UserXIcon,
  AlertTriangle as AlertTriangleIcon,
  Sliders as SlidersIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Check as CheckIcon,
  AlertCircle as AlertCircleIcon,
  Loader2 as LoaderIcon,
  UploadCloud as UploadCloudIcon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// ── Tabs ──────────────────────────────────────────────
const tabs = [
  { key: 'profile', label: 'Profile', icon: UserIcon, enabled: true },
  { key: 'security', label: 'Security & Privacy', icon: ShieldIcon, enabled: true },
  { key: 'preferences', label: 'Preferences', icon: SlidersIcon, enabled: false },
]
const activeTab = ref('profile')

// ── Profile tab ───────────────────────────────────────
const profileForm = ref({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  bio: '',
  location: '',
  website: '',
  profile_image: '',
})
const photoPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isSavingProfile = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

onMounted(async () => {
  try {
    const profile = await userApi.getProfile()
    profileForm.value = {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      profile_image: profile.profile_image || '',
    }
    if (profile.profile_image) photoPreview.value = profile.profile_image
  } catch {
    profileForm.value = {
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      email: 'test@test.com',
      bio: '',
      location: '',
      website: '',
      profile_image: '',
    }
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

async function handlePhotoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    profileError.value = 'File size must be less than 5MB'
    return
  }

  profileError.value = ''
  try {
    const response = await userApi.uploadProfileImage(file)
    photoPreview.value = response.url
    profileForm.value.profile_image = response.url
    authStore.updateProfile(response.user)
    profileSuccess.value = 'Photo uploaded successfully!'
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : 'Failed to upload photo'
  }
}

async function handleSaveProfile() {
  isSavingProfile.value = true
  profileSuccess.value = ''
  profileError.value = ''
  try {
    const payload: UpdateProfilePayload = {
      username: profileForm.value.username,
      bio: profileForm.value.bio,
    }
    const updatedProfile = await userApi.updateProfile(payload)
    authStore.updateProfile(updatedProfile)
    profileSuccess.value = 'Profile updated successfully!'
  } catch (err) {
    profileError.value = err instanceof Error ? err.message : 'Failed to save profile'
  } finally {
    isSavingProfile.value = false
  }
}

// ── Security tab ──────────────────────────────────────
const passwordForm = ref({ current: '', new: '', confirm: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const pwSaving = ref(false)
const pwSuccess = ref('')
const pwError = ref('')

const strength = computed(() => {
  const p = passwordForm.value.new
  if (!p) return { pct: 0, label: '', color: '', textColor: '' }
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const map = [
    { pct: 25, label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500' },
    { pct: 50, label: 'Fair', color: 'bg-orange-400', textColor: 'text-orange-500' },
    { pct: 75, label: 'Good', color: 'bg-yellow-400', textColor: 'text-yellow-600' },
    { pct: 100, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
  ]
  return map[score - 1] ?? map[0]
})

async function handleChangePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    pwError.value = 'Passwords do not match'
    return
  }
  pwSaving.value = true
  pwSuccess.value = ''
  pwError.value = ''
  try {
    await new Promise((r) => setTimeout(r, 800))
    pwSuccess.value = 'Password updated successfully!'
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (err) {
    pwError.value = err instanceof Error ? err.message : 'Failed to update password'
  } finally {
    pwSaving.value = false
  }
}

const privacyToggles = ref([
  {
    key: 'show_location',
    label: 'Show approximate location',
    desc: 'Others can see your general area',
    value: true,
  },
  {
    key: 'show_online',
    label: 'Show online status',
    desc: 'Others can see when you are active',
    value: true,
  },
  {
    key: 'allow_messages',
    label: 'Allow messages from anyone',
    desc: 'Receive messages from non-followers',
    value: false,
  },
])

function savePrivacy() {
  console.log('Privacy saved', privacyToggles.value)
}

const blockedUsers = ref<{ id: number; username: string; since: string }[]>([])
function unblock(id: number) {
  blockedUsers.value = blockedUsers.value.filter((u) => u.id !== id)
}
function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

const showDeleteModal = ref(false)
const deleteConfirm = ref('')
function handleDeleteAccount() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f4054;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  padding: 24px clamp(16px, 3vw, 32px) 40px;
}

.page-header {
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
  margin-bottom: 24px;
}
.page-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 850;
}
.page-subtitle {
  margin: 8px 0 0;
  color: #7890a2;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Layout */
.settings-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Sub sidebar */
.settings-sidebar {
  width: 220px;
  shrink: 0;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
  position: sticky;
  top: 20px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #4f687d;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  font-family: inherit;
}
.sidebar-tab:hover:not(.disabled) {
  background: #f0f5f8;
  color: #17364a;
}
.sidebar-tab.active {
  background: #e8f7f4;
  color: #0f8a7c;
}
.sidebar-tab.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.coming-soon {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  background: #f0f5f8;
  color: #7890a2;
  padding: 2px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Content area */
.settings-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Sections */
.settings-section {
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef3f7;
  color: #0e6378;
}
.section-title {
  margin: 0;
  color: #17364a;
  font-size: 1rem;
  font-weight: 850;
}
.section-desc {
  font-size: 13px;
  color: #7890a2;
  margin-bottom: 16px;
}

/* Profile form layout */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}
@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
  .settings-layout {
    flex-direction: column;
  }
  .settings-sidebar {
    width: 100%;
    position: static;
  }
}

/* Photo card */
.form-sidebar {
}
.profile-photo-card {
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.photo-section {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: #f0f5f8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dce7ee;
}
.settings-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0;
  font-size: clamp(3rem, 8vw, 5rem);
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7890a2;
}
.photo-change-btn {
  width: 100%;
  padding: 10px 16px;
  background: #0f8a7c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  font-family: inherit;
}
.photo-change-btn:hover {
  box-shadow: 0 4px 12px rgba(15, 138, 124, 0.3);
}
.photo-hint {
  font-size: 12px;
  color: #7890a2;
  margin: 0;
}

/* Form groups */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group:last-child {
  margin-bottom: 0;
}
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 850;
  color: #4f687d;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid #dce7ee;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: #17364a;
  background: #fff;
  transition: all 0.2s;
}
.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0f8a7c;
  box-shadow: 0 0 0 3px rgba(15, 138, 124, 0.08);
}
.form-input:disabled {
  background: #f0f5f8;
  color: #7890a2;
  cursor: not-allowed;
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
}
.char-count {
  font-size: 11px;
  color: #7890a2;
  margin-top: 6px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
.input-error {
  border-color: #ef4444 !important;
}

/* Password strength */
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.strength-bar {
  flex: 1;
  height: 4px;
  background: #eef3f7;
  border-radius: 4px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
.strength-label {
  font-size: 11px;
  font-weight: 700;
  min-width: 40px;
}

/* Input wrapper */
.input-wrapper {
  position: relative;
}
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #7890a2;
  padding: 0;
  display: flex;
}

/* Toggles */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #eef3f7;
}
.toggle-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.toggle-info {
}
.toggle-title {
  font-size: 14px;
  font-weight: 700;
  color: #17364a;
  margin: 0 0 3px;
}
.toggle-desc {
  font-size: 12px;
  color: #7890a2;
  margin: 0;
}
.toggle-btn {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #dce7ee;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
}
.toggle-btn.on {
  background: #0f8a7c;
}
.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.toggle-btn.on .toggle-knob {
  transform: translateX(20px);
}
.mt-4 {
  margin-top: 16px;
}

/* Blocked users */
.blocked-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.blocked-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fbff;
  border-radius: 10px;
}
.blocked-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0f8a7c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.blocked-info {
  flex: 1;
}
.blocked-name {
  font-size: 14px;
  font-weight: 700;
  color: #17364a;
  margin: 0 0 2px;
}
.blocked-since {
  font-size: 12px;
  color: #7890a2;
  margin: 0;
}
.btn-unblock {
  padding: 6px 14px;
  background: white;
  border: 1px solid #dce7ee;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4f687d;
  cursor: pointer;
  font-family: inherit;
}
.btn-unblock:hover {
  border-color: #0f8a7c;
  color: #0f8a7c;
}
.empty-blocked {
  font-size: 13px;
  color: #7890a2;
  text-align: center;
  padding: 20px 0;
}

/* Danger zone */
.danger-section {
  border-color: #fee2e2;
}
.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.danger-title {
  font-size: 14px;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 4px;
}
.danger-desc {
  font-size: 13px;
  color: #7890a2;
  margin: 0;
}
.btn-danger {
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Placeholder tab */
.placeholder-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  gap: 12px;
  text-align: center;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e3ebf2;
}
.placeholder-icon {
  color: #dce7ee;
}
.placeholder-title {
  font-size: 18px;
  font-weight: 700;
  color: #17364a;
  margin: 0;
}
.placeholder-desc {
  font-size: 13px;
  color: #7890a2;
  margin: 0;
  max-width: 260px;
  line-height: 1.6;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn-cancel {
  padding: 10px 20px;
  background: #f8fbff;
  color: #4f687d;
  border: 1px solid #dce7ee;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-save {
  padding: 10px 24px;
  background: #0f8a7c;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-save:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(15, 138, 124, 0.25);
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-loading {
  display: flex;
  align-items: center;
  gap: 7px;
}
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Alerts */
.alert {
  padding: 13px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  font-weight: 500;
}
.alert-success {
  background: rgba(0, 201, 177, 0.12);
  color: #00a896;
  border: 1px solid rgba(0, 201, 177, 0.25);
}
.alert-error {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 18px;
  padding: 28px;
  max-width: 400px;
  width: 90%;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 850;
  color: #dc2626;
  margin: 0 0 8px;
}
.modal-desc {
  font-size: 14px;
  color: #4f687d;
  margin: 0 0 16px;
  line-height: 1.6;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
