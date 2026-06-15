<template>
  <AuthPageShell
    eyebrow="Personalize your account"
    title="Make your place in the neighborhood."
    description="Choose how people will recognize you. You can update these details again from your profile settings."
  >
    <template #header-action>
      <button type="button" class="skip-btn" :disabled="isLoading" @click="handleSkip">
        {{ isLoading ? 'Please wait...' : 'Skip' }}
      </button>
    </template>

    <section class="profile-card">
      <div class="profile-content">
        <h2 class="profile-title">Select your profile</h2>
        <p class="profile-subtitle">Set up your identity to connect with the local community.</p>

        <div class="avatar-section">
          <button
            type="button"
            class="avatar-picker"
            :disabled="isLoading"
            aria-label="Choose a profile picture"
            @click="openImagePicker"
          >
            <UserAvatar
              :src="avatarPreview"
              :username="username || auth.user?.username"
              alt="Profile picture preview"
              class="avatar-image"
            />
            <span class="avatar-overlay" aria-hidden="true">
              <span class="upload-icon"><Camera :size="20" /></span>
              <span>Choose photo</span>
            </span>
          </button>
          <input
            ref="imageInput"
            class="visually-hidden"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            @change="handleImageSelected"
          />
          <p class="avatar-help">
            {{ selectedImage ? selectedImage.name : 'Optional · JPG, PNG, or WebP · Max 5 MB' }}
          </p>
          <p v-if="imageError" class="error-text avatar-error">{{ imageError }}</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">USERNAME</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="username"
                placeholder="Select a unique username"
                v-model="username"
                required
                minlength="3"
                maxlength="20"
                autocomplete="username"
                @input="validateUsername"
              />
              <span class="input-suffix">@</span>
            </div>
            <p v-if="usernameError" class="error-text">{{ usernameError }}</p>
          </div>

          <div class="pro-tip">
            <div class="pro-tip-header">
              <svg viewBox="0 0 24 24" fill="currentColor" class="pro-tip-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <text
                  x="12"
                  y="16"
                  text-anchor="middle"
                  font-size="14"
                  fill="white"
                  font-weight="bold"
                >
                  i
                </text>
              </svg>
              <span>PRO TIP</span>
            </div>
            <p class="pro-tip-text">
              Choose a unique handle. You can use letters, numbers, underscores, and dots.
            </p>
          </div>

          <p v-if="formError" class="error-text form-error">{{ formError }}</p>

          <button
            type="submit"
            class="start-btn"
            :disabled="isLoading || !username.trim() || Boolean(usernameError)"
          >
            {{ submitLabel }}
          </button>
        </form>
      </div>

      <footer class="profile-footer">
        <p>YOUR PROFILE • YOUR LOCAL IDENTITY</p>
      </footer>
    </section>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/services/api'
import AuthPageShell from '@/components/AuthPageShell.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
const SUPPORTED_PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/

const router = useRouter()
const auth = useAuthStore()

const username = ref(auth.user?.username ?? '')
const usernameError = ref('')
const imageError = ref('')
const formError = ref('')
const isLoading = ref(false)
const isUploading = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<File | null>(null)
const avatarPreview = ref<string | null>(auth.user?.profile_image ?? null)
let localPreviewUrl: string | null = null

const submitLabel = computed(() => {
  if (isUploading.value) return 'Uploading photo...'
  if (isLoading.value) return 'Saving profile...'
  return 'Start Connecting'
})

function openImagePicker() {
  imageInput.value?.click()
}

function releaseLocalPreview() {
  if (!localPreviewUrl) return
  URL.revokeObjectURL(localPreviewUrl)
  localPreviewUrl = null
}

function resetSelectedImage() {
  releaseLocalPreview()
  selectedImage.value = null
  avatarPreview.value = auth.user?.profile_image ?? null
}

function handleImageSelected(event: Event) {
  imageError.value = ''
  formError.value = ''

  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!SUPPORTED_PROFILE_IMAGE_TYPES.has(file.type)) {
    resetSelectedImage()
    imageError.value = 'Choose a JPG, PNG, or WebP image.'
    return
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    resetSelectedImage()
    imageError.value = 'Profile pictures must be 5 MB or smaller.'
    return
  }

  releaseLocalPreview()
  localPreviewUrl = URL.createObjectURL(file)
  selectedImage.value = file
  avatarPreview.value = localPreviewUrl
}

function validateUsername() {
  usernameError.value = ''
  formError.value = ''
  const value = username.value.trim()

  if (value.length === 0) {
    return
  }

  if (value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters'
    return
  }

  if (value.length > 20) {
    usernameError.value = 'Username must be at most 20 characters'
    return
  }

  if (!USERNAME_PATTERN.test(value)) {
    usernameError.value = 'Use letters, numbers, underscores, and single dots between characters'
    return
  }
}

