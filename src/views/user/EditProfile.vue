<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AtSign, Camera, Check, Info, LoaderCircle, Mail, UserRound } from 'lucide-vue-next'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import Navbar from '@/components/Navbar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { userApi, type UpdateProfilePayload } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/

const router = useRouter()
const auth = useAuthStore()
const form = ref({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  bio: '',
})
const initialForm = ref({ ...form.value })
const photoPreview = ref<string | null>(auth.user?.profile_image ?? null)
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingPhoto = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const usernameError = ref('')

const displayName = computed(() => {
  const name = `${form.value.first_name} ${form.value.last_name}`.trim()
  return name || form.value.username || 'Nearme Neighbor'
})
const hasChanges = computed(
  () =>
    form.value.first_name.trim() !== initialForm.value.first_name ||
    form.value.last_name.trim() !== initialForm.value.last_name ||
    form.value.username.trim() !== initialForm.value.username ||
    form.value.bio.trim() !== initialForm.value.bio,
)
const canSave = computed(
  () =>
    hasChanges.value &&
    !saving.value &&
    !uploadingPhoto.value &&
    form.value.first_name.trim().length > 0 &&
    form.value.last_name.trim().length > 0 &&
    form.value.username.trim().length >= 3 &&
    !usernameError.value,
)

onMounted(async () => {
  try {
    const profile = await userApi.getProfile()
    form.value = {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
    }
    initialForm.value = { ...form.value }
    photoPreview.value = profile.profile_image || null
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load your profile.'
  } finally {
    loading.value = false
  }
})

function validateUsername() {
  const value = form.value.username.trim()
  usernameError.value = ''

  if (value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters.'
  } else if (value.length > 20) {
    usernameError.value = 'Username must be 20 characters or fewer.'
  } else if (!USERNAME_PATTERN.test(value)) {
    usernameError.value = 'Use letters, numbers, underscores, and single dots between characters.'
  }
}

function openPhotoPicker() {
  fileInput.value?.click()
}

async function uploadPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  successMessage.value = ''
  errorMessage.value = ''

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    errorMessage.value = 'Choose a JPG, PNG, or WebP image.'
    return
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    errorMessage.value = 'Profile pictures must be 5 MB or smaller.'
    return
  }

  uploadingPhoto.value = true
  try {
    const uploaded = await userApi.uploadProfileImage(file)
    photoPreview.value = uploaded.url
    auth.updateProfile(uploaded.user)
    successMessage.value = 'Profile photo updated.'
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Profile photo could not be uploaded.'
  } finally {
    uploadingPhoto.value = false
  }
}

async function saveProfile() {
  validateUsername()
  if (!canSave.value) return

  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  const payload: UpdateProfilePayload = {
    first_name: form.value.first_name.trim(),
    last_name: form.value.last_name.trim(),
    username: form.value.username.trim(),
    bio: form.value.bio.trim(),
  }

  try {
    const updated = await userApi.updateProfile(payload)
    auth.updateProfile(updated)
    form.value = {
      first_name: updated.first_name || '',
      last_name: updated.last_name || '',
      username: updated.username || '',
      email: updated.email || form.value.email,
      bio: updated.bio || '',
    }
    initialForm.value = { ...form.value }
    successMessage.value = 'Profile changes saved.'
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Profile could not be saved.'
  } finally {
    saving.value = false
  }
}

function cancelEditing() {
  if (hasChanges.value) {
    form.value = { ...initialForm.value }
    usernameError.value = ''
    successMessage.value = ''
    errorMessage.value = ''
    return
  }

  router.back()
}
</script>

