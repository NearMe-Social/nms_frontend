<template>
  <div class="relative">
    <!-- Three dots button -->
    <button
      type="button"
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      @click="toggleDropdown"
    >
      <MoreVertical class="w-5 h-5 text-gray-500" />
    </button>

    <!-- Dropdown menu -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1"
      >
        <button
          type="button"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          @click="handleBlock"
        >
          <Ban class="w-4 h-4 text-red-500" />
          Block Post
        </button>
        <button
          type="button"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          @click="handleReport"
        >
          <Flag class="w-4 h-4 text-red-500" />
          Report Post
        </button>
      </div>
    </Transition>

    <!-- Click outside handler -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />

    <!-- Block Post Dialog Component -->
    <BlockPostDialog ref="blockPostDialog" :post-id="postId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MoreVertical, Flag, Ban } from 'lucide-vue-next'
import BlockPostDialog from './BlockPostDialog.vue'

interface Props {
  postId: string | number
}

const props = defineProps<Props>()

const router = useRouter()
const isOpen = ref(false)
const blockPostDialog = ref<InstanceType<typeof BlockPostDialog>>()

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleBlock() {
  isOpen.value = false
  blockPostDialog.value?.open()
}

function handleReport() {
  isOpen.value = false
  router.push({
    path: '/report/post',
    query: { postId: props.postId }
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
