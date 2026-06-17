<template>
  <div
    v-if="imageList.length"
    class="post-image-viewer"
    :class="[`post-image-viewer--${variant}`, `image-count-${visibleImages.length}`]"
  >
    <button
      v-for="(image, index) in visibleImages"
      :key="`${image}-${index}`"
      type="button"
      class="preview-button"
      :aria-label="`View image ${index + 1} of ${imageList.length}: ${alt}`"
      @click.stop="open(index)"
    >
      <img :src="image" :alt="alt" class="preview-image" loading="lazy" />
      <span v-if="index === visibleImages.length - 1 && hiddenCount > 0" class="more-overlay">
        +{{ hiddenCount }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="image-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="alt"
        @click="close"
      >
        <button type="button" class="close-button" aria-label="Close image" @click="close">
          <X />
        </button>
        <button
          v-if="imageList.length > 1"
          type="button"
          class="nav-button nav-button--prev"
          aria-label="Previous image"
          @click.stop="showPrevious"
        >
          <ChevronLeft />
        </button>
        <img :src="currentImage" :alt="alt" class="full-image" @click.stop />
        <button
          v-if="imageList.length > 1"
          type="button"
          class="nav-button nav-button--next"
          aria-label="Next image"
          @click.stop="showNext"
        >
          <ChevronRight />
        </button>
        <span v-if="imageList.length > 1" class="image-counter">
          {{ activeIndex + 1 }} / {{ imageList.length }}
        </span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    src?: string | null
    images?: string[]
    alt: string
    variant?: 'feed' | 'detail' | 'compact'
  }>(),
  {
    variant: 'feed',
    src: null,
    images: () => [],
  },
)

const isOpen = ref(false)
const activeIndex = ref(0)
let previousBodyOverflow = ''

const imageList = computed(() => {
  const sources = props.images.length > 0 ? props.images : props.src ? [props.src] : []
  return [...new Set(sources.filter(Boolean))]
})
const visibleImages = computed(() => imageList.value.slice(0, 4))
const hiddenCount = computed(() => Math.max(0, imageList.value.length - visibleImages.value.length))
const currentImage = computed(() => imageList.value[activeIndex.value] ?? imageList.value[0] ?? '')

function open(index: number) {
  activeIndex.value = index
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function showPrevious() {
  activeIndex.value = (activeIndex.value - 1 + imageList.value.length) % imageList.value.length
}

function showNext() {
  activeIndex.value = (activeIndex.value + 1) % imageList.value.length
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowLeft' && isOpen.value && imageList.value.length > 1) showPrevious()
  if (event.key === 'ArrowRight' && isOpen.value && imageList.value.length > 1) showNext()
}

watch(isOpen, (openState) => {
  if (openState) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
  } else {
    document.body.style.overflow = previousBodyOverflow
    window.removeEventListener('keydown', handleEscape)
  }
})

onBeforeUnmount(() => {
  if (isOpen.value) {
    document.body.style.overflow = previousBodyOverflow
  }
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.post-image-viewer {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #eef2f5;
}

.post-image-viewer.image-count-2,
.post-image-viewer.image-count-3,
.post-image-viewer.image-count-4 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
}

.preview-button {
  position: relative;
  width: 100%;
  display: block;
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: zoom-in;
}

.image-count-3 .preview-button:first-child {
  grid-row: span 2;
}

.preview-image {
  width: 100%;
  height: clamp(240px, 38vw, 440px);
  display: block;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.25s ease;
}

.image-count-2 .preview-image,
.image-count-3 .preview-image,
.image-count-4 .preview-image {
  height: clamp(190px, 22vw, 310px);
}

.image-count-3 .preview-button:first-child .preview-image {
  height: 100%;
  min-height: clamp(383px, 44vw, 623px);
}

.post-image-viewer--feed {
  height: clamp(320px, 48vh, 460px);
}

.post-image-viewer--feed .preview-button,
.post-image-viewer--feed .preview-image {
  height: 100%;
}

.post-image-viewer--feed.image-count-3 .preview-button:first-child .preview-image {
  min-height: 0;
}

.post-image-viewer--detail .preview-image {
  height: clamp(280px, 48vw, 560px);
}

.post-image-viewer--detail.image-count-2 .preview-image,
.post-image-viewer--detail.image-count-3 .preview-image,
.post-image-viewer--detail.image-count-4 .preview-image {
  height: clamp(230px, 28vw, 370px);
}

.post-image-viewer--detail.image-count-3 .preview-button:first-child .preview-image {
  min-height: clamp(463px, 56vw, 743px);
}

.post-image-viewer--compact .preview-image {
  height: clamp(210px, 32vw, 360px);
}

.preview-button:hover .preview-image {
  transform: scale(1.015);
}

.more-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.58);
  color: #fff;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 900;
}

.image-modal {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.92);
  padding: 24px;
  cursor: zoom-out;
}

.full-image {
  max-width: min(96vw, 1500px);
  max-height: 92vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  cursor: default;
}

.close-button,
.nav-button {
  position: fixed;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  cursor: pointer;
}

.close-button {
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
}

.nav-button {
  top: 50%;
  width: 46px;
  height: 46px;
  transform: translateY(-50%);
}

.nav-button--prev {
  left: 18px;
}

.nav-button--next {
  right: 18px;
}

.image-counter {
  position: fixed;
  bottom: 18px;
  left: 50%;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  padding: 7px 12px;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 850;
  transform: translateX(-50%);
}

.close-button svg {
  width: 22px;
  height: 22px;
}

.nav-button svg {
  width: 24px;
  height: 24px;
}

@media (max-width: 640px) {
  .post-image-viewer--feed {
    height: clamp(240px, 64vw, 360px);
  }

  .preview-image,
  .post-image-viewer--detail .preview-image,
  .post-image-viewer--compact .preview-image {
    height: clamp(220px, 72vw, 360px);
  }

  .image-modal {
    padding: 12px;
  }

  .image-count-2 .preview-image,
  .image-count-3 .preview-image,
  .image-count-4 .preview-image,
  .post-image-viewer--detail.image-count-2 .preview-image,
  .post-image-viewer--detail.image-count-3 .preview-image,
  .post-image-viewer--detail.image-count-4 .preview-image {
    height: clamp(155px, 40vw, 230px);
  }

  .image-count-3 .preview-button:first-child .preview-image,
  .post-image-viewer--detail.image-count-3 .preview-button:first-child .preview-image {
    min-height: clamp(313px, 80vw, 463px);
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-image {
    transition: none;
  }
}
</style>