<template>
  <div class="edit-profile-page">
    <Navbar />

    <div class="profile-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <div>
            <p class="eyebrow">Public identity</p>
            <h1>Edit profile</h1>
            <p>Keep your name, username, photo, and introduction recognizable across Nearme.</p>
          </div>
          <span class="sync-badge"><Check /> Updates sync across the app</span>
        </header>

        <div v-if="loading" class="state-card">
          <LoaderCircle class="spinner" /> Loading your profile...
        </div>

        <form v-else class="editor-layout" @submit.prevent="saveProfile">
          <aside class="photo-card">
            <div class="photo-wrap">
              <UserAvatar
                :src="photoPreview"
                :username="form.username || auth.user?.username"
                :alt="`${displayName} profile`"
                class="profile-photo"
              />
              <button
                type="button"
                class="photo-overlay"
                :disabled="uploadingPhoto"
                aria-label="Choose a new profile photo"
                @click="openPhotoPicker"
              >
                <LoaderCircle v-if="uploadingPhoto" class="spinner" />
                <Camera v-else />
                <span>{{ uploadingPhoto ? 'Uploading...' : 'Change photo' }}</span>
              </button>
            </div>
            <input
              ref="fileInput"
              class="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="uploadPhoto"
            />

            <div class="photo-identity">
              <strong>{{ displayName }}</strong>
              <span>@{{ form.username || 'username' }}</span>
            </div>
            <p>JPG, PNG, or WebP. Maximum 5 MB.</p>
          </aside>

          <section class="form-panel">
            <div class="panel-heading">
              <span class="panel-icon"><UserRound /></span>
              <div>
                <p class="panel-label">Profile details</p>
                <h2>How neighbors recognize you</h2>
              </div>
            </div>

            <div class="form-grid">
              <label>
                <span>First name</span>
                <input
                  v-model="form.first_name"
                  type="text"
                  maxlength="50"
                  autocomplete="given-name"
                  required
                />
              </label>

              <label>
                <span>Last name</span>
                <input
                  v-model="form.last_name"
                  type="text"
                  maxlength="50"
                  autocomplete="family-name"
                  required
                />
              </label>
            </div>

            <label>
              <span>Username</span>
              <div class="input-with-icon" :class="{ invalid: usernameError }">
                <AtSign />
                <input
                  v-model="form.username"
                  type="text"
                  minlength="3"
                  maxlength="20"
                  autocomplete="username"
                  required
                  @input="validateUsername"
                />
              </div>
              <small v-if="usernameError" class="field-error">{{ usernameError }}</small>
              <small v-else>Letters, numbers, underscores, and dots are supported.</small>
            </label>

            <label>
              <span>Email address</span>
              <div class="input-with-icon readonly">
                <Mail />
                <input :value="form.email" type="email" disabled />
              </div>
              <small>Your login email cannot be changed from the profile editor.</small>
            </label>

            <label>
              <span>Bio</span>
              <textarea
                v-model="form.bio"
                rows="5"
                maxlength="160"
                placeholder="Share a short introduction for your local community."
              ></textarea>
              <small class="bio-count">{{ form.bio.length }} / 160</small>
            </label>

            <div class="profile-note">
              <Info />
              <p>
                These fields are saved to your account and appear consistently on your profile,
                posts, search results, and nearby identity.
              </p>
            </div>

            <p v-if="successMessage" class="alert alert-success"><Check /> {{ successMessage }}</p>
            <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="cancelEditing">
                {{ hasChanges ? 'Reset changes' : 'Back' }}
              </button>
              <button type="submit" class="save-button" :disabled="!canSave">
                <LoaderCircle v-if="saving" class="spinner" />
                <Check v-else />
                {{ saving ? 'Saving...' : 'Save profile' }}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>

    <MobileBottomNav />
  </div>
</template>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #20384a;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.profile-shell {
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

.sync-badge {
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

.sync-badge svg,
.save-button svg,
.profile-note svg,
.alert svg {
  width: 16px;
  height: 16px;
}

.state-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e1eaf1;
  border-radius: 18px;
  background: #fff;
  color: #718899;
  font-size: 0.82rem;
}

.editor-layout {
  max-width: 1030px;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  align-items: start;
  gap: 22px;
}

.photo-card,
.form-panel {
  border: 1px solid #e1eaf1;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(42, 67, 83, 0.05);
}

.photo-card {
  position: sticky;
  top: 82px;
  padding: 20px;
  text-align: center;
}

.photo-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 18px;
  background: #edf4f6;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 0;
  font-size: 4rem;
}

