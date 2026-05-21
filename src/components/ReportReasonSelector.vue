<template>
  <div class="report-reason-selector">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-1">Report Reasons</h3>
      <p class="text-sm text-gray-500">Select up to 3 reasons for this report</p>
    </div>

    <!-- Selection counter -->
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">Selected: {{ selectedReasonIds.length }} / 3</span>
      <div class="flex gap-1">
        <div v-for="i in 3" :key="i" 
          :class="[
            'w-2 h-2 rounded-full transition-all',
            i <= selectedReasonIds.length ? 'bg-teal-500' : 'bg-gray-200'
          ]"
        />
      </div>
    </div>

    <!-- Reason categories -->
    <div class="grid grid-cols-1 gap-3">
      <button
        v-for="reason in availableReasons"
        :key="reason.id"
        @click="toggleReason(reason.id)"
        :disabled="!isReasonSelected(reason.id) && selectedReasonIds.length >= 3"
        :class="[
          'flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 ease-out text-left group',
          isReasonSelected(reason.id)
            ? 'border-teal-500 bg-teal-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200'
        ]"
      >
        <!-- Icon -->
        <div
          :class="[
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
            isReasonSelected(reason.id)
              ? 'bg-teal-100 text-teal-600'
              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-disabled:bg-gray-100'
          ]"
        >
          <component :is="reason.icon" class="w-5 h-5" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p
            :class="[
              'font-semibold transition-colors duration-200',
              isReasonSelected(reason.id) ? 'text-teal-700' : 'text-gray-800 group-hover:text-gray-900'
            ]"
          >
            {{ reason.label }}
          </p>
          <p
            :class="[
              'text-sm mt-1 transition-colors duration-200',
              isReasonSelected(reason.id) ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-600'
            ]"
          >
            {{ reason.description }}
          </p>
        </div>

        <!-- Checkbox indicator -->
        <div
          :class="[
            'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
            isReasonSelected(reason.id)
              ? 'border-teal-500 bg-teal-500'
              : 'border-gray-300 group-hover:border-gray-400 group-disabled:border-gray-200'
          ]"
        >
          <Check v-if="isReasonSelected(reason.id)" class="w-3 h-3 text-white" />
        </div>
      </button>
    </div>

    <!-- Max selected message -->
    <Transition name="slide-down">
      <div
        v-if="selectedReasonIds.length >= 3"
        class="mt-4 flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
      >
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        <span>Maximum 3 reasons selected. Click a reason to deselect it.</span>
      </div>
    </Transition>

    <!-- Custom reason input - Show when "Other" is selected -->
    <Transition name="expand">
      <div v-if="isOtherSelected" class="mt-6 pt-4 border-t border-gray-200">
        <label class="block mb-3">
          <span class="text-sm font-medium text-gray-700 mb-2 block">Please describe the issue:</span>
          <textarea
            v-model="customReasonText"
            placeholder="Provide details about why you're reporting this..."
            class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            rows="4"
          />
        </label>
      </div>
    </Transition>

    <!-- Error message -->
    <Transition name="slide-down">
      <div
        v-if="errorMessage"
        class="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
      >
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <!-- Submit Button -->
    <button
      @click="handleSubmitClick"
      :disabled="isSubmitDisabled || isSubmitting"
      :class="[
        'mt-6 w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2',
        errorMessage
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
      ]"
    >
      <span v-if="isSubmitting" class="flex items-center gap-2">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Submitting...
      </span>
      <span v-else>Submit Report</span>
    </button>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      ref="confirmDialog"
      title="Confirm Report"
      message="Are you sure you want to submit this report? This action cannot be undone."
      confirm-label="Submit Report"
      cancel-label="Cancel"
      confirm-variant="danger"
      @confirm="handleSubmit"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import {
  AlertTriangle,
  Flame,
  MessageSquare,
  Heart,
  Shield,
  Copy,
  UserX,
  Clock,
  Eye,
  AlertCircle,
  Check,
} from 'lucide-vue-next'

// Props
interface Props {
  reportType?: 'post' | 'user' | 'comment'
  modelValue?: string[] | null
  allowCustomReason?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reportType: 'post',
  modelValue: null,
  allowCustomReason: true,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'reasonSelected': [reasons: ReportReason[]]
  'submit': [data: { reasonIds: string[], reasons: ReportReason[], customDetails: string | null }]
  'success': [message: string]
}>()

// Types
interface ReportReason {
  id: string
  label: string
  description: string
  icon: any
  category: string
  applicableTo: ('post' | 'user' | 'comment')[]
}

