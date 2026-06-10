<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useGeolocation } from '@/composables/useGeolocation'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import {
  Bell,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ImagePlus,
  MapPinned,
  MessageSquareMore,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from 'lucide-vue-next'

const visibilityOptions = [50, 100, 200]
const durationOptions = ['1h', '3h', '12h', '24h'] as const

const title = ref('')
const content = ref('')
const visibilityRadius = ref(100)
const allowResponses = ref(true)
const pinToMap = ref(false)
const selectedDuration = ref<(typeof durationOptions)[number]>('12h')
const submitting = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImageUrl = ref('')
const selectedImageName = ref('')
let activeObjectUrl: string | null = null
const router = useRouter()
const auth = useAuthStore()
const geo = useGeolocation()
const submitError = ref('')
const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const isReadyToSubmit = computed(
  () =>
    title.value.trim().length > 0 &&
    content.value.trim().length > 0 &&
    visibilityRadius.value > 0 &&
    !submitting.value,
)

const username = computed(() => auth.user?.username || 'neighbor')
const displayName = computed(
  () =>
    username.value
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Nearme Neighbor',
)
const profileImage = computed(() => {
  const profile = auth.user?.profile as { profile_image?: string | null } | undefined
  return auth.user?.profile_image || profile?.profile_image || null
})

function openImagePicker() {
  imageInput.value?.click()
}

function clearSelectedImage() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl)
    activeObjectUrl = null
  }

  selectedImageUrl.value = ''
  selectedImageName.value = ''

  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    clearSelectedImage()
    return
  }

  clearSelectedImage()
  activeObjectUrl = URL.createObjectURL(file)
  selectedImageUrl.value = activeObjectUrl
  selectedImageName.value = file.name
}

function durationToMs(duration: (typeof durationOptions)[number]) {
  const amount = Number(duration.replace('h', ''))
  return amount * 60 * 60 * 1000
}

function resetDraft() {
  title.value = ''
  content.value = ''
  visibilityRadius.value = 100
  allowResponses.value = true
  pinToMap.value = false
  selectedDuration.value = '12h'
  submitError.value = ''
  clearSelectedImage()
}

function requestDiscard() {
  if (!title.value && !content.value && !selectedImageUrl.value) {
    resetDraft()
    return
  }

  confirmDialog.value?.open()
}

async function getPostLocation() {
  const position = await geo.request()
  return position ?? geo.getLastKnownLocation()
}

async function submitPost() {
  if (!isReadyToSubmit.value) return
  const userId = auth.user?.userId ?? auth.user?.user_id

  if (!userId) {
    submitError.value = 'Please log in again before posting.'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const position = await getPostLocation()
    if (!position) {
      submitError.value =
        'Location is required to create a nearby post. Try opening Nearby Users once, then create the post again.'
      return
    }

    await postApi.create({
      user_id: userId,
      title: title.value.trim(),
      content: content.value.trim(),
      latitude: position.lat,
      longitude: position.lng,
      visibility_radius: visibilityRadius.value,
      expires_at: new Date(Date.now() + durationToMs(selectedDuration.value)).toISOString(),
    })

    submitting.value = false
    resetDraft()
    router.push('/discussions')
  } catch (err: unknown) {
    submitError.value = err instanceof Error ? err.message : 'Failed to create post.'
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  clearSelectedImage()
})
</script>

