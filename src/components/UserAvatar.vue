<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string | null
    username?: string | null
    alt?: string
  }>(),
  {
    src: null,
    username: 'User',
    alt: '',
  },
)

const imageFailed = ref(false)

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)

const showImage = computed(() => Boolean(props.src) && !imageFailed.value)
const initial = computed(() => props.username?.trim().charAt(0).toUpperCase() || 'U')
const hue = computed(() => {
  let hash = 0
  for (const character of props.username || 'User') {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }
  return Math.abs(hash) % 360
})
</script>

<template>
  <span
    class="user-avatar"
    :style="{ '--avatar-hue': hue }"
    :aria-label="alt || `${username} profile`"
  >
    <img
      v-if="showImage"
      :src="src || ''"
      :alt="alt || `${username} profile`"
      @error="imageFailed = true"
    />
    <span v-else aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
  background: hsl(var(--avatar-hue) 38% 90%);
  color: hsl(var(--avatar-hue) 55% 30%);
  font-size: 1rem;
  font-weight: 850;
  line-height: 1;
  text-transform: uppercase;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.user-avatar > span {
  font-size: inherit;
}
</style>
