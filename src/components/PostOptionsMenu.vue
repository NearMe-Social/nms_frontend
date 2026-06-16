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
        <template v-if="canManagePost">
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            @click="handleEdit"
          >
            <Pencil class="w-4 h-4 text-teal-600" />
            Edit Post
          </button>
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            @click="handleDelete"
          >
            <Trash2 class="w-4 h-4" />
            Delete Post
          </button>
        </template>
        <button
          v-if="userId && !canManagePost"
          type="button"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          @click="handleBlock"
        >
          <Ban class="w-4 h-4 text-red-500" />
          Block User
        </button>
        <button
          v-if="!canManagePost"
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
    <BlockPostDialog v-if="userId" ref="blockPostDialog" :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { MoreVertical, Flag, Ban, Pencil, Trash2 } from 'lucide-vue-next'
import BlockPostDialog from './BlockPostDialog.vue'
import { postApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface Props {
  postId: string | number
  userId?: string | number | null
  allowOwnerActions?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [postId: number]
  deleted: [postId: number]
}>()

const router = useRouter()
const auth = useAuthStore()
const isOpen = ref(false)
const blockPostDialog = ref<InstanceType<typeof BlockPostDialog>>()
const deleting = ref(false)

const canManagePost = computed(() => {
  if (!props.allowOwnerActions || props.userId === undefined || props.userId === null) return false

  const currentUserId = auth.user?.userId ?? auth.user?.user_id
  return Number(currentUserId) === Number(props.userId)
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleBlock() {
  isOpen.value = false
  blockPostDialog.value?.open()
}

function handleEdit() {
  isOpen.value = false
  emit('edit', Number(props.postId))
}

async function handleDelete() {
  if (deleting.value) return
  isOpen.value = false

  const confirmed = window.confirm('Delete this post? This cannot be undone.')
  if (!confirmed) return

  deleting.value = true
  try {
    await postApi.remove(Number(props.postId))
    emit('deleted', Number(props.postId))
  } finally {
    deleting.value = false
  }
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