// Reason definitions
const reasonsMap: Record<string, ReportReason> = {
  // Inappropriate content
  explicit: {
    id: 'explicit_content',
    label: 'Explicit/Adult Content',
    description: 'Contains sexually explicit material',
    icon: AlertTriangle,
    category: 'content',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Harassment
  harassment: {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeted harassment or bullying behavior',
    icon: Flame,
    category: 'behavior',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Hate speech
  hateSpeech: {
    id: 'hate_speech',
    label: 'Hate Speech',
    description: 'Offensive language targeting protected groups',
    icon: MessageSquare,
    category: 'behavior',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Spam
  spam: {
    id: 'spam',
    label: 'Spam',
    description: 'Repetitive, unwanted, or commercial content',
    icon: Copy,
    category: 'content',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Misinformation
  misinformation: {
    id: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information',
    icon: AlertCircle,
    category: 'content',
    applicableTo: ['post', 'comment'],
  },

  // Impersonation
  impersonation: {
    id: 'impersonation',
    label: 'Impersonation',
    description: 'Pretending to be someone else or a fake account',
    icon: UserX,
    category: 'account',
    applicableTo: ['user'],
  },

  // Privacy violation
  privacy: {
    id: 'privacy_violation',
    label: 'Privacy Violation',
    description: 'Sharing private information without consent',
    icon: Eye,
    category: 'content',
    applicableTo: ['post', 'comment'],
  },

  // Violent content
  violence: {
    id: 'violent_content',
    label: 'Violent Content',
    description: 'Promotes or glorifies violence',
    icon: Shield,
    category: 'content',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Self-harm
  selfHarm: {
    id: 'self_harm',
    label: 'Self-Harm Content',
    description: 'Promotes or encourages self-harm or suicide',
    icon: Heart,
    category: 'safety',
    applicableTo: ['post', 'comment'],
  },

  // Illegal activity
  illegal: {
    id: 'illegal_activity',
    label: 'Illegal Activity',
    description: 'Promotes or facilitates illegal activity',
    icon: AlertTriangle,
    category: 'safety',
    applicableTo: ['post', 'comment', 'user'],
  },

  // Intellectual property
  copyright: {
    id: 'copyright_violation',
    label: 'Copyright/IP Violation',
    description: 'Infringes on intellectual property rights',
    icon: Shield,
    category: 'legal',
    applicableTo: ['post'],
  },

  // Off-topic
  offTopic: {
    id: 'off_topic',
    label: 'Off-Topic',
    description: 'Irrelevant to the community or discussion',
    icon: Clock,
    category: 'content',
    applicableTo: ['post', 'comment'],
  },

  // Other
  other: {
    id: 'other',
    label: 'Other',
    description: 'Something else not listed above',
    icon: AlertCircle,
    category: 'other',
    applicableTo: ['post', 'comment', 'user'],
  },
}

// State
const selectedReasonIds = ref<string[]>(props.modelValue ?? [])
const customReasonText = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

// Computed
const availableReasons = computed(() => {
  return Object.values(reasonsMap).filter((reason) =>
    reason.applicableTo.includes(props.reportType)
  )
})

const selectedReasons = computed(() => {
  return selectedReasonIds.value
    .map(id => Object.values(reasonsMap).find(r => r.id === id))
    .filter(Boolean) as ReportReason[]
})

const isOtherSelected = computed(() => {
  return selectedReasonIds.value.includes('other')
})

const isSubmitDisabled = computed(() => {
  // Disabled if no reasons selected
  if (selectedReasonIds.value.length === 0) return true
  // Disabled if "Other" is selected but no text provided
  if (isOtherSelected.value && !customReasonText.value.trim()) return true
  return false
})

function isReasonSelected(reasonId: string): boolean {
  return selectedReasonIds.value.includes(reasonId)
}

function toggleReason(reasonId: string) {
  if (isReasonSelected(reasonId)) {
    // Untick - remove from selection
    selectedReasonIds.value = selectedReasonIds.value.filter(id => id !== reasonId)
  } else {
    // Tick - add if under limit
    if (selectedReasonIds.value.length < 3) {
      selectedReasonIds.value.push(reasonId)
    }
  }
  errorMessage.value = ''
  emit('update:modelValue', selectedReasonIds.value)
  emit('reasonSelected', selectedReasons.value)
}

function getReasonLabel(reasonId: string): string {
  const reason = Object.values(reasonsMap).find(r => r.id === reasonId)
  return reason?.label ?? ''
}

function handleSubmitClick() {
  if (selectedReasonIds.value.length === 0) {
    errorMessage.value = 'Please select at least one reason'
    return
  }

  if (isOtherSelected.value && !customReasonText.value.trim()) {
    errorMessage.value = 'Please provide details for "Other" reason'
    return
  }

  confirmDialog.value?.open()
}

function handleSubmit() {
  if (selectedReasonIds.value.length === 0) {
    errorMessage.value = 'Please select at least one reason'
    return
  }

  if (isOtherSelected.value && !customReasonText.value.trim()) {
    errorMessage.value = 'Please provide details for "Other" reason'
    return
  }
  
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const reportData = {
    reasonIds: selectedReasonIds.value,
    reasons: selectedReasons.value,
    customDetails: isOtherSelected.value ? customReasonText.value : null,
  }

  emit('submit', reportData)
}

// Expose methods
defineExpose({
  getSelectedReasons: () => selectedReasons.value,
  getCustomReason: () => (isOtherSelected.value ? customReasonText.value : null),
  getFullReason: () => ({
    reasonIds: selectedReasonIds.value,
    reasons: selectedReasons.value,
    customDetails: isOtherSelected.value ? customReasonText.value : null,
  }),
  setError: (message: string) => {
    errorMessage.value = message
    isSubmitting.value = false
    successMessage.value = ''
  },
  setSuccess: (message: string = 'Report submitted successfully!') => {
    successMessage.value = message
    isSubmitting.value = false
    errorMessage.value = ''
    emit('success', message)
  },
  setLoading: (loading: boolean) => {
    isSubmitting.value = loading
    if (loading) {
      errorMessage.value = ''
      successMessage.value = ''
    }
  },
  reset: () => {
    selectedReasonIds.value = []
    customReasonText.value = ''
    errorMessage.value = ''
    successMessage.value = ''
    isSubmitting.value = false
  },
})
</script>

<style scoped>
/* Transition animations */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
