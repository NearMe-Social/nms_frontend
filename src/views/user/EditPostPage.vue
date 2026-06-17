<template>
  <div class="edit-post-page">
    <Navbar />

    <div class="page-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace">
        <header class="page-heading">
          <button class="back-button" type="button" @click="goBack">
            <ArrowLeft />
            Back
          </button>

          <div class="heading-copy">
            <span class="eyebrow"><Pencil /> Manage post</span>
            <h1>Edit your post</h1>
            <p>Update the message, reach, lifetime, and photos people see nearby.</p>
          </div>
        </header>

        <section v-if="loading" class="state-card">
          <span class="loading-mark"></span>
          <div>
            <h2>Loading post</h2>
            <p>Preparing the editor with your current post details.</p>
          </div>
        </section>

        <section v-else-if="error" class="state-card error-state">
          <AlertCircle />
          <div>
            <h2>Post cannot be edited</h2>
            <p>{{ error }}</p>
          </div>
          <RouterLink to="/discussions">Back to My Posts</RouterLink>
        </section>

        <form v-else-if="post" class="editor-layout" @submit.prevent="saveChanges">
          <article class="post-editor-card">
            <div class="author-row">
              <UserAvatar
                :src="post.user?.profile_image"
                :username="post.user?.username || username"
                :alt="`${post.user?.username || username} profile`"
                class="author-avatar"
              />
              <div>
                <span class="section-label">Editing as</span>
                <strong>{{ post.user?.username || username }}</strong>
                <span><MapPin /> Shared within {{ visibilityRadius }}m</span>
              </div>
            </div>

            <label class="field-group">
              <span class="field-heading">
                <span>Title</span>
                <small>{{ title.length }} characters</small>
              </span>
              <input
                v-model="title"
                type="text"
                maxlength="120"
                placeholder="What should your neighbors know?"
              />
            </label>

            <label class="field-group">
              <span class="field-heading">
                <span>Description</span>
                <small>{{ content.length }} characters</small>
              </span>
              <textarea
                v-model="content"
                rows="7"
                maxlength="1200"
                placeholder="Add the useful details people should see."
              />
            </label>

            <section class="image-section">
              <div class="section-header">
                <div>
                  <span class="section-label">Post photos</span>
                  <h2>{{ imagePreviewUrls.length ? 'Photo preview' : 'Add photos' }}</h2>
                  <p>
                    Keep, remove, or add images. The preview uses the same gallery style people see
                    on the post.
                  </p>
                </div>
                <button
                  type="button"
                  class="add-image-button"
                  :disabled="imagePreviewUrls.length >= maxImages"
                  @click="imageInput?.click()"
                >
                  <ImagePlus />
                  Add images
                </button>
              </div>

              <input
                ref="imageInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="visually-hidden"
                @change="handleImageChange"
              />

              <div v-if="imagePreviewUrls.length" class="editable-gallery" :class="galleryClass">
                <button
                  v-for="(image, index) in visibleImagePreviews"
                  :key="`${image}-${index}`"
                  type="button"
                  class="gallery-tile"
                  @click="openPreview(index)"
                >
                  <img :src="image" :alt="`Post image ${index + 1}`" />
                  <span v-if="index === 0" class="preview-chip">Preview</span>
                  <span
                    v-if="index === visibleImagePreviews.length - 1 && hiddenImageCount > 0"
                    class="more-overlay"
                  >
                    +{{ hiddenImageCount }}
                  </span>
                  <span
                    class="remove-image"
                    role="button"
                    tabindex="0"
                    :aria-label="`Remove image ${index + 1}`"
                    @click.stop="removeImage(index)"
                    @keydown.enter.stop.prevent="removeImage(index)"
                  >
                    <X />
                  </span>
                </button>
              </div>

              <button v-else type="button" class="empty-gallery" @click="imageInput?.click()">
                <ImagePlus />
                <strong>Choose images</strong>
                <span>JPEG, PNG, or WebP · Up to {{ maxImages }} images · 5 MB each</span>
              </button>

              <div class="image-summary">
                <span>{{ imagePreviewUrls.length }} / {{ maxImages }} images selected</span>
                <button
                  v-if="imagePreviewUrls.length"
                  type="button"
                  @click="clearAllImages"
                >
                  Remove all
                </button>
              </div>
            </section>

            <div class="settings-grid">
              <section class="setting-card">
                <span class="setting-icon"><MapPinned /></span>
                <div>
                  <span class="section-label">Visibility radius</span>
                  <strong>{{ visibilityRadius }}m reach</strong>
                </div>
                <div class="option-row">
                  <button
                    v-for="option in radiusOptions"
                    :key="option"
                    type="button"
                    :class="{ selected: visibilityRadius === option }"
                    @click="visibilityRadius = option"
                  >
                    {{ option }}m
                  </button>
                </div>
              </section>

              <section class="setting-card">
                <span class="setting-icon"><Clock3 /></span>
                <div>
                  <span class="section-label">Extend lifetime</span>
                  <strong>{{ selectedDurationLabel }}</strong>
                </div>
                <div class="option-row">
                  <button
                    v-for="option in durationOptions"
                    :key="option.value"
                    type="button"
                    :class="{ selected: selectedDuration === option.value }"
                    @click="selectedDuration = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </section>
            </div>

            <p v-if="saveError" class="save-error">{{ saveError }}</p>

            <div class="form-actions">
              <button type="button" class="secondary-action" @click="goBack">Cancel</button>
              <button type="submit" class="save-action" :disabled="!canSave">
                <span v-if="saving" class="spinner"></span>
                <Save v-else />
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </article>

          <aside class="side-column">
            <section class="side-card">
              <span class="side-icon"><ShieldCheck /></span>
              <div>
                <h2>Exact location stays hidden</h2>
                <p>Only the visibility radius is shown. Your coordinates are never displayed.</p>
              </div>
            </section>

            <section class="side-card">
              <span class="section-label">Current status</span>
              <h2>{{ postStatusLabel }}</h2>
              <p>{{ postStatusDescription }}</p>
            </section>

            <section class="side-card">
              <span class="section-label">Photo layout</span>
              <h2>{{ imagePreviewUrls.length || 0 }} image{{ imagePreviewUrls.length === 1 ? '' : 's' }}</h2>
              <p>One image displays large. Multiple images split into a compact grid with a +N overlay.</p>
            </section>
          </aside>
        </form>
      </main>
    </div>

    <Teleport to="body">
      <div
        v-if="previewOpen"
        class="image-modal"
        role="dialog"
        aria-modal="true"
        @click="closePreview"
      >
        <button type="button" class="modal-close" aria-label="Close image" @click="closePreview">
          <X />
        </button>
        <button
          v-if="imagePreviewUrls.length > 1"
          type="button"
          class="modal-nav prev"
          aria-label="Previous image"
          @click.stop="showPreviousImage"
        >
          <ChevronLeft />
        </button>
        <img :src="currentPreviewImage" alt="Selected post preview" @click.stop />
        <button
          v-if="imagePreviewUrls.length > 1"
          type="button"
          class="modal-nav next"
          aria-label="Next image"
          @click.stop="showNextImage"
        >
          <ChevronRight />
        </button>
        <span v-if="imagePreviewUrls.length > 1" class="image-counter">
          {{ previewIndex + 1 }} / {{ imagePreviewUrls.length }}
        </span>
      </div>
    </Teleport>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  MapPin,
  MapPinned,
  Pencil,
  Save,
  ShieldCheck,
  X,
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { postApi, type ApiPost } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

