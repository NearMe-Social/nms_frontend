<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="rounded-lg bg-white shadow-xl max-w-sm w-full animate-in">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div v-if="iconComponent" class="flex-shrink-0 w-6 h-6 text-amber-600">
            <component :is="iconComponent" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-4">
          <p class="text-gray-600">{{ message }}</p>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium text-white transition-colors"
            :class="confirmButtonClass"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary' | 'success'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmVariant: 'primary',
  showIcon: true,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = ref(false)

const iconComponent = computed(() => {
  return props.showIcon ? AlertTriangle : null
})

const confirmButtonClass = computed(() => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium text-white transition-colors'
  switch (props.confirmVariant) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700'
    case 'success':
      return 'bg-green-600 hover:bg-green-700'
    default:
      return 'bg-cyan-600 hover:bg-cyan-700'
  }
})

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function handleConfirm() {
  emit('confirm')
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}

defineExpose({
  open,
  close,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-in {
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
