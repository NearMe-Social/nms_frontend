<template>
  <!-- Block Confirmation Dialog -->
  <ConfirmDialog
    ref="blockDialog"
    title="Block Post"
    message="Are you sure you want to block this post? You won't see posts from this user in your feed anymore."
    :confirm-label="blockLoading ? 'Blocking...' : 'Block'"
    cancel-label="Cancel"
    confirm-variant="danger"
    @confirm="confirmBlock"
  />

  <!-- Toast Notification -->
  <Toast ref="successToast" title="Post blocked successfully" type="success" />
  <Toast ref="errorToast" title="Failed to block post" message="Please try again." type="error" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import Toast from './Toast.vue'
import { postApi } from '@/services/api'

interface Props {
  postId: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  blocked: []
  error: [error: Error]
}>()

const blockLoading = ref(false)
const blockDialog = ref<InstanceType<typeof ConfirmDialog>>()
const successToast = ref<InstanceType<typeof Toast>>()
const errorToast = ref<InstanceType<typeof Toast>>()

async function confirmBlock() {
  try {
    blockLoading.value = true
    await postApi.block(props.postId)
    successToast.value?.open()
    emit('blocked')
  } catch (error) {
    console.error('Failed to block post:', error)
    errorToast.value?.open()
    emit('error', error instanceof Error ? error : new Error('Failed to block post'))
  } finally {
    blockLoading.value = false
  }
}

function open() {
  blockDialog.value?.open()
}

defineExpose({
  open,
})
</script>