type NewImage = {
  file: File
  url: string
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref<ApiPost | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const saveError = ref('')
const title = ref('')
const content = ref('')
const visibilityRadius = ref(100)
const selectedDuration = ref('none')
const keptImages = ref<string[]>([])
const newImages = ref<NewImage[]>([])
const imageInput = ref<HTMLInputElement | null>(null)
const previewOpen = ref(false)
const previewIndex = ref(0)

const maxImages = 6
const radiusOptions = [50, 100, 200]
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const durationOptions = [
  { value: 'none', label: 'No extension' },
  { value: '3h', label: '3h' },
  { value: '6h', label: '6h' },
  { value: '12h', label: '12h' },
  { value: '24h', label: '24h' },
]

const username = computed(() => auth.user?.username || 'neighbor')
const currentUserId = computed(() => auth.user?.userId ?? auth.user?.user_id ?? null)
const imagePreviewUrls = computed(() => [...keptImages.value, ...newImages.value.map((image) => image.url)])
const visibleImagePreviews = computed(() => imagePreviewUrls.value.slice(0, 4))
const hiddenImageCount = computed(() => Math.max(0, imagePreviewUrls.value.length - 4))
const galleryClass = computed(() => `image-count-${visibleImagePreviews.value.length}`)
const currentPreviewImage = computed(
  () => imagePreviewUrls.value[previewIndex.value] ?? imagePreviewUrls.value[0] ?? '',
)
const canSave = computed(
  () => !saving.value && title.value.trim().length > 0 && content.value.trim().length > 0,
)
const selectedDurationLabel = computed(
  () => durationOptions.find((option) => option.value === selectedDuration.value)?.label ?? 'No extension',
)
const postStatusLabel = computed(() => {
  if (!post.value) return 'Unavailable'
  return new Date(post.value.expires_at).getTime() > Date.now() ? 'Active' : 'Expired'
})
const postStatusDescription = computed(() => {
  if (!post.value) return 'Load the post to see its status.'
  if (postStatusLabel.value === 'Active') return 'Your post is still visible inside its radius.'
  return 'This post has expired. Extend the lifetime if it should appear again.'
})

function postImageUrls(postData: ApiPost) {
  return postData.image_urls?.length
    ? postData.image_urls
    : postData.image_url
      ? [postData.image_url]
      : []
}

function durationToMs(duration: string) {
  return Number(duration.replace('h', '')) * 60 * 60 * 1000
}

function goBack() {
  router.back()
}

function hydrateEditor(postData: ApiPost) {
  post.value = postData
  title.value = postData.title
  content.value = postData.content
  visibilityRadius.value = postData.visibility_radius
  selectedDuration.value = 'none'
  keptImages.value = postImageUrls(postData)
  clearNewImages()
}

async function loadPost() {
  const postId = Number(route.params.postId)
  if (!Number.isInteger(postId) || postId <= 0) {
    error.value = 'This post link is invalid.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const postData = await postApi.get(postId)
    const ownerId = postData.user?.user_id
    if (!ownerId || ownerId !== currentUserId.value) {
      error.value = 'Only the owner can edit this post.'
      return
    }
    hydrateEditor(postData)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load post.'
  } finally {
    loading.value = false
  }
}

function clearNewImages() {
  newImages.value.forEach((image) => URL.revokeObjectURL(image.url))
  newImages.value = []
  if (imageInput.value) imageInput.value.value = ''
}

function removeImage(index: number) {
  if (index < keptImages.value.length) {
    keptImages.value = keptImages.value.filter((_, imageIndex) => imageIndex !== index)
    return
  }

  const newImageIndex = index - keptImages.value.length
  const removed = newImages.value[newImageIndex]
  if (removed) URL.revokeObjectURL(removed.url)
  newImages.value = newImages.value.filter((_, imageIndex) => imageIndex !== newImageIndex)
}

function clearAllImages() {
  keptImages.value = []
  clearNewImages()
}

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return

  const remainingSlots = maxImages - imagePreviewUrls.value.length
  if (remainingSlots <= 0) {
    saveError.value = `You can attach up to ${maxImages} images.`
    input.value = ''
    return
  }

  const invalidFile = files.find((file) => !allowedImageTypes.includes(file.type))
  if (invalidFile) {
    saveError.value = 'Choose JPEG, PNG, or WebP images only.'
    input.value = ''
    return
  }

  const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024)
  if (oversizedFile) {
    saveError.value = 'Each image must be smaller than 5 MB.'
    input.value = ''
    return
  }

  const selectedFiles = files.slice(0, remainingSlots)
  newImages.value = [
    ...newImages.value,
    ...selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
  ]
  saveError.value =
    files.length > remainingSlots
      ? `Only ${remainingSlots} image${remainingSlots === 1 ? '' : 's'} added because the post allows ${maxImages}.`
      : ''
  input.value = ''
}

