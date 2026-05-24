<template>
  <!-- Block Confirmation Dialog -->
  <ConfirmDialog
    ref="blockDialog"
    title="Block User"
    message="Are you sure you want to block this user? You won't see their posts or interactions in your feed anymore."
    :confirm-label="blockLoading ? 'Blocking...' : 'Block'"
    cancel-label="Cancel"
    confirm-variant="danger"
    @confirm="confirmBlock"
  />

  <!-- Toast Notification -->
  <Toast ref="successToast" title="User blocked successfully" type="success" />
  <Toast ref="errorToast" title="Failed to block user" message="Please try again." type="error" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import Toast from './Toast.vue'

interface Props {
  userId: string | number
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
    // TODO: Implement API call for blocking user
    // await userApi.block(props.userId)
    successToast.value?.open()
    emit('blocked')
  } catch (error) {
    console.error('Failed to block user:', error)
    errorToast.value?.open()
    emit('error', error instanceof Error ? error : new Error('Failed to block user'))
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