<template>
  <div class="create-post-page">
    <Navbar />

    <div class="page-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <div class="heading-copy">
            <span class="eyebrow"><Sparkles /> Community update</span>
            <h1>Create a post</h1>
            <p>Share something useful with people nearby. You control its reach and lifetime.</p>
          </div>

          <span class="privacy-note">
            <ShieldCheck />
            Exact location stays private
          </span>
        </header>

        <div class="content-grid">
          <form class="composer-card" @submit.prevent="submitPost">
            <div class="author-row">
              <div class="author-identity">
                <UserAvatar
                  :src="profileImage"
                  :username="username"
                  :alt="`${displayName} profile photo`"
                  class="author-avatar"
                />
                <div>
                  <span class="section-label">Posting as</span>
                  <strong>{{ displayName }}</strong>
                  <span>@{{ username }}</span>
                </div>
              </div>

              <div class="audience-chip">
                <Users />
                <div>
                  <span>Audience</span>
                  <strong>Nearby community</strong>
                </div>
              </div>
            </div>

            <section class="writing-section">
              <label class="field-group" for="post-title">
                <span class="field-heading">
                  <span>Post title</span>
                  <small>{{ title.length }} characters</small>
                </span>
                <input
                  id="post-title"
                  v-model="title"
                  type="text"
                  placeholder="What should your neighbors know?"
                  autocomplete="off"
                />
              </label>

              <label class="field-group" for="post-content">
                <span class="field-heading">
                  <span>Your message</span>
                  <small>{{ content.length }} characters</small>
                </span>
                <textarea
                  id="post-content"
                  v-model="content"
                  rows="8"
                  placeholder="Add the useful details: what happened, where approximately, and what people should do."
                />
              </label>
            </section>

            <section class="media-section">
              <div class="section-intro">
                <div>
                  <span class="section-label">Optional visual</span>
                  <h2>Add an image preview</h2>
                  <p>Choose a clear image that supports your update.</p>
                </div>
                <ImagePlus />
              </div>

              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="visually-hidden"
                @change="handleImageChange"
              />

              <div v-if="selectedImageUrl" class="image-preview">
                <img :src="selectedImageUrl" alt="Selected image preview" />
                <div class="image-details">
                  <div>
                    <span class="section-label">Selected image</span>
                    <strong>{{ selectedImageName }}</strong>
                  </div>
                  <button type="button" @click="clearSelectedImage">
                    <Trash2 />
                    Remove
                  </button>
                </div>
              </div>

              <button v-else type="button" class="upload-zone" @click="openImagePicker">
                <span class="upload-icon"><UploadCloud /></span>
                <strong>Choose an image</strong>
                <span>PNG, JPG or WebP from your device</span>
              </button>
            </section>

            <section class="settings-section">
              <div class="section-intro">
                <div>
                  <span class="section-label">Post settings</span>
                  <h2>Choose who sees it and for how long</h2>
                </div>
              </div>

              <div class="settings-grid">
                <article class="setting-card">
                  <div class="setting-heading">
                    <span class="setting-icon"><MapPinned /></span>
                    <div>
                      <strong>Visibility radius</strong>
                      <span>People within {{ visibilityRadius }}m</span>
                    </div>
                    <CircleHelp />
                  </div>

                  <input
                    v-model.number="visibilityRadius"
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    aria-label="Visibility radius"
                    class="radius-slider"
                  />

                  <div class="option-group radius-options">
                    <button
                      v-for="option in visibilityOptions"
                      :key="option"
                      type="button"
                      :class="{ selected: visibilityRadius === option }"
                      @click="visibilityRadius = option"
                    >
                      {{ option }}m
                    </button>
                  </div>
                </article>

                <article class="setting-card">
                  <div class="setting-heading">
                    <span class="setting-icon"><Clock3 /></span>
                    <div>
                      <strong>Post lifetime</strong>
                      <span>Disappears after {{ selectedDuration }}</span>
                    </div>
                    <CircleHelp />
                  </div>

                  <div class="option-group duration-options">
                    <button
                      v-for="option in durationOptions"
                      :key="option"
                      type="button"
                      :class="{ selected: selectedDuration === option }"
                      @click="selectedDuration = option"
                    >
                      {{ option }}
                    </button>
                  </div>

                  <p class="setting-footnote">Temporary posts keep the nearby feed timely.</p>
                </article>
              </div>

              <div class="preference-list">
                <div class="preference-row">
                  <span class="preference-icon"><MessageSquareMore /></span>
                  <div>
                    <strong>Allow responses</strong>
                    <span>Let neighbors reply to this post.</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="allowResponses"
                    class="toggle"
                    :class="{ active: allowResponses }"
                    @click="allowResponses = !allowResponses"
                  >
                    <span></span>
                  </button>
                </div>

                <div class="preference-row">
                  <span class="preference-icon"><MapPinned /></span>
                  <div>
                    <strong>Show on nearby map</strong>
                    <span>Use an approximate area, never your exact position.</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="pinToMap"
                    class="toggle"
                    :class="{ active: pinToMap }"
                    @click="pinToMap = !pinToMap"
                  >
                    <span></span>
                  </button>
                </div>
              </div>
            </section>

            <div class="form-footer">
              <p v-if="submitError" class="submit-error">{{ submitError }}</p>

              <div class="draft-status">
                <CheckCircle2 />
                <span>Your draft stays on this device until you publish or leave.</span>
              </div>

              <div class="form-actions">
                <button type="button" class="discard-button" @click="requestDiscard">
                  Discard draft
                </button>
                <button type="submit" class="publish-button" :disabled="!isReadyToSubmit">
                  <span v-if="submitting" class="spinner"></span>
                  <Send v-else />
                  {{ submitting ? 'Publishing...' : 'Publish post' }}
                </button>
              </div>
            </div>
          </form>

          <aside class="guidance-column">
            <section class="guidance-card">
              <div class="guidance-heading">
                <span class="guidance-icon"><Sparkles /></span>
                <div>
                  <span class="section-label">Good local posts</span>
                  <h2>Helpful, clear, and considerate</h2>
                </div>
              </div>

              <div class="etiquette-list">
                <article>
                  <span>01</span>
                  <div>
                    <strong>Keep it relevant</strong>
                    <p>Focus on something people nearby can understand or act on.</p>
                  </div>
                </article>
                <article>
                  <span>02</span>
                  <div>
                    <strong>Protect privacy</strong>
                    <p>Avoid sharing exact addresses or another person's private information.</p>
                  </div>
                </article>
                <article>
                  <span>03</span>
                  <div>
                    <strong>Add useful context</strong>
                    <p>Include timing, an approximate area, and what response would help.</p>
                  </div>
                </article>
              </div>
            </section>

            <section class="reach-card">
              <div class="reach-heading">
                <span class="section-label">Current reach</span>
                <strong>{{ visibilityRadius }}m radius</strong>
              </div>

              <div class="radius-visual" aria-hidden="true">
                <span
                  class="radius-ring"
                  :style="{ transform: `scale(${0.58 + visibilityRadius / 1200})` }"
                >
                  <span></span>
                </span>
              </div>

              <div class="reach-summary">
                <MapPinned />
                <p>
                  Your post will be available to eligible nearby users inside the selected radius.
                </p>
              </div>
            </section>

            <section class="temporary-card">
              <span class="temporary-icon"><Bell /></span>
              <div>
                <strong>Designed to be temporary</strong>
                <p>
                  This post will automatically expire after {{ selectedDuration }}, keeping the
                  community feed current.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>

    <MobileBottomNav />

    <ConfirmDialog
      ref="confirmDialog"
      title="Discard this draft?"
      message="Your title, message, image preview, and selected settings will be cleared."
      confirm-label="Discard draft"
      cancel-label="Keep editing"
      confirm-variant="danger"
      @confirm="resetDraft"
    />
  </div>