function openPreview(index: number) {
  previewIndex.value = index
  previewOpen.value = true
}

function closePreview() {
  previewOpen.value = false
}

function showPreviousImage() {
  previewIndex.value =
    (previewIndex.value - 1 + imagePreviewUrls.value.length) % imagePreviewUrls.value.length
}

function showNextImage() {
  previewIndex.value = (previewIndex.value + 1) % imagePreviewUrls.value.length
}

async function saveChanges() {
  if (!post.value || !canSave.value) return

  saving.value = true
  saveError.value = ''

  try {
    const payload = {
      title: title.value.trim(),
      content: content.value.trim(),
      visibility_radius: visibilityRadius.value,
      keep_image_urls: keptImages.value,
      ...(selectedDuration.value === 'none'
        ? {}
        : {
            expires_at: new Date(
              Date.now() + durationToMs(selectedDuration.value),
            ).toISOString(),
          }),
    }
    const updated = await postApi.update(
      post.value.post_id,
      payload,
      newImages.value.map((image) => image.file),
    )
    clearNewImages()
    hydrateEditor({ ...updated, user: updated.user ?? post.value.user })
    await router.replace(`/posts/${updated.post_id}`)
  } catch (err: unknown) {
    saveError.value = err instanceof Error ? err.message : 'Failed to update post.'
  } finally {
    saving.value = false
  }
}

