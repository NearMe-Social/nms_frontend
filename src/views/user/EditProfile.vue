<template>
  <Navbar />
  <div class="flex min-w-0">
    <AppSidebar class="hidden md:flex" />
    <div class="edit-profile-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Edit Profile</h1>
      <p class="page-subtitle">Personalize your presence in the editorial community.</p>
    </div>

    <div class="edit-profile-container">
      <!-- Main Form -->
      <form @submit.prevent="handleSaveChanges" class="profile-form">
        <div class="form-layout">
          <!-- Left Sidebar - Profile Photo -->
          <aside class="form-sidebar">
            <div class="profile-photo-card">
              <div class="photo-section">
                <div class="photo-preview" v-if="photoPreview">
                  <img :src="photoPreview" :alt="formData.first_name" class="preview-img" />
                </div>
                <div v-else class="photo-placeholder">
                  <UserIcon :size="48" />
                </div>
              </div>
              <button type="button" class="photo-change-btn" @click="triggerFileInput">
                <UploadCloudIcon :size="16" />
                Change Photo
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

          <!-- Right Content Area -->
          <div class="form-content">
            <!-- Public Identity Section -->
            <div class="form-section">
              <div class="section-header">
                <UserIcon :size="18" />
                <h2 class="section-title">Public Identity</h2>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="firstName" class="form-label">Full Name</label>
                  <input
                    id="firstName"
                    v-model="formData.first_name"
                    type="text"
                    class="form-input"
                    placeholder="Julian Alexander"
                  />
                </div>
                <div class="form-group">
                  <label for="username" class="form-label">Username</label>
                  <input
                    id="username"
                    v-model="formData.username"
                    type="text"
                    class="form-input"
                    placeholder="@juliant"
                    disabled
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="bio" class="form-label">Professional Bio</label>
                <textarea
                  id="bio"
                  v-model="formData.bio"
                  class="form-textarea"
                  placeholder="Independent design critic and urban theorist. Exploring the intersection of digital and physical spaces."
                  rows="3"
                ></textarea>
                <div class="char-count">{{ formData.bio?.length || 0 }} / 500 characters</div>
              </div>
            </div>

            <!-- Presence Section -->
            <div class="form-section">
              <div class="section-header">
                <MapPinIcon :size="18" />
                <h2 class="section-title">Presence</h2>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="location" class="form-label">Location</label>
                  <input
                    id="location"
                    v-model="formData.location"
                    type="text"
                    class="form-input"
                    placeholder="Portland, Oregon"
                  />
                </div>

                <div class="form-group">
                  <label for="website" class="form-label">Website / Portfolio</label>
                  <input
                    id="website"
                    v-model="formData.website"
                    type="url"
                    class="form-input"
                    placeholder="https://yourdesign.com"
                  />
                </div>
              </div>
            </div>

            <!-- Social Ties Section -->
            <div class="form-section">
              <div class="section-header">
                <LinkIcon :size="18" />
                <h2 class="section-title">Social Ties</h2>
              </div>

              <div class="social-grid">
                <div class="social-item">
                  <div class="social-platform">
                    <TwitterIcon :size="18" />
                    <span>X (Twitter)</span>
                  </div>
                  <input
                    v-model="formData.twitter_handle"
                    type="text"
                    class="form-input form-input-sm"
                    placeholder="@handle"
                  />
                  <div v-if="formData.twitter_handle" class="social-status connected">
                    <CheckIcon :size="12" />
                    Connected
                  </div>
                  <div v-else class="social-status disconnected">
                    Not connected
                  </div>
                </div>

                <div class="social-item">
                  <div class="social-platform">
                    <InstagramIcon :size="18" />
                    <span>Instagram</span>
                  </div>
                  <input
                    v-model="formData.instagram_handle"
                    type="text"
                    class="form-input form-input-sm"
                    placeholder="@username"
                  />
                  <div v-if="formData.instagram_handle" class="social-status connected">
                    <CheckIcon :size="12" />
                    Connected
                  </div>
                  <div v-else class="social-status disconnected">
                    Not connected
                  </div>
                </div>

                <div class="social-item">
                  <div class="social-platform">
                    <LinkedinIcon :size="18" />
                    <span>LinkedIn</span>
                  </div>
                  <input
                    v-model="formData.linkedin_url"
                    type="url"
                    class="form-input form-input-sm"
                    placeholder="linkedin.com/in/..."
                  />
                  <div v-if="formData.linkedin_url" class="social-status connected">
                    <CheckIcon :size="12" />
                    Connected
                  </div>
                  <div v-else class="social-status disconnected">
                    Not connected
                  </div>
                </div>
              </div>
            </div>

            <!-- Editorial Focus Section -->
            <div class="form-section">
              <div class="section-header">
                <TagIcon :size="18" />
                <h2 class="section-title">Editorial Focus</h2>
              </div>

              <div class="form-group">
                <label class="form-label">Topics & Interests</label>
                <div class="tags-input-wrapper">
                  <div class="tags-list">
                    <div v-for="(tag, index) in formData.tags" :key="index" class="tag-item">
                      {{ tag }}
                      <button
                        type="button"
                        class="tag-remove"
                        @click="removeTag(index)"
                      >
                        <XIcon :size="12" />
                      </button>
                    </div>
                  </div>
                  <input
                    v-model="tagInput"
                    type="text"
                    class="form-input tags-input"
                    placeholder="Add topic (press Enter)"
                    @keydown.enter="addTag"
                  />
                </div>
                <div class="tags-hint">Press Enter to add tags. Max 8 topics.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="handleCancel">
            Cancel
          </button>
          <button type="submit" class="btn-save" :disabled="isSaving">
            <span v-if="isSaving" class="btn-loading">
              <LoaderIcon :size="16" class="spinner" />
              Saving...
            </span>
            <span v-else>
              <CheckIcon :size="16" />
              Save Changes
            </span>
          </button>
        </div>

        <!-- Status Messages -->
        <div v-if="successMessage" class="alert alert-success">
          <CheckIcon :size="16" />
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-error">
          <AlertCircleIcon :size="16" />
          {{ errorMessage }}
        </div>
      </form>

      <!-- Footer Note -->
      <div class="form-footer">
        <p class="footer-note">
          Your profile changes will be immediately visible across The Commons. Some data may be cached for up to 24 hours.
        </p>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi, type UpdateProfilePayload } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  User as UserIcon,
  MapPin as MapPinIcon,
  Link as LinkIcon,
  Tag as TagIcon,
  Image as ImageIcon,
  UploadCloud as UploadCloudIcon,
  X as XIcon,
  Check as CheckIcon,
  AlertCircle as AlertCircleIcon,
  Loader2 as LoaderIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const formData = ref({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  bio: '',
  location: '',
  website: '',
  twitter_handle: '',
  instagram_handle: '',
  linkedin_url: '',
  tags: [] as string[],
  profile_image: '',
})

