<template>
  <Transition name="slide-down">
    <div
      v-if="isVisible"
      class="fixed top-6 right-6 z-50 max-w-sm animate-in"
    >
      <div
        :class="[
          'rounded-lg shadow-lg px-6 py-4 flex items-start gap-3 border',
          variantClasses
        ]"
      >
        <div class="flex-shrink-0 mt-0.5">
          <component :is="iconComponent" class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ title }}</p>
          <p v-if="message" class="text-sm mt-1 opacity-90">{{ message }}</p>
        </div>
        <button
          type="button"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

interface Props {
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  autoClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 4000,
  autoClose: true,
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Info
  }
})

const variantClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-amber-50 border-amber-200 text-amber-800'
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800'
    default:
      return 'bg-green-50 border-green-200 text-green-800'
  }
})

function open() {
  isVisible.value = true
  if (props.autoClose) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

function close() {
  isVisible.value = false
  if (timeoutId) clearTimeout(timeoutId)
  emit('close')
}

defineExpose({
  open,
  close,
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

.animate-in {
  animation: slideInFromTop 0.3s ease;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
