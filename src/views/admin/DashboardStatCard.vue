<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600 mb-2">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ value }}</p>
      </div>
      <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', getBackgroundColor(color)]">
        <component :is="getIcon(icon)" :class="['w-6 h-6', getIconColor(color)]" />
      </div>
    </div>
    <p v-if="trend" class="mt-4 text-xs text-gray-500">
      <span :class="[trend > 0 ? 'text-green-600' : 'text-red-600', 'font-medium']">
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </span>
      from last period
    </p>
  </div>
</template>

<script setup>
import {
  Flag,
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    default: 'alert-circle',
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['red', 'blue', 'green', 'orange', 'purple'].includes(value),
  },
  trend: {
    type: Number,
    default: null,
  },
})

const getIcon = (iconName) => {
  const icons = {
    flag: Flag,
    users: Users,
    'user-check': UserCheck,
    'trending-up': TrendingUp,
    'alert-circle': AlertCircle,
    'check-circle': CheckCircle,
  }
  return icons[iconName] || AlertCircle
}

const getIconColor = (color) => {
  const colors = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  }
  return colors[color] || 'text-blue-600'
}

const getBackgroundColor = (color) => {
  const colors = {
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
  }
  return colors[color] || 'bg-blue-50'
}
</script>