.photo-overlay {
  position: absolute;
  inset: auto 12px 12px;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  background: rgba(16, 50, 65, 0.82);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.photo-overlay svg {
  width: 17px;
  height: 17px;
}

.photo-overlay:disabled {
  cursor: wait;
  opacity: 0.75;
}

.photo-identity {
  margin-top: 16px;
  display: grid;
  gap: 3px;
}

.photo-identity strong {
  color: #244759;
  font-size: 0.94rem;
}

.photo-identity span,
.photo-card > p {
  color: #738a9a;
  font-size: 0.72rem;
}

.photo-identity span {
  color: #168278;
  font-weight: 700;
}

.photo-card > p {
  margin: 12px 0 0;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.form-panel {
  padding: 24px;
}

.panel-heading {
  margin-bottom: 24px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e9eff3;
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

.panel-heading h2 {
  margin: 4px 0 0;
  color: #193a4c;
  font-size: 1rem;
  font-weight: 850;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-panel > label,
.form-grid label {
  display: block;
  margin-bottom: 18px;
}

.form-panel label > span {
  margin-bottom: 7px;
  display: block;
  color: #3d596b;
  font-size: 0.75rem;
  font-weight: 800;
}

.form-panel input,
.form-panel textarea,
.input-with-icon {
  width: 100%;
  border: 1px solid #dce6ed;
  border-radius: 12px;
  background: #f8fafb;
  color: #233f51;
  font: inherit;
  font-size: 0.86rem;
}

.form-panel input {
  min-height: 48px;
  padding: 0 13px;
  outline: 0;
}

.form-panel textarea {
  min-height: 130px;
  padding: 13px;
  outline: 0;
  resize: vertical;
  line-height: 1.6;
}

.form-panel input:focus,
.form-panel textarea:focus,
.input-with-icon:focus-within {
  border-color: #59aaa4;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(19, 134, 125, 0.09);
}

.input-with-icon {
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.input-with-icon svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  color: #8496a3;
}

.input-with-icon input {
  border: 0;
  background: transparent;
  box-shadow: none;
}

.input-with-icon.invalid {
  border-color: #e9a6a6;
}

.input-with-icon.readonly {
  background: #f0f4f6;
}

.form-panel input:disabled {
  cursor: not-allowed;
  color: #738a9a;
}

.form-panel small {
  margin-top: 6px;
  display: block;
  color: #8294a2;
  font-size: 0.68rem;
  line-height: 1.45;
}

.form-panel .field-error {
  color: #b84e4e;
}

.bio-count {
  text-align: right;
}

.profile-note {
  padding: 12px 13px;
  display: flex;
  align-items: flex-start;
  gap: 9px;
  border: 1px solid #dcecea;
  border-radius: 12px;
  background: #f3f9f9;
  color: #34747a;
}

.profile-note svg {
  flex: 0 0 auto;
  margin-top: 1px;
}

.profile-note p {
  margin: 0;
  color: #66808f;
  font-size: 0.72rem;
  line-height: 1.55;
}

.alert {
  margin: 14px 0 0;
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

.form-actions {
  margin-top: 22px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button,
.save-button {
  min-height: 43px;
  padding: 0 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
}

.cancel-button {
  border: 1px solid #dce6ed;
  background: #f8fafb;
  color: #526d7f;
}

.save-button {
  min-width: 135px;
  border: 0;
  background: #13867d;
  color: #fff;
  box-shadow: 0 8px 18px rgba(19, 134, 125, 0.18);
}

.save-button:disabled {
  cursor: not-allowed;
  background: #d7e1e6;
  color: #91a1ac;
  box-shadow: none;
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
  .editor-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .edit-profile-page {
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

  .sync-badge {
    font-size: 0.68rem;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }

  .photo-card {
    position: static;
  }

  .photo-wrap {
    max-width: 240px;
    margin-inline: auto;
  }
}

@media (max-width: 520px) {
  .workspace {
    padding-inline: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-panel {
    padding: 18px;
    border-radius: 17px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 1.6s;
  }
}
</style>