onMounted(loadPost)
onBeforeUnmount(clearNewImages)
</script>

<style scoped>
.edit-post-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #20384c;
}

.page-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 22px clamp(16px, 3vw, 40px) 64px;
}

.page-heading {
  max-width: 880px;
  margin-bottom: 22px;
}

.back-button,
.add-image-button,
.image-summary button,
.secondary-action,
.save-action,
.option-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  font: inherit;
}

.back-button {
  gap: 7px;
  margin-bottom: 14px;
  background: transparent;
  padding: 0;
  color: #687f92;
  font-size: 0.76rem;
  font-weight: 800;
}

.back-button svg,
.eyebrow svg,
.author-row svg,
.add-image-button svg,
.save-action svg {
  width: 16px;
  height: 16px;
}

.eyebrow,
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #0e7c86;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 7px 0 0;
  color: #14263b;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1;
}

.page-heading p,
.section-header p,
.side-card p {
  color: #71869a;
  font-size: 0.9rem;
  line-height: 1.65;
}

.page-heading p {
  max-width: 620px;
  margin: 12px 0 0;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: 18px;
  align-items: start;
}

.post-editor-card,
.side-card,
.state-card {
  border: 1px solid #e0e9ef;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(42, 67, 83, 0.045);
}

.post-editor-card {
  padding: 22px;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 20px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
}

.author-row > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.author-row strong {
  color: #17384a;
  font-size: 0.98rem;
}

.author-row span:not(.section-label) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #7c94a6;
  font-size: 0.78rem;
  font-weight: 700;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #29475a;
  font-size: 0.78rem;
  font-weight: 850;
}

.field-heading small {
  color: #9aaaba;
  font-size: 0.7rem;
}

.field-group input,
.field-group textarea {
  width: 100%;
  border: 1px solid #dfe9ef;
  border-radius: 16px;
  background: #f8fbfd;
  color: #20384c;
  font: inherit;
  font-size: 0.95rem;
  outline: 0;
  padding: 13px 15px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.field-group textarea {
  resize: vertical;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: #0f8179;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(15, 129, 121, 0.12);
}

.image-section {
  margin: 20px 0;
  border: 1px solid #e2ebf1;
  border-radius: 18px;
  background: #f8fbfd;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-header h2,
.side-card h2 {
  margin: 5px 0 0;
  color: #17384a;
  font-size: 1.05rem;
  font-weight: 850;
}

.section-header p,
.side-card p {
  margin: 6px 0 0;
}

.add-image-button {
  gap: 7px;
  align-self: flex-start;
  border-radius: 12px;
  background: #0f8179;
  color: #fff;
  padding: 10px 13px;
  font-size: 0.78rem;
  font-weight: 850;
}

.add-image-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.editable-gallery {
  overflow: hidden;
  border: 1px solid #dce6ee;
  border-radius: 17px;
  background: #e9eff4;
}

.editable-gallery.image-count-2,
.editable-gallery.image-count-3,
.editable-gallery.image-count-4 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
}

.gallery-tile {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: zoom-in;
}

.image-count-3 .gallery-tile:first-child {
  grid-row: span 2;
}

.gallery-tile img {
  display: block;
  width: 100%;
  height: clamp(270px, 42vw, 520px);
  object-fit: cover;
  object-position: center;
}

.image-count-2 .gallery-tile img,
.image-count-3 .gallery-tile img,
.image-count-4 .gallery-tile img {
  height: clamp(190px, 24vw, 320px);
}

.image-count-3 .gallery-tile:first-child img {
  height: 100%;
  min-height: clamp(383px, 48vw, 643px);
}

.preview-chip,
.more-overlay,
.remove-image {
  position: absolute;
}

.preview-chip {
  left: 12px;
  bottom: 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  padding: 7px 10px;
  font-size: 0.7rem;
  font-weight: 850;
}

.more-overlay {
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.58);
  color: #fff;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 900;
}

