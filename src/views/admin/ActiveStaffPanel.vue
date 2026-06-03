<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <Users class="w-5 h-5 text-blue-500" />
      Active Staff ({{ onlineCount }}/{{ staff.length }})
    </h3>

    <div class="space-y-3">
      <div
        v-for="member in staff"
        :key="member.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center gap-3 flex-1">
          <!-- Status indicator -->
          <div class="relative">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
            >
              {{ getInitials(member.name) }}
            </div>
            <div
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              :class="getStatusColor(member.status)"
            ></div>
          </div>

          <!-- Staff info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ member.name }}</p>
            <p class="text-xs text-gray-500">{{ member.role }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ member.lastActive }}</p>
          </div>
        </div>

        <!-- Status badge -->
        <div class="flex-shrink-0">
          <span
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(member.status)"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="getStatusDotClass(member.status)"
            ></span>
            {{ capitalize(member.status) }}
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="staff.length === 0" class="text-center py-6">
        <Users class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">No active staff members</p>
      </div>
    </div>

    <!-- View all staff link -->
    <button
      class="w-full mt-4 py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    >
      View All Staff
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Users } from 'lucide-vue-next'

const props = defineProps({
  staff: {
    type: Array,
    default: () => [],
  },
})

const onlineCount = computed(() => {
  return props.staff.filter((member) => member.status === 'online').length
})

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const getStatusColor = (status) => {
  const colors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  }
  return colors[status] || 'bg-gray-400'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    online: 'bg-green-50 text-green-700',
    away: 'bg-yellow-50 text-yellow-700',
    offline: 'bg-gray-50 text-gray-700',
  }
  return classes[status] || 'bg-gray-50 text-gray-700'
}

const getStatusDotClass = (status) => {
  const classes = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  }
  return classes[status] || 'bg-gray-400'
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>