const tagInput = ref('')
const photoPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const isLoading = ref(true)
const successMessage = ref('')
const errorMessage = ref('')

// Load profile data on mount
onMounted(async () => {
  try {
    isLoading.value = true
    const profile = await userApi.getProfile()
    
    // Populate form data
    formData.value = {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      twitter_handle: profile.twitter_handle || '',
      instagram_handle: profile.instagram_handle || '',
      linkedin_url: profile.linkedin_url || '',
      tags: profile.tags || [],
      profile_image: profile.profile_image || '',
    }

    // Set photo preview if exists
    if (profile.profile_image) {
      photoPreview.value = profile.profile_image
    }
  } catch (error) {
    // Load with default data on error (backend not available yet)
    const defaultProfile = {
      first_name: 'Julian',
      last_name: 'Alexander',
      username: 'juliant',
      email: 'julian@example.com',
      bio: 'Independent design critic and urban theorist. Exploring the intersection of digital and physical spaces.',
      location: 'Portland, Oregon',
      website: 'https://yourdesign.com',
      twitter_handle: 'juliandesign',
      instagram_handle: 'julianvision',
      linkedin_url: 'linkedin.com/in/julian',
      tags: ['urban-design', 'architecture', 'digital-culture'],
      profile_image: '',
    }
    formData.value = defaultProfile
    console.error('Error loading profile:', error)
  } finally {
    isLoading.value = false
  }
})

const addTag = () => {
  if (tagInput.value.trim() && formData.value.tags.length < 8) {
    const tag = tagInput.value.trim().toLowerCase()
    if (!formData.value.tags.includes(tag)) {
      formData.value.tags.push(tag)
    }
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File size must be less than 5MB'
    return
  }

  try {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Upload to server
    const response = await userApi.uploadProfileImage(file)
    formData.value.profile_image = response.url
    successMessage.value = 'Photo uploaded successfully'
  } catch (error) {
    errorMessage.value = 'Failed to upload photo'
    console.error('Photo upload error:', error)
  }
}