</template>

<style scoped>
.create-post-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #29475a;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.page-shell {
  display: flex;
  width: 100%;
  min-width: 0;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 30px clamp(18px, 2.5vw, 38px) 64px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.heading-copy {
  max-width: 650px;
}

.eyebrow,
.section-label {
  color: #27828d;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.eyebrow,
.privacy-note,
.author-row,
.author-identity,
.audience-chip,
.section-intro,
.setting-heading,
.preference-row,
.draft-status,
.form-actions,
.publish-button,
.discard-button,
.guidance-heading,
.reach-heading,
.reach-summary,
.temporary-card,
.image-details,
.image-details button {
  display: flex;
  align-items: center;
}

.eyebrow {
  gap: 6px;
  margin-bottom: 10px;
}

.eyebrow svg,
.privacy-note svg,
.audience-chip svg,
.draft-status svg,
.publish-button svg,
.reach-summary svg,
.image-details button svg {
  width: 16px;
  height: 16px;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 3vw, 2.65rem);
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.page-heading p {
  max-width: 560px;
  margin: 10px 0 0;
  color: #718096;
  font-size: 0.92rem;
  line-height: 1.6;
}

.privacy-note {
  flex: 0 0 auto;
  gap: 8px;
  border: 1px solid #d5ebe9;
  border-radius: 999px;
  background: #f0faf8;
  color: #246e74;
  padding: 9px 13px;
  font-size: 0.75rem;
  font-weight: 750;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 330px);
  align-items: start;
  gap: 22px;
}