async function handleSubmit() {
  validateUsername()

  if (usernameError.value || !username.value.trim()) {
    return
  }

  imageError.value = ''
  formError.value = ''
  isLoading.value = true
  try {
    if (selectedImage.value) {
      isUploading.value = true
      const uploaded = await userApi.uploadProfileImage(selectedImage.value)
      avatarPreview.value = uploaded.url
      selectedImage.value = null
      releaseLocalPreview()
      if (auth.token) auth.setAuth(auth.token, uploaded.user)
      isUploading.value = false
    }

    const updatedUser = await userApi.completeProfile({
      username: username.value.trim(),
    })
    if (auth.token) auth.setAuth(auth.token, updatedUser)

    await router.push('/permission-request')
  } catch (err: unknown) {
    formError.value =
      err instanceof Error ? err.message : 'Failed to set profile. Please try again.'
  } finally {
    isUploading.value = false
    isLoading.value = false
  }
}

async function handleSkip() {
  usernameError.value = ''
  imageError.value = ''
  formError.value = ''
  isLoading.value = true
  try {
    const updatedUser = await userApi.completeProfile({})
    if (auth.token) auth.setAuth(auth.token, updatedUser)
    await router.push('/permission-request')
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'Failed to continue. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(releaseLocalPreview)
</script>

<style scoped>
.skip-btn {
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid rgba(12, 144, 129, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  color: #08766c;
  font-size: 0.84rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.skip-btn:hover {
  border-color: rgba(12, 144, 129, 0.4);
  background: #fff;
}

.skip-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.profile-card {
  width: min(500px, 100%);
  margin-left: auto;
  padding: clamp(30px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(134, 160, 176, 0.22);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 28px 70px rgba(28, 64, 82, 0.13),
    0 2px 8px rgba(28, 64, 82, 0.04);
  backdrop-filter: blur(18px);
}

.profile-content {
  text-align: center;
}

.profile-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #17283d;
  letter-spacing: -0.035em;
  margin: 0 0 12px;
}

.profile-subtitle {
  font-size: 0.95rem;
  color: #718094;
  margin: 0 0 32px;
  line-height: 1.5;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-picker {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #edf7f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #85aca7;
  border: 4px solid #fff;
  box-shadow:
    0 0 0 1px #d9e9e7,
    0 12px 30px rgba(28, 64, 82, 0.13);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    background 0.2s;
  padding: 0;
}

.avatar-picker:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #e2f2f0;
}

.avatar-picker:focus-visible {
  outline: 3px solid rgba(12, 144, 129, 0.28);
  outline-offset: 4px;
}

.avatar-picker:disabled {
  cursor: not-allowed;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  font-size: 2.75rem;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(30, 24, 28, 0.48);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fff;
  font-family: 'Poppins', 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-picker:hover:not(:disabled) .avatar-overlay,
.avatar-picker:focus-visible .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c1d25;
}

.avatar-help {
  max-width: 300px;
  margin: 12px 0 0;
  color: #7d8c9b;
  font-size: 0.78rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.avatar-error {
  margin-top: 8px;
  text-align: center;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.form-group {
  text-align: left;
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #34465a;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.input-wrapper {
  min-height: 50px;
  background: #f8fafb;
  border: 1px solid #dce5ea;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #0c9081;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(12, 144, 129, 0.11);
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #23364a;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: #9aa7b3;
}

.input-wrapper input:focus {
  outline: none;
}

.input-suffix {
  font-size: 0.95rem;
  color: #0c9081;
  font-weight: 600;
}

.error-text {
  font-size: 0.85rem;
  color: #c0392b;
  margin-top: 6px;
  margin-bottom: 0;
}

.form-error {
  margin: -12px 0 18px;
  text-align: center;
}

.pro-tip {
  background: #f3f9f9;
  border: 1px solid #dcecea;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 28px;
  text-align: left;
}

.pro-tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #355a61;
  letter-spacing: 1px;
}

.pro-tip-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #0c9081;
}

.pro-tip-text {
  font-size: 0.9rem;
  color: #718094;
  margin: 0;
  line-height: 1.4;
}

.start-btn {
  width: 100%;
  background: linear-gradient(135deg, #0d9b8a, #08766c);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 750;
  cursor: pointer;
  box-shadow: 0 13px 28px rgba(12, 144, 129, 0.24);
  transition: opacity 0.2s;
  font-family: inherit;
}

.start-btn:hover:not(:disabled) {
  opacity: 0.95;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-footer {
  margin-top: auto;
  text-align: center;
  font-size: 0.75rem;
  color: #a0acb7;
  letter-spacing: 0.5px;
  margin-top: 40px;
}

.profile-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .skip-btn {
    min-height: 34px;
    padding-inline: 12px;
  }

  .profile-card {
    margin-inline: auto;
    padding: 28px 20px;
    border-radius: 22px;
  }

  .profile-title {
    font-size: 1.5rem;
  }

  .profile-subtitle {
    font-size: 0.9rem;
  }

  .avatar-picker {
    width: 100px;
    height: 100px;
  }

  .avatar-image {
    font-size: 2.25rem;
  }
}
</style>
