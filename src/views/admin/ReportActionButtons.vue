<template>
  <div class="flex flex-col gap-2">
    <button
      type="button"
      :disabled="loading"
      class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
      @click="$emit('save')"
    >
      <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
      <CheckCircle2 v-else class="w-4 h-4" />
      Save Review Status
    </button>

    <button
      v-if="canModerateTarget"
      type="button"
      :disabled="contentActionLoading"
      class="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
      @click="$emit('remove-target')"
    >
      <Loader2 v-if="contentActionLoading" class="w-4 h-4 animate-spin" />
      <Trash2 v-else class="w-4 h-4" />
      Remove {{ targetLabel }}
    </button>

    <button
      v-if="canModerateUser"
      type="button"
      :disabled="userActionLoading"
      :class="[
        'w-full py-2.5 rounded-xl text-sm font-semibold border active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60',
        targetUserIsActive
          ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
          : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
      ]"
      @click="$emit('toggle-user')"
    >
      <Loader2 v-if="userActionLoading" class="w-4 h-4 animate-spin" />
      <UserX v-else-if="targetUserIsActive" class="w-4 h-4" />
      <UserCheck v-else class="w-4 h-4" />
      {{ targetUserIsActive ? 'Suspend User' : 'Activate User' }}
    </button>

    <button
      type="button"
      class="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all duration-200"
      @click="$emit('back')"
    >
      Back to Reports
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Loader2, Trash2, UserCheck, UserX } from 'lucide-vue-next'

defineProps<{
  loading: boolean
  contentActionLoading: boolean
  userActionLoading: boolean
  canModerateTarget: boolean
  canModerateUser: boolean
  targetLabel: string
  targetUserIsActive: boolean
}>()

defineEmits<{
  save: []
  'remove-target': []
  'toggle-user': []
  back: []
}>()
</script>