.composer-card,
.guidance-card,
.reach-card,
.temporary-card {
  border: 1px solid #e1eaf1;
  background: #fff;
  box-shadow: 0 12px 32px rgba(42, 67, 83, 0.055);
}

.composer-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 20px;
}

.author-row {
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid #e9eff3;
  padding: 18px 20px;
}

.author-identity {
  min-width: 0;
  gap: 13px;
}

.author-avatar {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border: 3px solid #fff;
  border-radius: 14px;
  object-fit: cover;
  box-shadow:
    0 0 0 1px #dce9ee,
    0 7px 18px rgba(15, 45, 70, 0.12);
}

.author-identity > div,
.audience-chip > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.author-identity strong {
  overflow: hidden;
  color: #18394a;
  font-size: 0.94rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-identity span:last-child {
  color: #8294a3;
  font-size: 0.76rem;
}

.audience-chip {
  min-width: 205px;
  gap: 10px;
  border: 1px solid #dfebef;
  border-radius: 13px;
  background: #f7fafb;
  color: #287781;
  padding: 10px 13px;
}

.audience-chip > span,
.audience-chip div > span {
  color: #8294a3;
  font-size: 0.64rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.audience-chip strong {
  color: #244a5c;
  font-size: 0.8rem;
}

.writing-section,
.media-section,
.settings-section {
  padding: 22px 20px;
}

.writing-section,
.media-section {
  border-bottom: 1px solid #e9eff3;
}

.field-group {
  display: block;
}

.field-group + .field-group {
  margin-top: 18px;
}

.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #35576a;
  font-size: 0.78rem;
  font-weight: 800;
}

.field-heading small {
  color: #91a0ac;
  font-size: 0.67rem;
  font-weight: 650;
}

.field-group input,
.field-group textarea {
  width: 100%;
  border: 1px solid #dce6ed;
  border-radius: 14px;
  outline: none;
  background: #f8fafc;
  color: #233f51;
  font: inherit;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.field-group input {
  height: 48px;
  padding: 0 14px;
  font-size: 0.88rem;
}

.field-group textarea {
  min-height: 210px;
  resize: vertical;
  padding: 14px;
  font-size: 0.87rem;
  line-height: 1.65;
}

.field-group input::placeholder,
.field-group textarea::placeholder {
  color: #9aa8b3;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: #69b5ba;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(39, 130, 141, 0.1);
}

.section-intro {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.section-intro h2,
.guidance-heading h2 {
  margin: 4px 0 0;
  color: #193a4c;
  font-size: 0.98rem;
  line-height: 1.35;
}

.section-intro p {
  margin: 5px 0 0;
  color: #7b8f9f;
  font-size: 0.76rem;
}

.section-intro > svg {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #edf8f7;
  color: #247682;
  padding: 8px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.upload-zone {
  width: 100%;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  border: 1px dashed #bfcfd9;
  border-radius: 16px;
  background: #f8fbfc;
  color: #617b8d;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.upload-zone:hover {
  border-color: #69b5ba;
  background: #f1f9f8;
}

.upload-zone strong {
  margin-top: 4px;
  color: #315568;
  font-size: 0.85rem;
}

.upload-zone > span:last-child {
  font-size: 0.72rem;
}

.upload-icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #fff;
  color: #2b7e86;
  box-shadow: 0 4px 14px rgba(42, 67, 83, 0.08);
}

.upload-icon svg {
  width: 20px;
  height: 20px;
}

.image-preview {
  overflow: hidden;
  border: 1px solid #dce6ed;
  border-radius: 16px;
  background: #f8fafc;
}

.image-preview > img {
  width: 100%;
  height: 240px;
  display: block;
  object-fit: cover;
}

.image-details {
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
}

.image-details > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.image-details strong {
  overflow: hidden;
  color: #35576a;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-details button {
  flex: 0 0 auto;
  gap: 5px;
  border: 0;
  background: transparent;
  color: #b64b4b;
  font-size: 0.73rem;
  font-weight: 750;
  cursor: pointer;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.setting-card {
  min-width: 0;
  border: 1px solid #e0e9ef;
  border-radius: 16px;
  background: #f8fafc;
  padding: 15px;
}

.setting-heading {
  gap: 10px;
}

.setting-icon,
.preference-icon,
.guidance-icon,
.temporary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: #eaf7f6;
  color: #247682;
}

.setting-icon {
  width: 34px;
  height: 34px;
}

.setting-icon svg,
.preference-icon svg,
.guidance-icon svg,
.temporary-icon svg {
  width: 17px;
  height: 17px;
}

.setting-heading > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.setting-heading strong,
.preference-row strong {
  color: #294b5e;
  font-size: 0.8rem;
}

.setting-heading div > span,
.preference-row div > span {
  color: #7c91a1;
  font-size: 0.7rem;
  line-height: 1.4;
}

.setting-heading > svg {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  color: #a68752;
}

.radius-slider {
  width: 100%;
  margin: 18px 0 12px;
  accent-color: #227c83;
}

.option-group {
  display: grid;
  gap: 5px;
  border: 1px solid #dfe8ef;
  border-radius: 12px;
  background: #eaf1f5;
  padding: 4px;
}

.radius-options {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.duration-options {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 22px;
}

.option-group button {
  min-width: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #687f91;
  padding: 8px 5px;
  font-size: 0.74rem;
  font-weight: 750;
  cursor: pointer;
}

.option-group button.selected {
  background: #fff;
  color: #176171;
  box-shadow: 0 3px 10px rgba(38, 68, 88, 0.1);
}

.setting-footnote {
  margin: 13px 0 0;
  color: #8a7450;
  font-size: 0.69rem;
  line-height: 1.45;
}

.preference-list {
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid #e0e9ef;
  border-radius: 16px;
}

.preference-row {
  gap: 11px;
  padding: 13px 15px;
}

.preference-row + .preference-row {
  border-top: 1px solid #e6edf2;
}

.preference-icon {
  width: 32px;
  height: 32px;
}

.preference-row > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.toggle {
  width: 42px;
  height: 24px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: #cfdbe2;
  padding: 3px;
  cursor: pointer;
  transition: background 0.18s ease;
}

.toggle span {
  width: 18px;
  height: 18px;
  display: block;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 5px rgba(31, 65, 84, 0.2);
  transition: transform 0.18s ease;
}

.toggle.active {
  background: #23848a;
}

.toggle.active span {
  transform: translateX(18px);
}

.form-footer {
  border-top: 1px solid #e9eff3;
  padding: 17px 20px;
}

.submit-error {
  margin: 0 0 13px;
  border: 1px solid #f3d0d0;
  border-radius: 11px;
  background: #fff5f5;
  color: #b94b4b;
  padding: 10px 12px;
  font-size: 0.77rem;
  font-weight: 700;
}

.draft-status {
  gap: 7px;
  color: #7c91a1;
  font-size: 0.7rem;
}

.draft-status svg {
  color: #3c9292;
}

.form-actions {
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.discard-button,
.publish-button {
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  border-radius: 11px;
  padding: 0 16px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.discard-button {
  border: 1px solid #dce5eb;
  background: #fff;
  color: #61798a;
}

.publish-button {
  min-width: 140px;
  border: 0;
  background: #167f80;
  color: #fff;
  box-shadow: 0 9px 20px rgba(22, 127, 128, 0.2);
}

.publish-button:disabled {
  cursor: not-allowed;
  background: #d8e1e6;
  color: #93a2ac;
  box-shadow: none;
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.guidance-column {
  position: sticky;
  top: 82px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
}

.guidance-card,
.reach-card {
  border-radius: 18px;
  padding: 18px;
}

.guidance-heading {
  align-items: flex-start;
  gap: 11px;
}

.guidance-icon {
  width: 36px;
  height: 36px;
}

.etiquette-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 18px;
}

.etiquette-list article {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.etiquette-list article > span {
  color: #2b858b;
  font-size: 0.68rem;
  font-weight: 850;
}

.etiquette-list strong {
  color: #294b5e;
  font-size: 0.78rem;
}

.etiquette-list p {
  margin: 3px 0 0;
  color: #718899;
  font-size: 0.71rem;
  line-height: 1.55;
}

.reach-card {
  overflow: hidden;
  padding: 0;
}

.reach-heading {
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
}

.reach-heading strong {
  color: #244b5e;
  font-size: 0.8rem;
}

.radius-visual {
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    linear-gradient(rgba(255, 255, 255, 0.72) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.72) 1px, transparent 1px), #dfe9e9;
  background-size: 28px 28px;
}

.radius-ring {
  width: 112px;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(35, 132, 138, 0.65);
  border-radius: 50%;
  background: rgba(106, 201, 198, 0.2);
  transition: transform 0.2s ease;
}

.radius-ring > span {
  width: 12px;
  height: 12px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #217d82;
  box-shadow: 0 0 0 12px rgba(33, 125, 130, 0.14);
}

.reach-summary {
  align-items: flex-start;
  gap: 9px;
  padding: 13px 16px 16px;
  color: #347f87;
}

.reach-summary svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.reach-summary p {
  margin: 0;
  color: #708797;
  font-size: 0.72rem;
  line-height: 1.55;
}

.temporary-card {
  align-items: flex-start;
  gap: 11px;
  border-color: #eadfca;
  border-radius: 18px;
  background: #fffaf0;
  padding: 16px;
}

.temporary-icon {
  width: 34px;
  height: 34px;
  background: #f8ecd1;
  color: #9a7131;
}

.temporary-card strong {
  color: #715a38;
  font-size: 0.8rem;
}

.temporary-card p {
  margin: 4px 0 0;
  color: #8b7657;
  font-size: 0.71rem;
  line-height: 1.55;
}

.discard-button:hover {
  border-color: #c7d5de;
  background: #f8fafb;
}

.publish-button:not(:disabled):hover {
  background: #126f70;
}

.upload-zone:focus-visible,
.option-group button:focus-visible,
.toggle:focus-visible,
.discard-button:focus-visible,
.publish-button:focus-visible,
.image-details button:focus-visible {
  outline: 3px solid rgba(39, 130, 141, 0.22);
  outline-offset: 2px;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .guidance-column {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .guidance-column {
    grid-template-columns: 1fr 1fr;
  }

  .temporary-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .create-post-page {
    padding-bottom: calc(84px + env(safe-area-inset-bottom));
  }

  .workspace {
    padding: 20px 14px 30px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 13px;
    margin-bottom: 18px;
  }

  .eyebrow {
    margin-bottom: 8px;
    font-size: 0.64rem;
  }

  .page-heading h1 {
    font-size: clamp(1.85rem, 9vw, 2.25rem);
    line-height: 1.08;
  }

  .page-heading p {
    margin-top: 8px;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .privacy-note {
    padding: 7px 11px;
    font-size: 0.7rem;
  }

  .composer-card {
    border-radius: 17px;
  }

  .author-row {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
    padding: 15px;
  }

  .author-avatar {
    width: 43px;
    height: 43px;
  }

  .audience-chip {
    width: 100%;
    min-width: 0;
  }

  .writing-section,
  .media-section,
  .settings-section {
    padding: 18px 15px;
  }

  .field-group textarea {
    min-height: 190px;
  }

  .section-intro h2 {
    font-size: 0.9rem;
  }

  .image-preview > img {
    height: 190px;
  }

  .settings-grid,
  .guidance-column {
    grid-template-columns: 1fr;
  }

  .temporary-card {
    grid-column: auto;
  }

  .setting-card {
    padding: 14px;
  }

  .preference-row {
    padding: 13px;
  }

  .form-footer {
    padding: 15px;
  }

  .draft-status {
    align-items: flex-start;
  }

  .form-actions {
    width: 100%;
  }

  .discard-button,
  .publish-button {
    flex: 1;
  }

  .guidance-column {
    gap: 12px;
  }

  .guidance-card,
  .reach-card,
  .temporary-card {
    border-radius: 17px;
  }
}

@media (max-width: 420px) {
  .workspace {
    padding-inline: 12px;
  }

  .field-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .duration-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preference-row {
    align-items: flex-start;
  }

  .toggle {
    margin-top: 3px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .discard-button,
  .publish-button {
    width: 100%;
  }

  .image-details {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .radius-ring {
    animation: none;
    transition: none;
  }
}
</style>