.remove-image {
  top: 10px;
  right: 10px;
  display: inline-grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  color: #fff;
  cursor: pointer;
}

.remove-image svg {
  width: 17px;
  height: 17px;
}

.empty-gallery {
  display: flex;
  width: 100%;
  min-height: 230px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed #bfd4df;
  border-radius: 17px;
  background: #fff;
  color: #6f899b;
  cursor: pointer;
}

.empty-gallery svg {
  width: 34px;
  height: 34px;
  color: #0f8179;
}

.empty-gallery strong {
  color: #27475a;
}

.image-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: #7f94a5;
  font-size: 0.78rem;
  font-weight: 750;
}

.image-summary button {
  background: transparent;
  color: #be3b4a;
  font-size: 0.78rem;
  font-weight: 850;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.setting-card {
  border: 1px solid #e2ebf1;
  border-radius: 18px;
  background: #fff;
  padding: 15px;
}

.setting-icon,
.side-icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #edf8f7;
  color: #0f8179;
  margin-bottom: 10px;
}

.setting-icon svg,
.side-icon svg {
  width: 19px;
  height: 19px;
}

.setting-card strong {
  display: block;
  margin-top: 4px;
  color: #17384a;
  font-size: 0.94rem;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.option-row button {
  border-radius: 10px;
  background: #edf3f7;
  color: #627c8e;
  padding: 8px 11px;
  font-size: 0.78rem;
  font-weight: 850;
}

.option-row button.selected {
  background: #0f8179;
  color: #fff;
}

.save-error {
  margin: 16px 0 0;
  border-radius: 14px;
  background: #fff1f2;
  color: #be123c;
  padding: 12px 14px;
  font-size: 0.82rem;
  font-weight: 800;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.secondary-action,
.save-action {
  gap: 8px;
  border-radius: 13px;
  padding: 12px 18px;
  font-size: 0.84rem;
  font-weight: 850;
}

.secondary-action {
  background: #edf3f7;
  color: #587083;
}

.save-action {
  background: #0f8179;
  color: #fff;
}

.save-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spinner,
.loading-mark {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.state-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px;
}

.state-card h2 {
  margin: 0;
  color: #17384a;
}

.state-card p {
  margin: 5px 0 0;
  color: #71869a;
}

.error-state {
  border-color: #fecdd3;
}

.error-state > svg {
  width: 38px;
  height: 38px;
  color: #e11d48;
}

.error-state a {
  margin-left: auto;
  border-radius: 12px;
  background: #0f8179;
  color: #fff;
  padding: 10px 14px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 850;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.side-card {
  padding: 18px;
}

.image-modal {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.92);
  padding: 24px;
}

.image-modal img {
  max-width: min(96vw, 1500px);
  max-height: 92vh;
  object-fit: contain;
  border-radius: 10px;
}

.modal-close,
.modal-nav,
.image-counter {
  position: fixed;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
}

.modal-close,
.modal-nav {
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.modal-close {
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
}

.modal-nav {
  top: 50%;
  width: 46px;
  height: 46px;
  transform: translateY(-50%);
}

.modal-nav.prev {
  left: 18px;
}

.modal-nav.next {
  right: 18px;
}

.image-counter {
  bottom: 18px;
  left: 50%;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 850;
  transform: translateX(-50%);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .workspace {
    padding: 20px 14px calc(88px + env(safe-area-inset-bottom));
  }

  .post-editor-card {
    padding: 16px;
  }

  .section-header,
  .form-actions,
  .image-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .gallery-tile img {
    height: clamp(220px, 72vw, 360px);
  }

  .image-count-2 .gallery-tile img,
  .image-count-3 .gallery-tile img,
  .image-count-4 .gallery-tile img {
    height: clamp(155px, 40vw, 230px);
  }

  .image-count-3 .gallery-tile:first-child img {
    min-height: clamp(313px, 80vw, 463px);
  }
}
</style>
