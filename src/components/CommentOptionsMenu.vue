<template>
  <div v-if="canReport" class="relative">
    <button
      type="button"
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Comment options"
      @click="toggleDropdown"
    >
      <MoreVertical class="w-5 h-5 text-gray-500" />
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1"
      >
        <button
          type="button"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          @click="handleReport"
        >
          <Flag class="w-4 h-4 text-red-500" />
          Report Comment
        </button>
      </div>
    </Transition>

    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Flag, MoreVertical } from 'lucide-vue-next'

const props = defineProps<{
  commentId?: number | string | null
}>()

const router = useRouter()
const isOpen = ref(false)
const canReport = computed(() => {
  const commentId = Number(props.commentId)
  return Number.isInteger(commentId) && commentId > 0
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleReport() {
  isOpen.value = false
  const commentId = Number(props.commentId)

  if (!Number.isInteger(commentId) || commentId <= 0) return

  router.push({
    path: '/report/comment',
    query: { commentId },
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
