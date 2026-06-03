<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <AlertCircle class="w-5 h-5 text-red-500" />
      Quick Moderation
    </h3>

    <form @submit.prevent="submitModerationAction" class="space-y-4">
      <!-- User/Content ID Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Content/User ID
        </label>
        <input
          v-model="form.targetId"
          type="text"
          placeholder="Enter user or content ID"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          required
        />
      </div>

      <!-- Action Type Select -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Action
        </label>
        <select
          v-model="form.actionType"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
          required
        >
          <option value="">Select action...</option>
          <option value="warn">Warn User</option>
          <option value="mute">Mute User</option>
          <option value="suspend">Suspend User</option>
          <option value="remove">Remove Content</option>
          <option value="ban">Ban User</option>
        </select>
      </div>

      <!-- Reason -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Reason (optional)
        </label>
        <textarea
          v-model="form.reason"
          placeholder="Explanation for this action"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
          rows="3"
        ></textarea>
      </div>

      <!-- Duration (if applicable) -->
      <div v-if="['mute', 'suspend'].includes(form.actionType)">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Duration
        </label>
        <select
          v-model="form.duration"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
        >
          <option value="1h">1 Hour</option>
          <option value="24h">24 Hours</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
          <option value="permanent">Permanent</option>
        </select>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
      >
        <span v-if="!isSubmitting" class="flex items-center gap-2">
          <Send class="w-4 h-4" />
          Apply Action
        </span>
        <span v-else>Processing...</span>
      </button>
    </form>

    <!-- Success Message -->
    <transition name="fade">
      <div
        v-if="successMessage"
        class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
      >
        <CheckCircle class="w-4 h-4 text-green-600" />
        <p class="text-sm text-green-700">{{ successMessage }}</p>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="fade">
      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 text-red-600" />
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AlertCircle, Send, CheckCircle } from 'lucide-vue-next'

const emit = defineEmits(['action'])

const form = ref({
  targetId: '',
  actionType: '',
  reason: '',
  duration: '24h',
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const submitModerationAction = async () => {
  if (!form.value.targetId || !form.value.actionType) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // TODO: Replace with actual API call
    const action = {
      targetId: form.value.targetId,
      type: form.value.actionType,
      reason: form.value.reason,
      duration: form.value.duration,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    emit('action', action)

    // Show success message
    successMessage.value = `Action "${form.value.actionType}" applied successfully!`

    // Reset form
    form.value = {
      targetId: '',
      actionType: '',
      reason: '',
      duration: '24h',
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while applying the action'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
