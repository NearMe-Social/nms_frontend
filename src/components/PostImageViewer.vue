<template>
  <div class="post-image-viewer" :class="`post-image-viewer--${variant}`">
    <button
      type="button"
      class="preview-button"
      :aria-label="`View full image: ${alt}`"
      @click.stop="open"
    >
      <img :src="src" :alt="alt" class="preview-image" loading="lazy" />
      <span class="preview-hint"><Maximize2 /> View image</span>
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
        <img :src="src" :alt="alt" class="full-image" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Maximize2, X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    src: string
    alt: string
    variant?: 'feed' | 'detail' | 'compact'
  }>(),
  {
    variant: 'feed',
  },
)

const isOpen = ref(false)
let previousBodyOverflow = ''

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
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

.preview-image {
  width: 100%;
  height: clamp(240px, 38vw, 440px);
  display: block;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.post-image-viewer--detail .preview-image {
  height: clamp(280px, 48vw, 560px);
}

.post-image-viewer--compact .preview-image {
  height: clamp(210px, 32vw, 360px);
}

.preview-button:hover .preview-image {
  transform: scale(1.015);
}

.preview-hint {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  padding: 7px 10px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.preview-hint svg {
  width: 14px;
  height: 14px;
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

.close-button {
  position: fixed;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  cursor: pointer;
}

.close-button svg {
  width: 22px;
  height: 22px;
}

@media (max-width: 640px) {
  .preview-image,
  .post-image-viewer--detail .preview-image,
  .post-image-viewer--compact .preview-image {
    height: clamp(220px, 72vw, 360px);
  }

  .image-modal {
    padding: 12px;
  }

  .preview-hint {
    right: 9px;
    bottom: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-image {
    transition: none;
  }
}
</style>