const handleSaveChanges = async () => {
  if (isSaving.value) return

  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const updatePayload: UpdateProfilePayload = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      bio: formData.value.bio,
      location: formData.value.location,
      website: formData.value.website,
      twitter_handle: formData.value.twitter_handle,
      instagram_handle: formData.value.instagram_handle,
      linkedin_url: formData.value.linkedin_url,
      tags: formData.value.tags,
    }

    if (formData.value.profile_image) {
      updatePayload.profile_image = formData.value.profile_image
    }

    // Update profile via API
    const updatedProfile = await userApi.updateProfile(updatePayload)

    // Sync with auth store
    if (authStore.user) {
      authStore.user.profile = updatedProfile
      localStorage.setItem('auth_user', JSON.stringify(authStore.user))
    }

    successMessage.value = 'Profile updated successfully!'
    
    // Redirect to profile page after 2 seconds
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save profile'
    console.error('Save profile error:', error)
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.edit-profile-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 100vh;
  background: #f8fbff;
  padding: 22px clamp(16px, 2vw, 28px) 40px;
}

.page-header {
  padding: 48px 40px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #0f1419;
  margin: 0 0 8px 0;
  font-family: 'DM Serif Display', serif;
}

    .page-subtitle {
    font-size: 15px;
  color: #65676e;
  margin: 0;
  font-family: 'DM Sans', sans-serif;
}

.edit-profile-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px;
  width: 100%;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

@media (max-width: 968px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

/* Sidebar */
.form-sidebar {
  position: relative;
}

.profile-photo-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.photo-section {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f2f8 0%, #e8ecf7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
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
  color: #a0a9b5;
}

.photo-change-btn {
  width: 100%;
  padding: 11px 16px;
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
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.photo-change-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 138, 124, 0.3);
}

.photo-hint {
  font-size: 12px;
  color: #939aa4;
  margin: 0;
  text-align: center;
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f3f4f6;
  color: #0f8a7c;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f1419;
  margin: 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 18px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #3a3f47;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid #d1d7de;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #0f1419;
  background: #fff;
  transition: all 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #8495a3;
}

.form-input:hover,
.form-textarea:hover {
  border-color: #b1c0d6;
  background: #fafbfc;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0f8a7c;
  box-shadow: 0 0 0 3px rgba(15, 138, 124, 0.08);
}

.form-input:disabled {
  background: #f6f8fb;
  color: #8495a3;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 11px;
  color: #939aa4;
  margin-top: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .social-grid {
    grid-template-columns: 1fr;
  }
}

.social-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.social-platform {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #3a3f47;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.form-input-sm {
  font-size: 13px;
  padding: 10px 12px;
}

.social-status {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.social-status.connected {
  color: #00c9b1;
  background: rgba(0, 201, 177, 0.12);
}

.social-status.disconnected {
  color: #939aa4;
  background: #f3f4f6;
}

/* Tags Input */
.tags-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 11px;
  border: 1px solid #d1d7de;
  border-radius: 8px;
  background: #fff;
  align-content: flex-start;
  transition: all 0.2s ease;
}

.tags-input-wrapper:focus-within {
  border-color: #0f8a7c;
  box-shadow: 0 0 0 3px rgba(15, 138, 124, 0.08);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  background: #0f8a7c;
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

.tags-input {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  flex: 1;
  min-width: 100px;
  font-size: 14px;
}

.tags-input:focus {
  border: none !important;
  box-shadow: none !important;
}

.tags-hint {
  font-size: 11px;
  color: #939aa4;
  margin-top: 6px;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-top: 12px;
}

.btn-cancel,
.btn-save {
  padding: 11px 24px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 7px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #3a3f47;
  border: 1px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #e8ecf1;
  border-color: #d1d7de;
}

.btn-save {
  background: #0f8a7c;
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(15, 138, 124, 0.25);
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
  from {
    transform: rotate(0deg);
  }
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
  margin-top: 16px;
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

/* Footer */
.form-footer {
  text-align: center;
  padding: 20px 24px;
  background: rgba(15, 138, 124, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(15, 138, 124, 0.15);
  margin-top: 24px;
}

.footer-note {
  font-size: 12px;
  color: #65676e;
  margin: 0;
  line-height: 1.6;
}
</style>
